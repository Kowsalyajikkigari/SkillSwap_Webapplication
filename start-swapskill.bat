@echo off
REM SwapSkill Application Startup Script for Windows (Batch)
REM This script starts both Django backend and React frontend servers simultaneously

setlocal enabledelayedexpansion

REM Default configuration
set BACKEND_PORT=8000
set FRONTEND_PORT=3000
set PRODUCTION=false

REM Parse command line arguments
:parse_args
if "%~1"=="" goto start_app
if "%~1"=="-h" goto show_help
if "%~1"=="--help" goto show_help
if "%~1"=="-b" (
    set BACKEND_PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--backend-port" (
    set BACKEND_PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="-f" (
    set FRONTEND_PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="--frontend-port" (
    set FRONTEND_PORT=%~2
    shift
    shift
    goto parse_args
)
if "%~1"=="-p" (
    set PRODUCTION=true
    shift
    goto parse_args
)
if "%~1"=="--production" (
    set PRODUCTION=true
    shift
    goto parse_args
)
echo Unknown option: %~1
echo Use --help for usage information
exit /b 1

:show_help
echo SwapSkill Application Startup Script
echo ====================================
echo.
echo Usage: start-swapskill.bat [OPTIONS]
echo.
echo Options:
echo   -b, --backend-port ^<port^>    Backend server port (default: 8000)
echo   -f, --frontend-port ^<port^>   Frontend server port (default: 3000)
echo   -p, --production            Start in production mode
echo   -h, --help                  Show this help message
echo.
echo Examples:
echo   start-swapskill.bat                      # Start with default ports
echo   start-swapskill.bat -b 8002              # Custom backend port
echo   start-swapskill.bat --production         # Production mode
exit /b 0

:start_app
echo.
echo 🚀 SwapSkill Application Startup
echo =================================
echo.

REM Check if directories exist
if not exist "skill-swap-backend" (
    echo ❌ Backend directory not found
    exit /b 1
)

if not exist "skill-swap-frontend" (
    echo ❌ Frontend directory not found
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python not found. Please install Python 3.8+
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found. Please install Node.js 16+
    exit /b 1
)

echo ✅ Prerequisites check passed

REM Setup backend
echo.
echo 📊 Setting up Django backend...
cd skill-swap-backend

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ❌ Failed to create virtual environment
        cd ..
        exit /b 1
    )
)

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing Python dependencies...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo ❌ Failed to install Python dependencies
    cd ..
    exit /b 1
)

REM Run migrations
echo Running database migrations...
python manage.py migrate --verbosity=0
if errorlevel 1 (
    echo ❌ Database migrations failed
    cd ..
    exit /b 1
)

echo ✅ Backend setup completed
cd ..

REM Setup frontend
echo.
echo ⚛️ Setting up React frontend...
cd skill-swap-frontend

REM Install dependencies if needed
if not exist "node_modules" (
    echo Installing Node.js dependencies...
    npm install --silent
    if errorlevel 1 (
        echo ❌ Failed to install Node.js dependencies
        cd ..
        exit /b 1
    )
)

echo ✅ Frontend setup completed
cd ..

REM Start servers
echo.
echo 🚀 Starting servers...

REM Kill any existing processes on the ports
echo Checking for existing processes on ports...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%BACKEND_PORT%') do (
    taskkill /PID %%a /F >nul 2>&1
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :%FRONTEND_PORT%') do (
    taskkill /PID %%a /F >nul 2>&1
)

REM Start backend server
echo Starting Django backend server on port %BACKEND_PORT%...
cd skill-swap-backend
if "%PRODUCTION%"=="true" (
    start "SwapSkill Backend" cmd /k "venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:%BACKEND_PORT% --settings=skillswap.settings_production"
) else (
    start "SwapSkill Backend" cmd /k "venv\Scripts\activate.bat && python manage.py runserver 127.0.0.1:%BACKEND_PORT%"
)
cd ..

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo Starting React frontend server on port %FRONTEND_PORT%...
cd skill-swap-frontend

REM Set environment variables
set REACT_APP_API_URL=http://localhost:%BACKEND_PORT%/api
set REACT_APP_WS_URL=ws://localhost:%BACKEND_PORT%/ws

if "%PRODUCTION%"=="true" (
    start "SwapSkill Frontend" cmd /k "npm run build && npx serve -s build -l %FRONTEND_PORT%"
) else (
    start "SwapSkill Frontend" cmd /k "npx vite --host --port %FRONTEND_PORT%"
)
cd ..

REM Wait for servers to start
echo.
echo ⏳ Waiting for servers to start...
timeout /t 5 /nobreak >nul

echo.
echo 🎉 SwapSkill application is starting!
echo.
echo 📱 Frontend: http://localhost:%FRONTEND_PORT%
echo 🔧 Backend API: http://localhost:%BACKEND_PORT%/api/
echo 👨‍💼 Admin Panel: http://localhost:%BACKEND_PORT%/admin/
echo 📊 Health Check: http://localhost:%BACKEND_PORT%/health/
echo.
echo ℹ️ Both servers are running in separate windows.
echo ℹ️ Close the terminal windows to stop the servers.
echo.
echo ✅ Startup complete! You can now use SwapSkill.

REM Open the application in browser
echo Opening SwapSkill in your default browser...
start http://localhost:%FRONTEND_PORT%

pause
