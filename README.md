# Marine Layer Advisors - Options Dashboard

A professional options screening dashboard for financial advisors to identify trade opportunities based on volatility metrics and market conditions.

## Architecture

### Part 1: Data Engine (Python)

The Python script (`fetch_market_data.py`) fetches market data for the top 75 most liquid US Tech/Consumer stocks and calculates key metrics:

- **Implied Volatility (IV)**: Approximated from ATM options
- **IV Rank**: Historical percentile ranking of current IV
- **Skew**: Difference between 25 Delta Put IV and 25 Delta Call IV
- **Put/Call Ratio**: Volume-based ratio

The script applies "Marine Layer Logic" to assign strategy tags:
- **Income Generator**: High IV Rank (>50) and positive Skew → Sell calls
- **Cheap Protection**: Low IV Rank (<30) or negative Skew (<-2) → Buy puts/collars
- **Neutral**: All other conditions

### Part 2: Web Application (Next.js)

A modern, responsive dashboard built with Next.js 16 (App Router) and Tailwind CSS featuring:

- Clean data table with filtering capabilities
- Visual IV Rank progress bars
- Strategy badges with color coding
- Detailed Spotlight Card modal for each ticker
- Professional financial theme (Dark Navy header, white backgrounds)

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+
- npm or yarn

### Installation

1. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

### Usage

1. **Generate Market Data:**
   ```bash
   python3 fetch_market_data.py
   ```
   
   Note: On macOS, use `python3` instead of `python`. The script will fetch data for all 75 tickers, which may take several minutes. Some tickers may fail due to rate limiting, but the script will continue processing the remaining tickers.
   
   This will create `public/market_data.json` with the latest market data for all 75 tickers.
   
   **To refresh market data:** Simply re-run the command above. The script will overwrite the existing `market_data.json` file with fresh data. It's recommended to refresh data daily or before important trading sessions.

2. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

3. **Build for Production:**
   ```bash
   npm run build
   npm start
   ```

## Features

### Dashboard

- **Filtering**: Filter opportunities by strategy (All, Income Generator, Cheap Protection)
- **Data Table**: View all tickers with key metrics at a glance
- **IV Rank Visualization**: Color-coded progress bars (Red >70%, Orange 50-70%, Yellow 30-50%, Green <30%)
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile devices

### Spotlight Card

Click any row in the table to open a detailed view with:

- **Strategy Badge**: Large, color-coded badge indicating the recommended strategy
- **Key Metrics**: 
  - 99th %ile Crowding
  - Skew Status (Cheap/Expensive)
  - IV Status (Low/Moderate/Elevated)
- **Additional Data**: Price, IV Rank, Skew, Put/Call Ratio
- **Marine Layer Take**: Contextual analysis and recommendations
- **Action Button**: Direct mailto link to request a term sheet

## Data Structure

The `market_data.json` file contains an array of objects with the following structure:

```json
{
  "ticker": "AAPL",
  "name": "Apple Inc",
  "price": 220.50,
  "iv": 25.5,
  "ivRank": 65.0,
  "skew": 2.3,
  "putCallRatio": 1.2,
  "strategy": "Income Generator",
  "rationale": "High premiums available. Sell calls.",
  "expiration": "2024-02-16"
}
```

## Notes

- The Python script includes rate limiting to avoid API throttling
- IV Rank calculation uses historical volatility data when available, with fallback to mock values
- Option chain data is fetched for the next monthly expiration (~30-45 days out)
- The dashboard automatically loads data from `public/market_data.json` on page load

## Technology Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Icons**: Lucide React
- **Data**: yfinance (Python)
- **Styling**: Tailwind CSS with custom financial theme

