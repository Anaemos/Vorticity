import pandas as pd


def add_returns(df: pd.DataFrame)->pd.DataFrame:
    """Adding Daily %age returns based on closing price"""
    
    df=df.copy()
    #pct_change computes (curr-prev)/prev
    df["return"]=df["Close"].pct_change()
    return df

def add_volatility(
    df:pd.DataFrame,
    window: int=20,
    annualize: bool=True
)-> pd.DataFrame:
    """
    Add rolling volatility based on returns
    parameters:
        window: number of days in rolling window
        annualize: scale by square root 252 or not
    """
    
    df=df.copy()
    
    #Rolling std dev of return
    vol=df["return"].rolling(window=window).std()
    
    if annualize:
        vol=vol*(252**0.5)
        
    df["volatility"]=vol
    return df

def add_volatility_regime(
    df: pd.DataFrame,
    vol_col: str = "volatility",
    low_q: float = 0.33,
    high_q: float = 0.66,
) -> pd.DataFrame:
    """Label volatility regimes using quantiles of specified volatility column."""
    
    df = df.copy()
    
    low_thr = df[vol_col].quantile(low_q)
    high_thr = df[vol_col].quantile(high_q)
    
    def regime(v):
        if pd.isna(v):
            return None
        elif v <= low_thr:
            return "Low"
        elif v <= high_thr:
            return "Medium"
        else:
            return "High"
    
    df["vol_regime"] = df[vol_col].apply(regime)
    return df