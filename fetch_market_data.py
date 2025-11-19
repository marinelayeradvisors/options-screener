#!/usr/bin/env python3
"""
Marine Layer Advisors - Market Data Fetcher
Fetches option chain data and calculates metrics for top 75 liquid US Tech/Consumer stocks.
"""

import json
import os
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import yfinance as yf
import numpy as np

# Top 75 most liquid US Tech/Consumer stocks
TICKERS = [
    "AAPL", "MSFT", "NVDA", "AMD", "AMZN", "TSLA", "META", "GOOGL", "NFLX",
    "INTC", "CRM", "ORCL", "ADBE", "CSCO", "AVGO", "QCOM", "TXN", "MU",
    "AMAT", "LRCX", "KLAC", "NXPI", "MRVL", "SWKS", "QRVO", "MCHP", "ON",
    "MPWR", "WOLF", "ALGM", "DIOD", "SLAB", "OLED", "POWI", "CRUS", "AOSL",
    "GOOG", "BABA", "JD", "PDD", "BIDU", "NIO", "XPEV", "LI", "BILI", "TME",
    "WMT", "TGT", "HD", "LOW", "COST", "SBUX", "NKE", "MCD", "DIS", "CMCSA",
    "VZ", "T", "TMUS", "CHTR", "ROKU", "SPOT", "SNAP", "PINS", "ZM", "UBER",
    "LYFT", "DASH", "ABNB", "BKNG", "EXPE", "TRIP", "RCL", "CCL", "NCLH"
]

# Company names mapping (simplified - can be expanded)
COMPANY_NAMES = {
    "AAPL": "Apple Inc",
    "MSFT": "Microsoft Corporation",
    "NVDA": "NVIDIA Corporation",
    "AMD": "Advanced Micro Devices",
    "AMZN": "Amazon.com Inc",
    "TSLA": "Tesla Inc",
    "META": "Meta Platforms Inc",
    "GOOGL": "Alphabet Inc",
    "GOOG": "Alphabet Inc",
    "NFLX": "Netflix Inc",
    "INTC": "Intel Corporation",
    "CRM": "Salesforce Inc",
    "ORCL": "Oracle Corporation",
    "ADBE": "Adobe Inc",
    "CSCO": "Cisco Systems Inc",
    "AVGO": "Broadcom Inc",
    "QCOM": "Qualcomm Inc",
    "TXN": "Texas Instruments Inc",
    "MU": "Micron Technology Inc",
    "AMAT": "Applied Materials Inc",
    "LRCX": "Lam Research Corporation",
    "KLAC": "KLA Corporation",
    "NXPI": "NXP Semiconductors NV",
    "MRVL": "Marvell Technology Inc",
    "SWKS": "Skyworks Solutions Inc",
    "QRVO": "Qorvo Inc",
    "MCHP": "Microchip Technology Inc",
    "ON": "ON Semiconductor Corporation",
    "MPWR": "Monolithic Power Systems Inc",
    "WOLF": "Wolfspeed Inc",
    "ALGM": "Allegro MicroSystems Inc",
    "DIOD": "Diodes Incorporated",
    "SLAB": "Silicon Laboratories Inc",
    "OLED": "Universal Display Corporation",
    "POWI": "Power Integrations Inc",
    "CRUS": "Cirrus Logic Inc",
    "AOSL": "Alpha and Omega Semiconductor Limited",
    "BABA": "Alibaba Group Holding Limited",
    "JD": "JD.com Inc",
    "PDD": "PDD Holdings Inc",
    "BIDU": "Baidu Inc",
    "NIO": "NIO Inc",
    "XPEV": "XPeng Inc",
    "LI": "Li Auto Inc",
    "BILI": "Bilibili Inc",
    "TME": "Tencent Music Entertainment Group",
    "WMT": "Walmart Inc",
    "TGT": "Target Corporation",
    "HD": "The Home Depot Inc",
    "LOW": "Lowe's Companies Inc",
    "COST": "Costco Wholesale Corporation",
    "SBUX": "Starbucks Corporation",
    "NKE": "Nike Inc",
    "MCD": "McDonald's Corporation",
    "DIS": "The Walt Disney Company",
    "CMCSA": "Comcast Corporation",
    "VZ": "Verizon Communications Inc",
    "T": "AT&T Inc",
    "TMUS": "T-Mobile US Inc",
    "CHTR": "Charter Communications Inc",
    "ROKU": "Roku Inc",
    "SPOT": "Spotify Technology SA",
    "SNAP": "Snap Inc",
    "PINS": "Pinterest Inc",
    "ZM": "Zoom Video Communications Inc",
    "UBER": "Uber Technologies Inc",
    "LYFT": "Lyft Inc",
    "DASH": "DoorDash Inc",
    "ABNB": "Airbnb Inc",
    "BKNG": "Booking Holdings Inc",
    "EXPE": "Expedia Group Inc",
    "TRIP": "Tripadvisor Inc",
    "RCL": "Royal Caribbean Cruises Ltd",
    "CCL": "Carnival Corporation",
    "NCLH": "Norwegian Cruise Line Holdings Ltd"
}


