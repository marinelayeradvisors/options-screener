#!/bin/bash

# Marine Layer Advisors - Market Data Refresh Script
# This script refreshes the market data by running the Python fetcher

echo "🔄 Refreshing market data..."
echo ""

# Check if Python 3 is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: python3 is not installed or not in PATH"
    exit 1
fi

# Run the Python script
python3 fetch_market_data.py

# Check if the script succeeded
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Market data refreshed successfully!"
    echo "📊 Data saved to public/market_data.json"
    echo ""
    echo "💡 Tip: Refresh your browser to see the updated data."
else
    echo ""
    echo "❌ Error: Failed to refresh market data"
    exit 1
fi

