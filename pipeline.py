"""
pipeline.py
-----------
Nightly orchestration script for the Market Weather Engine.

What this script does, in order:
    1. Load tickers.json — the list of ETFs to process
    2. For each ticker:
        a. Fetch fresh OHLCV data from yfinance
        b. Build all features (returns, vol, lags, MA ratios)
        c. Fit HMM on full history -> assign regime labels + entropy
        d. Compute regime statistics (VaR, return ranges, distribution)
        e. Run TFT inference -> transition risk probabilities
        f. Assemble the weather report dict
        g. Write data/results/{ticker}.json
    3. Git add, commit, push — results land on GitHub for the frontend

Run this once after market close each trading day.
Schedule via Windows Task Scheduler or cron at 4 PM IST.

Usage:
    python pipeline.py                         # process all tickers
    python pipeline.py --ticker NIFTYBEES.NS   # single ticker (for testing)
    python pipeline.py --dry-run               # skip git push
"""

from __future__ import annotations

import argparse
import json
import logging
import subprocess
import sys
import warnings
from datetime import datetime
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
import pytz
import yfinance as yf
from hmmlearn.hmm import GaussianHMM

warnings.filterwarnings("ignore")



PROJECT_ROOT = Path(__file__).resolve().parent
while not (PROJECT_ROOT / "src").exists():
    PROJECT_ROOT = PROJECT_ROOT.parent

sys.path.insert(0, str(PROJECT_ROOT))

from src.labeling import add_returns
from src.volatility import add_close_to_close_volatility
from src.features import add_lagged_returns, add_moving_average_features
from src.tft_predictor import TFTPredictor



(PROJECT_ROOT / "logs").mkdir(exist_ok=True)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler(PROJECT_ROOT / "logs" / "pipeline.log"),
    ],
)
log = logging.getLogger(__name__)



TICKERS_PATH = PROJECT_ROOT / "tickers.json"
RESULTS_DIR  = PROJECT_ROOT / "data" / "results"
DATA_START   = "2005-01-01"
IST          = pytz.timezone("Asia/Kolkata")

# HMM config — must match notebook 03 exactly
HMM_N_COMPONENTS = 3
HMM_COVARIANCE   = "full"
HMM_N_ITER       = 1000
HMM_RANDOM_STATE = 42

VAR_QUANTILES    = [0.01, 0.05]
RETURN_QUANTILES = [0.10, 0.50, 0.90]

# entropy thresholds from checkpoint research
# baseline 0.252, pre-transition 0.321 (28% elevation)
ENTROPY_UNCERTAIN_MULT = 1.10
ENTROPY_UNSTABLE_MULT  = 1.28




def load_tickers(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(
            f"tickers.json not found at {path}. "
            "Create it before running the pipeline."
        )
    with open(path) as f:
        tickers = json.load(f)
    log.info(f"Loaded {len(tickers)} tickers")
    return tickers




def fetch_ohlcv(ticker: str, start: str) -> pd.DataFrame:
    end = datetime.today().strftime("%Y-%m-%d")
    log.info(f"  Fetching {ticker} ({start} to {end})")

    df = yf.download(
        ticker,
        start=start,
        end=end,
        auto_adjust=True,
        progress=False,
    )

    if df.empty:
        raise ValueError(f"No data returned for {ticker}")

    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)

    df = df.reset_index()
    df = df[["Date", "Open", "High", "Low", "Close", "Volume"]]
    df = df.sort_values("Date").dropna().reset_index(drop=True)

    log.info(f"  {ticker}: {len(df)} rows, "
             f"last date {df['Date'].max().date()}")
    return df