def find_expiration_45_80_days(expirations: List[str]) -> Optional[str]:
    """Find expiration date between 45-80 days out."""
    today = datetime.now()
    best_exp = None
    best_diff = float('inf')
    
    for exp_str in expirations:
        exp_date = datetime.strptime(exp_str, "%Y-%m-%d")
        days_to_exp = (exp_date - today).days
        
        # Target 60 days (middle of 45-80 range)
        if 45 <= days_to_exp <= 80:
            diff = abs(days_to_exp - 60)
            if diff < best_diff:
                best_diff = diff
                best_exp = exp_str
    
    return best_exp


def find_option_by_strike_percent(options_df, price: float, otm_percent: float, is_call: bool) -> Optional[Dict]:
    """Find option closest to specified OTM percentage."""
    if options_df.empty:
        return None
    
    target_strike = price * (1 + otm_percent / 100) if is_call else price * (1 - otm_percent / 100)
    
    # Find closest strike
    options_df = options_df.copy()
    options_df['strike_diff'] = abs(options_df['strike'] - target_strike)
    closest = options_df.nsmallest(1, 'strike_diff')
    
    if closest.empty:
        return None
    
    row = closest.iloc[0]
    bid = row.get('bid', 0) if 'bid' in row else 0
    ask = row.get('ask', 0) if 'ask' in row else 0
    mid_price = (bid + ask) / 2 if bid > 0 and ask > 0 else row.get('lastPrice', 0)
    
    return {
        'strike': float(row['strike']),
        'premium': mid_price,
        'bid': float(bid),
        'ask': float(ask),
        'volume': int(row.get('volume', 0)),
        'openInterest': int(row.get('openInterest', 0)),
        'iv': float(row.get('impliedVolatility', 0)) if 'impliedVolatility' in row else None
    }


def calculate_covered_calls(calls, price: float, days_to_exp: int) -> List[Dict]:
    """Calculate covered call recommendations for 5%, 10%, 15%, 20% OTM."""
    recommendations = []
    otm_percentages = [5, 10, 15, 20]
    
    for otm_pct in otm_percentages:
        call_option = find_option_by_strike_percent(calls, price, otm_pct, True)
        if call_option and call_option['premium'] > 0:
            premium = call_option['premium']
            strike = call_option['strike']
            option_yield = (premium / price) * 100
            upside_pct = ((strike - price) / price) * 100
            
            # Calculate annualized yield
            annualized_yield = option_yield * (365 / days_to_exp) if days_to_exp > 0 else 0
            
            recommendations.append({
                'strike': strike,
                'otmPercent': otm_pct,
                'premium': round(premium, 2),
                'optionYield': round(option_yield, 2),
                'annualizedYield': round(annualized_yield, 2),
                'upsidePercent': round(upside_pct, 2),
                'daysToExpiration': days_to_exp,
                'iv': round(call_option['iv'] * 100, 2) if call_option['iv'] else None,
                'volume': call_option['volume'],
                'openInterest': call_option['openInterest']
            })
    
    # Recommend based on best yield/upside ratio (prefer higher yield with reasonable upside)
    if recommendations:
        recommendations.sort(key=lambda x: x['annualizedYield'], reverse=True)
        # But prefer options with at least 5% upside
        best = None
        for rec in recommendations:
            if rec['upsidePercent'] >= 5:
                best = rec
                break
        if not best:
            best = recommendations[0]  # Fallback to highest yield
        
        for rec in recommendations:
            rec['recommended'] = (rec['strike'] == best['strike'])
    
    return recommendations


