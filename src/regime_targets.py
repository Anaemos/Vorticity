import pandas as pd

def add_future_regime_target(
    df: pd.DataFrame,
    regime_col: str = "regime",
    horizon: int = 1
) -> pd.DataFrame:
    """
    Adds future regime label as prediction target
    """

    df = df.copy()

    df["target_regime"] = df[regime_col].shift(-horizon)

    return df