def build_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Identical feature pipeline to notebooks 01-06.
    Produces: return, vol_cc, vol_cc_lag_1,
              ret_lag_1/5/10, ma_ratio_5/10/20
    """
    df = add_returns(df)

    # clip returns beyond 15% in a single day — these are data artefacts
    # from yfinance mishandling ETF dividend/split adjustments, not real moves
    df["return"] = df["return"].clip(lower=-0.15, upper=0.15)

    df = add_close_to_close_volatility(df, window=20)
    df = add_lagged_returns(df, lags=(1, 5, 10))
    df = add_moving_average_features(df, windows=(5, 10, 20))
    df["vol_cc_lag_1"] = df["vol_cc"].shift(1)
    return df




def fit_hmm(df: pd.DataFrame) -> pd.DataFrame:
    """
    Fit 3-state Gaussian HMM on [return, vol_cc].
    Assigns hmm_regime (Low/Medium/High) and state_entropy to each row.
    Replicates notebook 03 exactly.
    """
    clean = df.dropna(subset=["return", "vol_cc"]).copy()
    hmm_input = clean[["return", "vol_cc"]].values

    model = GaussianHMM(
        n_components    = HMM_N_COMPONENTS,
        covariance_type = HMM_COVARIANCE,
        n_iter          = HMM_N_ITER,
        random_state    = HMM_RANDOM_STATE,
    )
    model.fit(hmm_input)

    states = model.predict(hmm_input)
    clean["state"] = states

    # map by ascending mean volatility: lowest vol = Low
    state_vol = clean.groupby("state")["vol_cc"].mean().sort_values()
    state_map = {
        state_vol.index[0]: "Low",
        state_vol.index[1]: "Medium",
        state_vol.index[2]: "High",
    }
    clean["hmm_regime"] = clean["state"].map(state_map)

    # state probabilities -> entropy
    probs = model.predict_proba(hmm_input)
    clean["P_state0"] = probs[:, 0]
    clean["P_state1"] = probs[:, 1]
    clean["P_state2"] = probs[:, 2]

    clean["state_entropy"] = -(
        probs * np.log(probs + 1e-12)
    ).sum(axis=1)

    counts = clean["hmm_regime"].value_counts().to_dict()
    log.info(f"  HMM regimes: {counts}")
    return clean




def get_current_state(df: pd.DataFrame) -> dict:
    """
    Extract today's regime, entropy, and stability from the most recent row.
    Stability thresholds come from checkpoint research findings.
    """
    latest       = df.dropna(subset=["hmm_regime"]).iloc[-1]
    entropy_now  = float(latest["state_entropy"])
    entropy_base = float(df["state_entropy"].mean())

    if entropy_now < entropy_base * ENTROPY_UNCERTAIN_MULT:
        stability = "Stable"
    elif entropy_now < entropy_base * ENTROPY_UNSTABLE_MULT:
        stability = "Uncertain"
    else:
        stability = "Unstable"

    return {
        "regime":    str(latest["hmm_regime"]),
        "entropy":   round(entropy_now, 4),
        "stability": stability,
    }




def compute_regime_stats(df: pd.DataFrame) -> dict:
    """
    Compute return distribution statistics conditioned on each regime.
    Replicates notebook 04 analysis.
    """
    stats = {}
    for regime in ["Low", "Medium", "High"]:
        rets = df[df["hmm_regime"] == regime]["return"].dropna()
        if len(rets) < 10:
            continue

        stats[regime] = {
            "mean":   round(float(rets.mean()), 6),
            "std":    round(float(rets.std()), 6),
            "skew":   round(float(rets.skew()), 4),
            "kurt":   round(float(rets.kurt()), 4),
            "var_1pct": round(float(rets.quantile(0.01)), 6),
            "var_5pct": round(float(rets.quantile(0.05)), 6),
            "q10":    round(float(rets.quantile(0.10)), 6),
            "q50":    round(float(rets.quantile(0.50)), 6),
            "q90":    round(float(rets.quantile(0.90)), 6),
            "count":  int(len(rets)),
        }
    return stats




def compute_transition_matrix(df: pd.DataFrame) -> dict:
    """Empirical P(next_regime | current_regime)."""
    clean = df.dropna(subset=["hmm_regime"]).copy()
    clean["next_regime"] = clean["hmm_regime"].shift(-1)
    clean = clean.dropna(subset=["next_regime"])

    matrix = {}
    for regime in ["Low", "Medium", "High"]:
        subset = clean[clean["hmm_regime"] == regime]
        if len(subset) == 0:
            continue
        counts = subset["next_regime"].value_counts()
        total  = counts.sum()
        matrix[regime] = {
            r: round(float(counts.get(r, 0) / total), 4)
            for r in ["Low", "Medium", "High"]
        }
    return matrix




def assemble_report(
    ticker_info:       dict,
    current:           dict,
    regime_stats:      dict,
    transition_matrix: dict,
    tft_risk:          dict,
    last_date:         str,
) -> dict:
    regime = current["regime"]
    stats  = regime_stats.get(regime, {})
    empirical_high = transition_matrix.get(regime, {}).get("High", 0.0)

    return {
        "ticker":       ticker_info["ticker"],
        "name":         ticker_info["name"],
        "category":     ticker_info["category"],
        "updated_at":   datetime.now(IST).isoformat(),
        "data_through": last_date,

        "regime":       regime,
        "entropy":      current["entropy"],
        "stability":    current["stability"],

        "transition_risk": {
            "1d": tft_risk.get("1d"),
            "3d": tft_risk.get("3d"),
            "5d": tft_risk.get("5d"),
        },

        "empirical_high_prob": round(empirical_high, 4),

        "var_1pct":     stats.get("var_1pct"),
        "var_5pct":     stats.get("var_5pct"),
        "return_range": {
            "q10": stats.get("q10"),
            "q50": stats.get("q50"),
            "q90": stats.get("q90"),
        },

        "regime_stats":      regime_stats,
        "transition_matrix": transition_matrix,
    }




def write_result(report: dict, results_dir: Path) -> None:
    results_dir.mkdir(parents=True, exist_ok=True)
    filename = report["ticker"].replace(".", "_") + ".json"
    path = results_dir / filename
    with open(path, "w") as f:
        json.dump(report, f, indent=2)
    log.info(f"  Written: {path.name}")




def git_push(project_root: Path) -> None:
    date_str = datetime.today().strftime("%Y-%m-%d")
    try:
        subprocess.run(["git", "add", "data/results/"],
                       cwd=project_root, check=True, capture_output=True)
        subprocess.run(["git", "commit", "-m", f"weather update: {date_str}"],
                       cwd=project_root, check=True, capture_output=True)
        subprocess.run(["git", "push"],
                       cwd=project_root, check=True, capture_output=True)
        log.info(f"Git push successful ({date_str})")
    except subprocess.CalledProcessError as e:
        log.warning(f"Git push failed: {e.stderr.decode().strip()}")
        log.warning("Results saved locally. Push manually if needed.")






def build_shared_regime(project_root: Path) -> pd.DataFrame:
    """
    Fetch the NIFTY 50 index (^NSEI) and fit the HMM on it.
    Returns a dataframe with Date, hmm_regime, state_entropy columns.

    This is the authoritative regime signal for all tickers.
    It uses the same data and HMM config as notebook 03, ensuring
    the regime labels are consistent with the TFT training labels.
    """
    log.info("Building shared regime clock from ^NSEI...")
    raw = fetch_ohlcv("^NSEI", start=DATA_START)
    df  = build_features(raw)
    df  = fit_hmm(df)
    log.info(f"  Shared regime today: {df.dropna(subset=['hmm_regime']).iloc[-1]['hmm_regime']}")
    return df[["Date", "hmm_regime", "state_entropy"]].dropna()


def get_shared_current_state(regime_df: pd.DataFrame) -> dict:
    """Extract today's regime and entropy from the shared regime dataframe."""
    latest       = regime_df.iloc[-1]
    entropy_now  = float(latest["state_entropy"])
    entropy_base = float(regime_df["state_entropy"].mean())

    if entropy_now < entropy_base * ENTROPY_UNCERTAIN_MULT:
        stability = "Stable"
    elif entropy_now < entropy_base * ENTROPY_UNSTABLE_MULT:
        stability = "Uncertain"
    else:
        stability = "Unstable"

    return {
        "regime":    str(latest["hmm_regime"]),
        "entropy":   round(entropy_now, 4),
        "stability": stability,
    }