def calculate_collars(calls, puts, price: float, days_to_exp: int) -> List[Dict]:
    """Calculate collar recommendations (buy OTM put, sell OTM call where call is further OTM)."""
    recommendations = []
    
    # Try different put OTM percentages (5%, 10%, 15%)
    put_otm_percentages = [5, 10, 15]
    # Call should be further OTM, so try 10%, 15%, 20%, 25%
    call_otm_percentages = [10, 15, 20, 25]
    
    for put_otm in put_otm_percentages:
        put_option = find_option_by_strike_percent(puts, price, put_otm, False)
        if not put_option or put_option['premium'] <= 0:
            continue
        
        put_premium = put_option['premium']
        put_strike = put_option['strike']
        
        # Find call that's further OTM than the put
        for call_otm in call_otm_percentages:
            if call_otm <= put_otm:  # Call must be further OTM
                continue
            
            call_option = find_option_by_strike_percent(calls, price, call_otm, True)
            if not call_option or call_option['premium'] <= 0:
                continue
            
            call_premium = call_option['premium']
            call_strike = call_option['strike']
            
            # Net cost = Put premium - Call premium (we're selling the call)
            net_cost = put_premium - call_premium
            
            # Downside protection: how far below current price
            downside_protection_pct = ((price - put_strike) / price) * 100
            
            # Upside cap: how far above current price
            upside_cap_pct = ((call_strike - price) / price) * 100
            
            # Net cost as percentage of stock price
            net_cost_pct = (net_cost / price) * 100
            
            recommendations.append({
                'putStrike': put_strike,
                'callStrike': call_strike,
                'putOtmPercent': put_otm,
                'callOtmPercent': call_otm,
                'putPremium': round(put_premium, 2),
                'callPremium': round(call_premium, 2),
                'netCost': round(net_cost, 2),
                'netCostPercent': round(net_cost_pct, 2),
                'downsideProtection': round(downside_protection_pct, 2),
                'upsideCap': round(upside_cap_pct, 2),
                'daysToExpiration': days_to_exp,
                'putIv': round(put_option['iv'] * 100, 2) if put_option['iv'] else None,
                'callIv': round(call_option['iv'] * 100, 2) if call_option['iv'] else None
            })
    
    # Recommend based on best downside protection with reasonable net cost
    if recommendations:
        recommendations.sort(key=lambda x: (x['downsideProtection'], -x['netCostPercent']), reverse=True)
        best = recommendations[0]
        for rec in recommendations:
            rec['recommended'] = (rec['putStrike'] == best['putStrike'] and rec['callStrike'] == best['callStrike'])
    
    return recommendations


def calculate_delta(strike: float, spot: float, time_to_exp: float, iv: float, is_call: bool) -> float:
    """Approximate Black-Scholes delta."""
    from scipy.stats import norm
    if time_to_exp <= 0:
        return 1.0 if (is_call and strike < spot) or (not is_call and strike > spot) else 0.0
    
    d1 = (np.log(spot / strike) + (0.5 * iv * iv) * time_to_exp) / (iv * np.sqrt(time_to_exp))
    delta = norm.cdf(d1) if is_call else -norm.cdf(-d1)
    return abs(delta)


