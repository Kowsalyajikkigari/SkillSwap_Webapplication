@echo off
REM Production ASGI Server Startup Script for SkillSwap (Windows)
echo 🚀 Starting SkillSwap Production Server with Full WebSocket Support...
echo.

REM Check if Python is available
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python is not installed or not in PATH
    pause
    exit /b 1
)

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo 📦 Activating virtual environment...
    call venv\Scripts\activate.bat
) else (
    echo ⚠️  No virtual environment found, using system Python
)

REM Check if required packages are installed
echo 🔍 Checking dependencies...
python -c "import daphne, channels, django" >nul 2>&1
if errorlevel 1 (
    echo ❌ Required packages not installed. Installing dependencies...
    pip install -r requirements.txt
)

REM Run database migrations
echo 🗄️ Running database migrations...
python manage.py migrate
if errorlevel 1 (
    echo ❌ Database migration failed
    pause
    exit /b 1
)

REM Collect static files for production
echo 📁 Collecting static files...
python manage.py collectstatic --noinput

REM Start production ASGI server with WebSocket support
echo.
echo 🌐 Starting Production ASGI Server...
echo ✅ HTTP API: http://127.0.0.1:8000/api/
echo ✅ WebSocket: ws://127.0.0.1:8000/ws/
echo ✅ Admin Panel: http://127.0.0.1:8000/admin/
echo.
echo 🔥 Production server starting with full real-time features...
echo Press Ctrl+C to stop the server
echo.

daphne -b 127.0.0.1 -p 8000 skillswap.asgi:application
