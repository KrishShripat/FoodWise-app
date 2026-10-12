#!/usr/bin/env bash
# ==============================================================================
# FoodWise (Love Food) — 1-Click Startup Script (Linux / macOS)
# ==============================================================================

echo "=========================================================="
echo "  🥗 Starting FoodWise — Food Waste Intelligence Platform"
echo "=========================================================="

# 1. Check Python installation
if ! command -v python3 &> /dev/null && ! command -v python &> /dev/null; then
    echo "❌ Error: Python is not installed. Please install Python 3.10+."
    exit 1
fi

PY_CMD="python3"
if ! command -v python3 &> /dev/null; then
    PY_CMD="python"
fi

# 2. Setup Virtual Environment if it does not exist
if [ ! -d ".venv" ]; then
    echo "📦 Creating virtual environment (.venv)..."
    $PY_CMD -m venv .venv
fi

# 3. Activate venv
source .venv/bin/activate || source .venv/Scripts/activate

# 4. Install dependencies
echo "📥 Checking and installing dependencies from requirements.txt..."
pip install -r requirements.txt

# 5. Check if model exists or train it
if [ ! -f "foodwise_model.joblib" ]; then
    echo "🤖 Training local Gradient Boosting ML model..."
    python train_model.py
fi

# 6. Launch Streamlit Application
echo ""
echo "🚀 Launching Love Food prototype at http://localhost:8501 ..."
echo "Press Ctrl+C to stop the server."
echo ""
streamlit run app.py --server.port 8501