def find_option_by_delta(options_df, spot: float, target_delta: float, is_call: bool, time_to_exp: float) -> Optional[float]:
    """Find option with closest delta to target."""
    if options_df.empty:
        return None
    
    best_iv = None
    min_diff = float('inf')
    
    for _, row in options_df.iterrows():
        strike = row['strike']
        iv = row.get('impliedVolatility', 0.3)
        if iv <= 0:
            continue
        
        delta = calculate_delta(strike, spot, time_to_exp, iv, is_call)
        diff = abs(delta - target_delta)
        
        if diff < min_diff:
            min_diff = diff
            best_iv = iv
    
    return best_iv


def fetch_ticker_data(ticker: str) -> Optional[Dict]:
    """Fetch and process data for a single ticker."""
    try:
        print(f"Fetching data for {ticker}...")
        stock = yf.Ticker(ticker)
        info = stock.info
        
        # Get current price
        current_data = stock.history(period="1d")
        if current_data.empty:
            return None
        
        price = float(current_data['Close'].iloc[-1])
        
        # Get available expirations and find one in 45-80 day range
        expirations = stock.options
        if not expirations:
            return None
            
        expiration_str = find_expiration_45_80_days(expirations)
        if not expiration_str:
            # Fallback to closest available expiration
            today = datetime.now()
            best_exp = None
            best_diff = float('inf')
            for exp_str in expirations:
                exp_date = datetime.strptime(exp_str, "%Y-%m-%d")
                days_diff = abs((exp_date - today).days - 60)  # Target 60 days
                if days_diff < best_diff:
                    best_diff = days_diff
                    best_exp = exp_str
            if not best_exp:
                return None
            expiration_str = best_exp
        
        expiration = datetime.strptime(expiration_str, "%Y-%m-%d")
        
        try:
            option_chain = stock.option_chain(expiration_str)
        except Exception as e:
            print(f"  Error fetching option chain for {expiration_str}: {str(e)}")
            return None
        
        calls = option_chain.calls
        puts = option_chain.puts
        
        if calls.empty or puts.empty:
            return None
        
        # Calculate time to expiration
        today = datetime.now()
        days_to_exp = (expiration - today).days
        if days_to_exp <= 0:
            return None
        time_to_exp = days_to_exp / 365.0
        
        # Find ATM options for IV calculation
        atm_call = calls.iloc[(calls['strike'] - price).abs().argsort()[:1]]
        atm_put = puts.iloc[(puts['strike'] - price).abs().argsort()[:1]]
        
        if atm_call.empty or atm_put.empty:
            return None
        
        # Approximate IV from ATM options
        atm_call_iv = atm_call['impliedVolatility'].iloc[0] if 'impliedVolatility' in atm_call.columns else None
        atm_put_iv = atm_put['impliedVolatility'].iloc[0] if 'impliedVolatility' in atm_put.columns else None
        
        if atm_call_iv is None or atm_put_iv is None:
            # Fallback: estimate IV from historical volatility
            hist_data = stock.history(period="1mo")
            if not hist_data.empty:
                returns = hist_data['Close'].pct_change().dropna()
                hist_vol = returns.std() * np.sqrt(252)  # Annualized
                iv = hist_vol
            else:
                iv = 0.3  # Default
        else:
            iv = (atm_call_iv + atm_put_iv) / 2
        
        # Calculate 25 Delta Put and Call IV for Skew
        put_25_delta_iv = find_option_by_delta(puts, price, 0.25, False, time_to_exp)
        call_25_delta_iv = find_option_by_delta(calls, price, 0.25, True, time_to_exp)
        
        if put_25_delta_iv is None:
            put_25_delta_iv = iv * 1.1  # Approximate
        if call_25_delta_iv is None:
            call_25_delta_iv = iv * 0.9  # Approximate
        
        skew = put_25_delta_iv - call_25_delta_iv
        
        # Calculate Put/Call Ratio (volume based)
        total_put_volume = puts['volume'].sum() if 'volume' in puts.columns else 0
        total_call_volume = calls['volume'].sum() if 'volume' in calls.columns else 0
        
        if total_call_volume > 0:
            put_call_ratio = total_put_volume / total_call_volume
        else:
            put_call_ratio = 1.0
        
        # Calculate IV Rank (mock if 52wk data not available)
        # Try to get historical volatility data
        hist_data_1y = stock.history(period="1y")
        if not hist_data_1y.empty and len(hist_data_1y) > 50:
            # Calculate rolling 30-day volatility
            returns = hist_data_1y['Close'].pct_change().dropna()
            rolling_vol = returns.rolling(window=30).std() * np.sqrt(252)
            rolling_vol = rolling_vol.dropna()
            
            if len(rolling_vol) > 0:
                iv_high_52wk = rolling_vol.max()
                iv_low_52wk = rolling_vol.min()
                
                if iv_high_52wk > iv_low_52wk:
                    iv_rank = ((iv - iv_low_52wk) / (iv_high_52wk - iv_low_52wk)) * 100
                    iv_rank = max(0, min(100, iv_rank))
                else:
                    # Fallback: use current IV relative to historical average
                    iv_avg = rolling_vol.mean()
                    if iv_avg > 0:
                        iv_rank = (iv / iv_avg) * 50  # Rough estimate
                    else:
                        iv_rank = 50
            else:
                # Fallback: mock based on recent volatility
                recent_vol = returns.tail(30).std() * np.sqrt(252) if len(returns) >= 30 else 0.3
                iv_rank = min(100, max(0, (iv / 0.5) * 50)) if iv > 0 else 50
        else:
            # Mock IV Rank based on current IV
            iv_rank = min(100, max(0, (iv / 0.5) * 50)) if iv > 0 else 50
        
        # Apply Marine Layer Logic
        if iv_rank > 50 and skew > 0:
            strategy = "Income Generator"
            rationale = "High premiums available. Sell calls."
        elif iv_rank < 30 or skew < -2:
            strategy = "Cheap Protection"
            rationale = "Downside hedges are historically cheap. Buy Puts/Collars."
        else:
            strategy = "Neutral"
            rationale = "Market conditions are neutral. Consider covered calls or protective puts."
        
        # Calculate option recommendations based on strategy
        option_recommendations = None
        if strategy == "Income Generator":
            option_recommendations = calculate_covered_calls(calls, price, days_to_exp)
        elif strategy == "Cheap Protection":
            option_recommendations = calculate_collars(calls, puts, price, days_to_exp)
        
        result = {
            "ticker": ticker,
            "name": COMPANY_NAMES.get(ticker, ticker),
            "price": round(price, 2),
            "iv": round(iv * 100, 2),  # Convert to percentage
            "ivRank": round(iv_rank, 1),
            "skew": round(skew * 100, 2),  # Convert to percentage points
            "putCallRatio": round(put_call_ratio, 2),
            "strategy": strategy,
            "rationale": rationale,
            "expiration": expiration_str,
            "daysToExpiration": days_to_exp
        }
        
        if option_recommendations:
            result["optionRecommendations"] = option_recommendations
        
        return result
    
    except Exception as e:
        print(f"Error processing {ticker}: {str(e)}")
        return None


def main():
    """Main function to fetch and save market data."""
    print("Starting Marine Layer Advisors data fetch...")
    
    results = []
    for ticker in TICKERS:
        data = fetch_ticker_data(ticker)
        if data:
            results.append(data)
        # Small delay to avoid rate limiting
        import time
        time.sleep(0.1)
    
    # Sort by IV Rank (descending)
    results.sort(key=lambda x: x['ivRank'], reverse=True)
    
    # Create public directory if it doesn't exist
    os.makedirs("public", exist_ok=True)
    
    # Save to JSON
    output_path = "public/market_data.json"
    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nSuccessfully fetched data for {len(results)} tickers.")
    print(f"Data saved to {output_path}")


if __name__ == "__main__":
    main()

