"""
tft_predictor.py
Loads per-ticker TFT models and runs inference.

Each ticker has its own model folder: models/{TICKER_CLEAN}/
containing tft_target_1d.pt, tft_target_3d.pt, tft_target_5d.pt

Output per ticker:
    {"1d": 0.12, "3d": 0.31, "5d": 0.44}
"""

from __future__ import annotations

import warnings
warnings.filterwarnings("ignore")

import json
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import torch

from pytorch_forecasting import TimeSeriesDataSet
from pytorch_forecasting.data.encoders import NaNLabelEncoder
from pytorch_forecasting.models import TemporalFusionTransformer
from pytorch_forecasting.metrics import MAE


MAX_ENCODER = 30
MAX_PRED = 1
MIN_ROWS = MAX_ENCODER + MAX_PRED + 5

UNKNOWN_REALS = [
    "return", "vol_cc", "vol_cc_lag_1",
    "ret_lag_1", "ret_lag_5", "ret_lag_10",
    "ma_ratio_5", "ma_ratio_10", "ma_ratio_20",
]
HORIZONS = ["1d", "3d", "5d"]


def _ticker_to_folder(ticker: str) -> str:
    return ticker.replace(".", "_")


def _make_dummy_dataset() -> TimeSeriesDataSet:
    n = MAX_ENCODER + MAX_PRED + 2
    dummy = pd.DataFrame({
        "time_idx": list(range(n)),
        "series": ["DUMMY"] * n,
        "return": [0.0] * n,
        "vol_cc": [0.1] * n,
        "vol_cc_lag_1": [0.1] * n,
        "ret_lag_1": [0.0] * n,
        "ret_lag_5": [0.0] * n,
        "ret_lag_10": [0.0] * n,
        "ma_ratio_5": [1.0] * n,
        "ma_ratio_10": [1.0] * n,
        "ma_ratio_20": [1.0] * n,
        "hmm_regime": (["Low", "Medium", "High"] * (n // 3 + 1))[:n],
        "target": [0] * n,
    })
    return TimeSeriesDataSet(
        dummy,
        time_idx="time_idx",
        target="target",
        group_ids=["series"],
        max_encoder_length=MAX_ENCODER,
        max_prediction_length=MAX_PRED,
        time_varying_unknown_reals=UNKNOWN_REALS,
        time_varying_known_reals=["time_idx"],
        time_varying_known_categoricals=["hmm_regime"],
        target_normalizer=None,
        categorical_encoders={"hmm_regime": NaNLabelEncoder(add_nan=False)},
    )


def _build_skeleton(dataset: TimeSeriesDataSet) -> TemporalFusionTransformer:
    return TemporalFusionTransformer.from_dataset(
        dataset,
        learning_rate=0.01,
        hidden_size=16,
        attention_head_size=1,
        dropout=0.1,
        hidden_continuous_size=8,
        output_size=1,
        loss=MAE(),
        log_interval=-1,
    )


def load_ticker_models(
    ticker: str,
    models_dir: Path,
    device: torch.device,
) -> dict[str, TemporalFusionTransformer]:
    folder = models_dir / _ticker_to_folder(ticker)
    dummy_ds = _make_dummy_dataset()
    models = {}
    for horizon in HORIZONS:
        path = folder / f"tft_target_{horizon}.pt"
        if not path.exists():
            raise FileNotFoundError(
                f"No model at {path}. Run notebook 07 for this ticker."
            )
        model = _build_skeleton(dummy_ds)
        model.load_state_dict(torch.load(path, map_location=device))
        model = model.to(device).eval()
        models[horizon] = model
    return models


def _prepare_inference_dataset(df: pd.DataFrame, ticker: str) -> TimeSeriesDataSet:
    df = df.copy().reset_index(drop=True)
    df["time_idx"] = df.index.astype(int)
    df["series"] = ticker
    df["target"] = 0

    window = df.tail(MAX_ENCODER + MAX_PRED).copy().reset_index(drop=True)
    window["time_idx"] = window.index.astype(int)

    return TimeSeriesDataSet(
        window,
        time_idx="time_idx",
        target="target",
        group_ids=["series"],
        max_encoder_length=MAX_ENCODER,
        max_prediction_length=MAX_PRED,
        time_varying_unknown_reals=UNKNOWN_REALS,
        time_varying_known_reals=["time_idx"],
        time_varying_known_categoricals=["hmm_regime"],
        target_normalizer=None,
        categorical_encoders={"hmm_regime": NaNLabelEncoder(add_nan=False)},
        predict_mode=True,
    )


def _validate_input(df: pd.DataFrame) -> None:
    missing = set(UNKNOWN_REALS + ["hmm_regime"]) - set(df.columns)
    if missing:
        raise ValueError(f"Missing columns: {sorted(missing)}")
    if len(df) < MIN_ROWS:
        raise ValueError(f"Need at least {MIN_ROWS} rows, got {len(df)}")
    bad = set(df["hmm_regime"].dropna().unique()) - {"Low", "Medium", "High"}
    if bad:
        raise ValueError(f"Unexpected hmm_regime values: {bad}")


def predict_transition_risk(
    df: pd.DataFrame,
    ticker: str,
    models: dict[str, TemporalFusionTransformer],
    device: torch.device,
) -> dict[str, float]:
    _validate_input(df)
    dataset = _prepare_inference_dataset(df, ticker)
    dataloader = dataset.to_dataloader(train=False, batch_size=1, num_workers=0)
    x, _ = next(iter(dataloader))
    x = {k: v.to(device) if isinstance(v, torch.Tensor) else v for k, v in x.items()}

    results = {}
    with torch.no_grad():
        for horizon, model in models.items():
            logit = model(x)["prediction"].squeeze()
            prob = torch.sigmoid(logit).item()
            results[horizon] = round(float(np.clip(prob, 0.001, 0.999)), 4)
    return results


class TFTPredictor:
    """
    Loads all ticker models once at startup.
    Call predict(df, ticker) for each ticker during the pipeline run.

    Usage:
        predictor = TFTPredictor(models_dir, tickers_path)
        risk = predictor.predict(df, "HDFCBANK.NS")
        # {"1d": 0.08, "3d": 0.24, "5d": 0.39}
    """

    def __init__(self, models_dir: Path, tickers_path: Path):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

        with open(tickers_path) as f:
            tickers = json.load(f)

        self._models: dict[str, dict] = {}
        failed = []

        for t in tickers:
            ticker = t["ticker"]
            try:
                self._models[ticker] = load_ticker_models(ticker, models_dir, self.device)
            except FileNotFoundError as e:
                print(f"  Warning: {e}")
                failed.append(ticker)

        print(f"TFTPredictor ready — {len(self._models)} tickers, device: {self.device}")
        if failed:
            print(f"  Skipped: {failed}")

    def predict(self, df: pd.DataFrame, ticker: str) -> dict[str, float]:
        if ticker not in self._models:
            raise ValueError(f"No models for {ticker}")
        return predict_transition_risk(df, ticker, self._models[ticker], self.device)