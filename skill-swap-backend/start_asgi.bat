@echo off
REM ASGI Server Startup Script for SwapSkill (Windows)
echo 🚀 Starting SwapSkill with ASGI (WebSocket support)...

REM Activate virtual environment if it exists
if exist "venv\Scripts\activate.bat" (
    echo 📦 Activating virtual environment...
    call venv\Scripts\activate.bat
)

REM Run database migrations
echo 🗄️ Running database migrations...
python manage.py migrate

REM Start ASGI server with WebSocket support
echo 🌐 Starting ASGI server on http://127.0.0.1:8000
echo ✅ WebSocket endpoints will be available at ws://127.0.0.1:8000/ws/
daphne -b 127.0.0.1 -p 8000 skillswap.asgi:application
