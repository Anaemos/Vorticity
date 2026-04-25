"""
pipeline.py
Nightly orchestration for the Market Weather Engine.

For each ticker:
  - Fetch fresh OHLCV
  - Load frozen HMM, predict today's regime + entropy
  - Compute distribution stats
  - Run TFT inference
  - Write data/results/{ticker}.json
  - Git push

Usage:
    python pipeline.py
    python pipeline.py --ticker HDFCBANK.NS
    python pipeline.py --dry-run
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
from datetime import timedelta

import joblib
import numpy as np
import pandas as pd
import pytz
import yfinance as yf

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
RESULTS_DIR = PROJECT_ROOT / "data" / "results"
MODELS_DIR = PROJECT_ROOT / "models"
DATA_START = "2005-01-01"
IST = pytz.timezone("Asia/Kolkata")

VAR_QUANTILES = [0.01, 0.05]
RETURN_QUANTILES = [0.10, 0.50, 0.90]
ENTROPY_UNCERTAIN_MULT = 1.10
ENTROPY_UNSTABLE_MULT = 1.28


def load_tickers(path: Path) -> list[dict]:
    if not path.exists():
        raise FileNotFoundError(f"tickers.json not found at {path}")
    with open(path) as f:
        tickers = json.load(f)
    log.info(f"Loaded {len(tickers)} tickers")
    return tickers


def fetch_ohlcv(ticker: str, start: str) -> pd.DataFrame:
    end = (datetime.today() + timedelta(days=1)).strftime("%Y-%m-%d")
    log.info(f"  Fetching {ticker} ({start} to {end})")
    df = yf.download(ticker, start=start, end=end, auto_adjust=True, progress=False)
    if df.empty:
        raise ValueError(f"No data for {ticker}")
    if isinstance(df.columns, pd.MultiIndex):
        df.columns = df.columns.get_level_values(0)
    df = df.reset_index()[["Date", "Open", "High", "Low", "Close", "Volume"]]
    df = df.sort_values("Date").dropna().reset_index(drop=True)
    log.info(f"  {ticker}: {len(df)} rows, last date {df['Date'].max().date()}")
    return df


def build_features(df: pd.DataFrame) -> pd.DataFrame:
    df = add_returns(df)

    # detect split artefacts vectorised: |r[i]|>50%, opposite |r[i+j]|>50%, net<5%
    # black swans don't fully reverse within 2 days — split corrections do
    _ret = df['return'].values
    _drop = set()
    for _i in range(1, len(_ret) - 2):
        _r0 = _ret[_i]
        if abs(_r0) <= 0.5:
            continue
        for _j in [1, 2]:
            if _i + _j >= len(_ret):
                break
            _r1 = _ret[_i + _j]
            if abs(_r1) > 0.5 and (_r0 * _r1 < 0) and abs((1 + _r0) * (1 + _r1) - 1) < 0.05:
                _drop.update([_i, _i + _j])
                break
    if _drop:
        _bad = df.iloc[sorted(_drop)]['Date'].tolist()
        print(f"  Artefact detected — dropping {_bad}")
        df = df.drop(df.index[sorted(_drop)]).reset_index(drop=True)

    df = add_close_to_close_volatility(df, window=20)
    df = add_lagged_returns(df, lags=(1, 5, 10))
    df = add_moving_average_features(df, windows=(5, 10, 20))
    df["vol_cc_lag_1"] = df["vol_cc"].shift(1)
    return df


def apply_frozen_hmm(df: pd.DataFrame, ticker: str) -> pd.DataFrame:
    """
    Load the frozen HMM for this ticker and predict regime labels
    on fresh data. Never refits — only calls model.predict().
    """
    folder = MODELS_DIR / ticker.replace(".", "_")
    model = joblib.load(folder / "hmm_model.pkl")
    with open(folder / "state_mapping.json") as f:
        state_mapping = {int(k): v for k, v in json.load(f).items()}

    clean = df.dropna(subset=["return", "vol_cc"]).copy()
    hmm_input = clean[["return", "vol_cc"]].values

    states = model.predict(hmm_input)
    clean["hmm_regime"] = [state_mapping[s] for s in states]

    probs = model.predict_proba(hmm_input)
    clean["state_entropy"] = -(probs * np.log(probs + 1e-12)).sum(axis=1)

    counts = clean["hmm_regime"].value_counts().to_dict()
    log.info(f"  HMM regimes: {counts}")
    return clean


def get_current_state(df: pd.DataFrame) -> dict:
    latest = df.dropna(subset=["hmm_regime"]).iloc[-1]
    entropy_now = float(latest["state_entropy"])
    entropy_base = float(df["state_entropy"].mean())

    if entropy_now < entropy_base * ENTROPY_UNCERTAIN_MULT:
        stability = "Stable"
    elif entropy_now < entropy_base * ENTROPY_UNSTABLE_MULT:
        stability = "Uncertain"
    else:
        stability = "Unstable"

    return {
        "regime": str(latest["hmm_regime"]),
        "entropy": round(entropy_now, 4),
        "stability": stability,
    }


def compute_regime_stats(df: pd.DataFrame) -> dict:
    stats = {}
    for regime in ["Low", "Medium", "High"]:
        rets = df[df["hmm_regime"] == regime]["return"].dropna()
        if len(rets) < 10:
            continue
        stats[regime] = {
            "mean": round(float(rets.mean()), 6),
            "std": round(float(rets.std()), 6),
            "skew": round(float(rets.skew()), 4),
            "kurt": round(float(rets.kurt()), 4),
            "var_1pct": round(float(rets.quantile(0.01)), 6),
            "var_5pct": round(float(rets.quantile(0.05)), 6),
            "q10": round(float(rets.quantile(0.10)), 6),
            "q50": round(float(rets.quantile(0.50)), 6),
            "q90": round(float(rets.quantile(0.90)), 6),
            "count": int(len(rets)),
        }
    return stats


def compute_transition_matrix(df: pd.DataFrame) -> dict:
    clean = df.dropna(subset=["hmm_regime"]).copy()
    clean["next_regime"] = clean["hmm_regime"].shift(-1)
    clean = clean.dropna(subset=["next_regime"])
    matrix = {}
    for regime in ["Low", "Medium", "High"]:
        subset = clean[clean["hmm_regime"] == regime]
        if len(subset) == 0:
            continue
        counts = subset["next_regime"].value_counts()
        total = counts.sum()
        matrix[regime] = {
            r: round(float(counts.get(r, 0) / total), 4)
            for r in ["Low", "Medium", "High"]
        }
    return matrix


def assemble_report(
    ticker_info: dict,
    current: dict,
    regime_stats: dict,
    transition_matrix: dict,
    tft_risk: dict,
    last_date: str,
) -> dict:
    regime = current["regime"]
    stats = regime_stats.get(regime, {})
    empirical_high = transition_matrix.get(regime, {}).get("High", 0.0)

    return {
        "ticker": ticker_info["ticker"],
        "name": ticker_info["name"],
        "category": ticker_info["category"],
        "sector": ticker_info["sector"],
        "updated_at": datetime.now(IST).isoformat(),
        "data_through": last_date,
        "regime": regime,
        "entropy": current["entropy"],
        "stability": current["stability"],
        "transition_risk": {
            "1d": tft_risk.get("1d"),
            "3d": tft_risk.get("3d"),
            "5d": tft_risk.get("5d"),
        },
        "empirical_high_prob": round(empirical_high, 4),
        "var_1pct": stats.get("var_1pct"),
        "var_5pct": stats.get("var_5pct"),
        "return_range": {
            "q10": stats.get("q10"),
            "q50": stats.get("q50"),
            "q90": stats.get("q90"),
        },
        "regime_stats": regime_stats,
        "transition_matrix": transition_matrix,
    }


def write_result(report: dict, results_dir: Path) -> None:
    results_dir.mkdir(parents=True, exist_ok=True)
    filename = report["ticker"].replace(".", "_") + ".json"
    with open(results_dir / filename, "w") as f:
        json.dump(report, f, indent=2)
    log.info(f"  Written: {filename}")


def git_push(project_root: Path) -> None:
    date_str = datetime.today().strftime("%Y-%m-%d")
    try:
        subprocess.run(["git", "add", "data/results/"], cwd=project_root, check=True, capture_output=True)
        subprocess.run(["git", "commit", "-m", f"weather update: {date_str} [skip ci]"], cwd=project_root, check=True, capture_output=True)
        subprocess.run(["git", "push"], cwd=project_root, check=True, capture_output=True)
        log.info(f"Git push done ({date_str})")
    except subprocess.CalledProcessError as e:
        log.warning(f"Git push failed: {e.stderr.decode().strip()}")


def run_ticker(ticker_info: dict, predictor: TFTPredictor) -> Optional[dict]:
    ticker = ticker_info["ticker"]
    log.info(f"Processing {ticker}...")
    try:
        raw_df = fetch_ohlcv(ticker, start=DATA_START)
        df = build_features(raw_df)
        df = apply_frozen_hmm(df, ticker)

        current = get_current_state(df)
        regime_stats = compute_regime_stats(df)
        transition_matrix = compute_transition_matrix(df)

        tft_df = df.dropna(subset=[
            "return", "vol_cc", "vol_cc_lag_1",
            "ret_lag_1", "ret_lag_5", "ret_lag_10",
            "ma_ratio_5", "ma_ratio_10", "ma_ratio_20",
            "hmm_regime",
        ]).copy()

        tft_risk = predictor.predict(tft_df, ticker)
        last_date = str(df["Date"].max().date())

        report = assemble_report(
            ticker_info=ticker_info,
            current=current,
            regime_stats=regime_stats,
            transition_matrix=transition_matrix,
            tft_risk=tft_risk,
            last_date=last_date,
        )

        log.info(f"  {ticker}: regime={report['regime']}, stability={report['stability']}, TFT_5d={report['transition_risk']['5d']}")
        return report

    except Exception as e:
        log.error(f"  FAILED {ticker}: {e}", exc_info=True)
        return None


def main(tickers_filter: Optional[str] = None, dry_run: bool = False) -> None:
    log.info("Market Weather Engine — pipeline start")

    predictor = TFTPredictor(
        models_dir=MODELS_DIR,
        tickers_path=TICKERS_PATH,
    )
    all_tickers = load_tickers(TICKERS_PATH)

    if tickers_filter:
        all_tickers = [t for t in all_tickers if t["ticker"] == tickers_filter]
        if not all_tickers:
            log.error(f"Ticker {tickers_filter} not found in tickers.json")
            sys.exit(1)

    success, failed = [], []
    for ticker_info in all_tickers:
        report = run_ticker(ticker_info, predictor)
        if report is not None:
            write_result(report, RESULTS_DIR)
            success.append(ticker_info["ticker"])
        else:
            failed.append(ticker_info["ticker"])

    log.info(f"Done. Success: {len(success)}, Failed: {len(failed)}")
    if failed:
        log.warning(f"Failed: {failed}")

    if not dry_run and success:
        git_push(PROJECT_ROOT)
    elif dry_run:
        log.info("Dry run — skipping git push")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--ticker", type=str, default=None)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    main(tickers_filter=args.ticker, dry_run=args.dry_run)