def get_shared_transition_matrix(regime_df: pd.DataFrame) -> dict:
    """Compute empirical transition matrix from the shared NIFTY regime series."""
    df = regime_df.dropna(subset=["hmm_regime"]).copy()
    df["next_regime"] = df["hmm_regime"].shift(-1)
    df = df.dropna(subset=["next_regime"])

    matrix = {}
    for regime in ["Low", "Medium", "High"]:
        subset = df[df["hmm_regime"] == regime]
        if len(subset) == 0:
            continue
        counts = subset["next_regime"].value_counts()
        total  = counts.sum()
        matrix[regime] = {
            r: round(float(counts.get(r, 0) / total), 4)
            for r in ["Low", "Medium", "High"]
        }
    return matrix


def run_ticker(
    ticker_info: dict,
    predictor:   TFTPredictor,
    shared_regime_df: pd.DataFrame,
    shared_current:   dict,
    shared_matrix:    dict,
) -> Optional[dict]:
    """
    Process one ticker using the shared regime clock from ^NSEI.

    The HMM regime label comes from the shared NIFTY regime series —
    not from a per-ticker HMM refit. This ensures consistency with
    the labels used during TFT training.

    Per-ticker work:
    - Fetch and process its own OHLCV
    - Compute its own distribution stats and VaR
    - Merge shared regime labels for TFT feature input
    - Run TFT inference
    """
    ticker = ticker_info["ticker"]
    log.info(f"Processing {ticker}...")

    try:
        raw_df = fetch_ohlcv(ticker, start=DATA_START)
        df     = build_features(raw_df)

        # merge shared regime labels by date
        df = df.merge(
            shared_regime_df[["Date", "hmm_regime", "state_entropy"]],
            on="Date",
            how="left",
        )

        # drop rows where the regime merge produced no match
        # (ticker history shorter than ^NSEI history)
        df = df.dropna(subset=["hmm_regime"])

        # compute per-ticker distribution stats using shared regime labels
        regime_stats = compute_regime_stats(df)
        last_date    = str(df["Date"].max().date())

        # TFT input: ticker features + shared regime label
        tft_df = df.dropna(subset=[
            "return", "vol_cc", "vol_cc_lag_1",
            "ret_lag_1", "ret_lag_5", "ret_lag_10",
            "ma_ratio_5", "ma_ratio_10", "ma_ratio_20",
            "hmm_regime",
        ]).copy()

        tft_risk = predictor.predict(tft_df, ticker)

        report = assemble_report(
            ticker_info       = ticker_info,
            current           = shared_current,
            regime_stats      = regime_stats,
            transition_matrix = shared_matrix,
            tft_risk          = tft_risk,
            last_date         = last_date,
        )

        log.info(
            f"  {ticker}: regime={report['regime']}, "
            f"stability={report['stability']}, "
            f"TFT_5d={report['transition_risk']['5d']}"
        )
        return report

    except Exception as e:
        log.error(f"  FAILED {ticker}: {e}", exc_info=True)
        return None




