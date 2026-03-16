"""
tft_predictor.py

Loads the three saved TFT models (1d / 3d / 5d) and runs inference
on a prepared dataframe to return transition risk probabilities.

Expected input:  a dataframe that already has the full feature pipeline
                 applied — same columns produced by pipeline.py before
                 this function is called.

Output:
    {
        "1d": 0.12,   # probability of entering High regime within 1 day
        "3d": 0.31,   # within 3 days
        "5d": 0.44    # within 5 days
    }

This module never retrains. It only loads weights and runs a forward pass.
Retraining happens in notebook 06 and is a separate manual step.
"""

from __future__ import annotations

import warnings
warnings.filterwarnings("ignore")

from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import torch

from pytorch_forecasting import TimeSeriesDataSet
from pytorch_forecasting.data.encoders import NaNLabelEncoder
from pytorch_forecasting.models import TemporalFusionTransformer
from pytorch_forecasting.metrics import MAE


# Constants must match notebook 06 exactly


MAX_ENCODER = 30
MAX_PRED    = 1

UNKNOWN_REALS = [
    "return",
    "vol_cc",
    "vol_cc_lag_1",
    "ret_lag_1",
    "ret_lag_5",
    "ret_lag_10",
    "ma_ratio_5",
    "ma_ratio_10",
    "ma_ratio_20",
]

CATEGORICALS = ["hmm_regime"]

HORIZONS = ["1d", "3d", "5d"]

# Minimum rows needed: 30 day encoder window + 1 prediction step + small buffer
MIN_ROWS = MAX_ENCODER + MAX_PRED + 5



# Model loading

def _build_tft_skeleton(dataset: TimeSeriesDataSet) -> TemporalFusionTransformer:
    """
    Builds an empty TFT with the same architecture used in training.
    MAE() is a placeholder — the custom training loop in notebook 06
    never used the built-in loss, so any loss works here for weight loading.
    """
    return TemporalFusionTransformer.from_dataset(
        dataset,
        learning_rate          = 0.01,
        hidden_size            = 16,
        attention_head_size    = 1,
        dropout                = 0.1,
        hidden_continuous_size = 8,
        output_size            = 1,
        loss                   = MAE(),
        log_interval           = -1,
    )


