import numpy as np
import pandas as pd

def add_close_to_close_volatility(
    df: pd.DataFrame,
    window: int = 20,
    trading_days: int = 252
    ) -> pd.DataFrame:
    """Standard close-to-close rolling volatility."""

    df = df.copy()

    log_ret = np.log(df["Close"] / df["Close"].shift(1))

    vol = log_ret.rolling(window).std() * np.sqrt(trading_days)

    df["vol_cc"] = vol

    return df

def add_parkinson_volatility(
    df: pd.DataFrame,
    window: int = 20,
    trading_days: int = 252
    ) -> pd.DataFrame:
    """Parkinson volatility estimator using High-Low range."""

    df = df.copy()

    hl_log = np.log(df["High"] / df["Low"])

    var_pk = (hl_log ** 2) / (4 * np.log(2))

    vol_pk = np.sqrt(var_pk.rolling(window).mean()) * np.sqrt(trading_days)

    df["vol_pk"] = vol_pk

    return df

def add_garman_klass_volatility(
    df: pd.DataFrame,
    window: int = 20,
    trading_days: int = 252
    ) -> pd.DataFrame:
    """Garman-Klass volatility estimator using OHLC."""

    df = df.copy()

    hl = np.log(df["High"] / df["Low"])
    co = np.log(df["Close"] / df["Open"])

    var_gk = 0.5 * (hl ** 2) - (2 * np.log(2) - 1) * (co ** 2)

    vol_gk = np.sqrt(var_gk.rolling(window).mean()) * np.sqrt(trading_days)

    df["vol_gk"] = vol_gk

    return df