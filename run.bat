@echo off
REM ==============================================================================
REM FoodWise (Love Food) — 1-Click Startup Script (Windows)
REM ==============================================================================

echo ==========================================================
echo   FoodWise - Food Waste Intelligence Platform
echo ==========================================================
echo.

REM 1. Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in PATH. Please install Python 3.10+.
    pause
    exit /b 1
)

REM 2. Create virtual environment if missing
if not exist ".venv" (
    echo [INFO] Creating Python virtual environment (.venv)...
    python -m venv .venv
)

REM 3. Activate virtual environment
call .venv\Scripts\activate.bat

REM 4. Install requirements
echo [INFO] Installing required dependencies...
pip install -r requirements.txt

REM 5. Train model if missing
if not exist "foodwise_model.joblib" (
    echo [INFO] Training ML model locally...
    python train_model.py
)

REM 6. Launch Streamlit
echo.
echo [SUCCESS] Launching FoodWise prototype at http://localhost:8501 ...
echo Press Ctrl+C in this terminal window to stop the server.
echo.
streamlit run app.py --server.port 8501

pause
