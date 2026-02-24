import pandas as pd

def add_target_direction(df: pd.DataFrame)-> pd.DataFrame:
    """Creating binary pred target:
        1 if next day return > 0 else 0"""
    
    df= df.copy()
    
    # shift(-1) moves future return to current row
    df["target"]=(df["return"].shift(-1)>0).astype(int)
    return df

def add_lagged_returns(df: pd.DataFrame,lags=(1,5,10))-> pd.DataFrame:
    """Adds past return features at specific lags"""
    
    df=df.copy()
    for lag in lags:
        df[f"ret_lag_{lag}"]= df["return"].shift(lag)
    return df

def add_moving_average_features(df:pd.DataFrame,windows=(5,10,20))->pd.DataFrame:
    """Add price relative to moving average"""
    
    df=df.copy()
    
    for w in windows:
        ma= df["Close"].rolling(window=w).mean()
        df[f"ma_ratio_{w}"]= df["Close"]/ma
    
    return df

def add_volatility_features(
    df,
    vol_col="volatility",
    lags=(1,)
    ):
    """Add lagged volatility features from specified volatility column."""

    df = df.copy()

    for lag in lags:
        df[f"{vol_col}_lag_{lag}"] = df[vol_col].shift(lag)

    return df