def main(tickers_filter: Optional[str] = None, dry_run: bool = False) -> None:
    log.info("=" * 60)
    log.info("Market Weather Engine — pipeline start")
    log.info("=" * 60)

    predictor   = TFTPredictor(models_dir=PROJECT_ROOT / "models")
    all_tickers = load_tickers(TICKERS_PATH)

    if tickers_filter:
        all_tickers = [t for t in all_tickers if t["ticker"] == tickers_filter]
        if not all_tickers:
            log.error(f"Ticker {tickers_filter} not found in tickers.json")
            sys.exit(1)

    # build shared regime clock once from ^NSEI
    shared_regime_df = build_shared_regime(PROJECT_ROOT)
    shared_current   = get_shared_current_state(shared_regime_df)
    shared_matrix    = get_shared_transition_matrix(shared_regime_df)
    log.info(f"Shared regime: {shared_current['regime']} | "
             f"stability: {shared_current['stability']} | "
             f"entropy: {shared_current['entropy']}")

    success, failed = [], []

    for ticker_info in all_tickers:
        report = run_ticker(
            ticker_info,
            predictor,
            shared_regime_df = shared_regime_df,
            shared_current   = shared_current,
            shared_matrix    = shared_matrix,
        )
        if report is not None:
            write_result(report, RESULTS_DIR)
            success.append(ticker_info["ticker"])
        else:
            failed.append(ticker_info["ticker"])

    log.info("-" * 60)
    log.info(f"Done. Success: {len(success)}, Failed: {len(failed)}")
    if failed:
        log.warning(f"Failed: {failed}")

    if not dry_run and success:
        git_push(PROJECT_ROOT)
    elif dry_run:
        log.info("Dry run — skipping git push")

    log.info("Pipeline complete.")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Market Weather Engine — nightly pipeline"
    )
    parser.add_argument(
        "--ticker", type=str, default=None,
        help="Single ticker to process (e.g. NIFTYBEES.NS)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Skip git push (useful for testing)"
    )
    args = parser.parse_args()
    main(tickers_filter=args.ticker, dry_run=args.dry_run)