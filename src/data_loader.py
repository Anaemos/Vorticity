import os
import yfinance as yf
import pandas as pd
from datetime import datetime

def download_index(
    ticker: str,
    start_date: str,
    end_date: str,
    save_path: str,
):
    """Download OHLCV data using yfinance and save to CSV.
    Parameters:-
    ticker : str
        Yahoo Finance ticker (e.g. ^NSEI)
    start_date : str
        Start date (YYYY-MM-DD)
    end_date : str
        End date (YYYY-MM-DD)
    save_path : str
        Path to save CSV"""
    print(f"[INFO] Downloading data for {ticker}")
    print(f"[INFO] Period: {start_date} → {end_date}")

    data = yf.download(
        ticker,
        start=start_date,
        end=end_date,
        progress=False
    )

    if data.empty:
        raise ValueError("No data downloaded. Check ticker or dates.")

    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    data.to_csv(save_path)

    print(f"[SUCCESS] Saved to {save_path}")
    print(f"[ROWS] {len(data)} records")


def main():

    TICKER = "^NSEI"
    START_DATE = "2005-01-01"
    END_DATE = datetime.today().strftime("%Y-%m-%d")

    SAVE_PATH = "data/raw/nifty50.csv"

    download_index(
        ticker=TICKER,
        start_date=START_DATE,
        end_date=END_DATE,
        save_path=SAVE_PATH
    )


if __name__ == "__main__":
    main()