import os 
import yfinance as yf
import pandas as pd
from datetime import datetime

def download_data(
    ticker: str,
    start_date: str,
    end_date: str,
    save_path: str,
):
    """Downloaded OHLCV data in tabular format"""
    
    
    df = yf.download(ticker,start=start_date,end=end_date,auto_adjust=True,progress=False)
    
    if df.empty:
        raise ValueError("No data was downloaded")
    
    #I needed to flatten multi index 
    if isinstance(df.columns, pd.MultiIndex):
        df.columns=df.columns.get_level_values(0)
        
    df=df.reset_index() #to get Date column
    
    cols=["Date","Open","High","Low","Close","Volume"]
    df=df[cols]
    
    df=df.sort_values("Date")
    df=df.dropna()
    
    os.makedirs(os.path.dirname(save_path),exist_ok=True)
    df.to_csv(save_path,index=False)
    
    print("Saved")

def main():
    START="2005-01-01"
    END=datetime.today().strftime("%Y-%m-%d")
    download_data(
        ticker="^NSEI",
        start_date=START,
        end_date=END,
        save_path="data/raw/nifty50.csv"
    )
    
if __name__=="__main__":
    main()