def load_models(
    models_dir: Path,
    device: Optional[torch.device] = None,
) -> dict[str, TemporalFusionTransformer]:
    """
    Load all three saved TFT checkpoints from models/tft/.

    Args:
        models_dir: path to the project models/ directory
        device:     torch device — defaults to cuda if available, else cpu

    Returns:
        dict with keys "1d", "3d", "5d" mapping to loaded TFT models
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    tft_dir = models_dir / "tft"
    models  = {}

    for horizon in HORIZONS:
        ckpt_path = tft_dir / f"tft_target_{horizon}.pt"
        if not ckpt_path.exists():
            raise FileNotFoundError(
                f"Model checkpoint not found: {ckpt_path}\n"
                f"Run notebook 06 to train and save the models first."
            )
        # We need a dataset skeleton to build the architecture.
        # A minimal 1-row dummy df is enough — weights are overwritten immediately.
        dummy_ds = _make_dummy_dataset()
        model    = _build_tft_skeleton(dummy_ds)
        state    = torch.load(ckpt_path, map_location=device)
        model.load_state_dict(state)
        model    = model.to(device).eval()
        models[horizon] = model

    return models


# Dataset construction
def _make_dummy_dataset() -> TimeSeriesDataSet:
    """
    Builds a minimal TimeSeriesDataSet with the correct schema.
    Used only to instantiate the TFT architecture before loading weights.
    The actual data values are irrelevant — the schema (column names,
    encoder types, lengths) is what matters for weight compatibility.
    """
    n = MAX_ENCODER + MAX_PRED + 2
    dummy = pd.DataFrame({
        "time_idx":    list(range(n)),
        "series":      ["DUMMY"] * n,
        "return":      [0.0] * n,
        "vol_cc":      [0.1] * n,
        "vol_cc_lag_1":[0.1] * n,
        "ret_lag_1":   [0.0] * n,
        "ret_lag_5":   [0.0] * n,
        "ret_lag_10":  [0.0] * n,
        "ma_ratio_5":  [1.0] * n,
        "ma_ratio_10": [1.0] * n,
        "ma_ratio_20": [1.0] * n,
        "hmm_regime":  ["Low"] * n,
        "target":      [0] * n,
    })
    return TimeSeriesDataSet(
        dummy,
        time_idx               = "time_idx",
        target                 = "target",
        group_ids              = ["series"],
        max_encoder_length     = MAX_ENCODER,
        max_prediction_length  = MAX_PRED,
        time_varying_unknown_reals      = UNKNOWN_REALS,
        time_varying_known_reals        = ["time_idx"],
        time_varying_known_categoricals = CATEGORICALS,
        target_normalizer      = None,
        categorical_encoders   = {"hmm_regime": NaNLabelEncoder(add_nan=False)},
    )


def _prepare_inference_dataset(df: pd.DataFrame, ticker: str) -> TimeSeriesDataSet:
    """
    Wraps the last MAX_ENCODER+1 rows of df into a TimeSeriesDataSet
    shaped for a single forward-pass prediction.

    We use predict=True here intentionally — at inference time we want
    exactly one output: the prediction for the next step after the last
    known row. This is different from training/evaluation where we need
    all windows.
    """
    df = df.copy().reset_index(drop=True)
    df["time_idx"] = df.index.astype(int)
    df["series"]   = ticker
    df["target"]   = 0  # placeholder — not used at inference

    # keep only the window we need
    window = df.tail(MAX_ENCODER + MAX_PRED).copy().reset_index(drop=True)
    window["time_idx"] = window.index.astype(int)

    dataset = TimeSeriesDataSet(
        window,
        time_idx               = "time_idx",
        target                 = "target",
        group_ids              = ["series"],
        max_encoder_length     = MAX_ENCODER,
        max_prediction_length  = MAX_PRED,
        time_varying_unknown_reals      = UNKNOWN_REALS,
        time_varying_known_reals        = ["time_idx"],
        time_varying_known_categoricals = CATEGORICALS,
        target_normalizer      = None,
        categorical_encoders   = {"hmm_regime": NaNLabelEncoder(add_nan=False)},
        predict_mode           = True,
    )
    return dataset



# Main inference function

def predict_transition_risk(
    df: pd.DataFrame,
    ticker: str,
    models: dict[str, TemporalFusionTransformer],
    device: Optional[torch.device] = None,
) -> dict[str, float]:
    """
    Run inference for all three horizons and return transition probabilities.

    Args:
        df:      prepared dataframe — must contain all UNKNOWN_REALS columns
                 plus "hmm_regime". At least MIN_ROWS rows required.
        ticker:  ETF ticker string, used as the group_id label
        models:  dict returned by load_models()
        device:  torch device — defaults to cuda if available, else cpu

    Returns:
        dict with float probabilities, e.g.:
        {"1d": 0.12, "3d": 0.31, "5d": 0.44}

    Raises:
        ValueError if df has too few rows or missing required columns
    """
    if device is None:
        device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    _validate_input(df)

    dataset    = _prepare_inference_dataset(df, ticker)
    dataloader = dataset.to_dataloader(train=False, batch_size=1, num_workers=0)
    batch      = next(iter(dataloader))
    x, _       = batch

    # move all tensor inputs to device
    x = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in x.items()}

    results = {}
    with torch.no_grad():
        for horizon, model in models.items():
            model.eval()
            out    = model(x)
            logit  = out["prediction"].squeeze()
            prob   = torch.sigmoid(logit).item()
            # clamp to avoid floating point edge cases at 0.0 / 1.0
            results[horizon] = round(float(np.clip(prob, 0.001, 0.999)), 4)

    return results


# Input validation

def _validate_input(df: pd.DataFrame) -> None:
    """Check the dataframe has everything the model needs."""
    required = set(UNKNOWN_REALS + CATEGORICALS)
    missing  = required - set(df.columns)
    if missing:
        raise ValueError(
            f"Input dataframe is missing required columns: {sorted(missing)}"
        )

    if len(df) < MIN_ROWS:
        raise ValueError(
            f"Need at least {MIN_ROWS} rows for a 30-day encoder window. "
            f"Got {len(df)}."
        )

    valid_regimes = {"Low", "Medium", "High"}
    actual_values = set(df["hmm_regime"].dropna().unique())
    bad_values    = actual_values - valid_regimes
    if bad_values:
        raise ValueError(
            f"hmm_regime column contains unexpected values: {bad_values}. "
            f"Expected one of {valid_regimes}."
        )


# Convenience wrapper — load once, predict many

class TFTPredictor:
    """
    Stateful wrapper that loads models once and exposes a simple
    predict() method. Use this in pipeline.py to avoid reloading
    weights for every ticker.

    Usage:
        predictor = TFTPredictor(models_dir=PROJECT_ROOT / "models")

        for ticker, df in prepared_data.items():
            risk = predictor.predict(df, ticker)
            print(risk)
            # {"1d": 0.08, "3d": 0.24, "5d": 0.39}
    """

    def __init__(self, models_dir: Path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.models = load_models(models_dir, device=self.device)
        print(
            f"TFTPredictor ready — device: {self.device}, "
            f"horizons: {list(self.models.keys())}"
        )

    def predict(self, df: pd.DataFrame, ticker: str) -> dict[str, float]:
        """
        Returns transition risk probabilities for one ticker.

        Args:
            df:     full prepared dataframe for the ticker
            ticker: string identifier, e.g. "NIFTYBEES.NS"

        Returns:
            {"1d": float, "3d": float, "5d": float}
        """
        return predict_transition_risk(
            df      = df,
            ticker  = ticker,
            models  = self.models,
            device  = self.device,
        )