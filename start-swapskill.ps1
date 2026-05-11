# SwapSkill Application Startup Script for Windows
# This script starts both Django backend and React frontend servers simultaneously

param(
    [string]$BackendPort = "8000",
    [string]$FrontendPort = "3000",
    [switch]$Production = $false,
    [switch]$Help = $false
)

# Colors for output
$Red = "Red"
$Green = "Green"
$Yellow = "Yellow"
$Blue = "Cyan"
$White = "White"

# Function to display help
function Show-Help {
    Write-Host "SwapSkill Application Startup Script" -ForegroundColor $Blue
    Write-Host "=====================================" -ForegroundColor $Blue
    Write-Host ""
    Write-Host "Usage: .\start-swapskill.ps1 [OPTIONS]" -ForegroundColor $White
    Write-Host ""
    Write-Host "Options:" -ForegroundColor $Yellow
    Write-Host "  -BackendPort <port>    Backend server port (default: 8000)" -ForegroundColor $White
    Write-Host "  -FrontendPort <port>   Frontend server port (default: 3000)" -ForegroundColor $White
    Write-Host "  -Production           Start in production mode" -ForegroundColor $White
    Write-Host "  -Help                 Show this help message" -ForegroundColor $White
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor $Yellow
    Write-Host "  .\start-swapskill.ps1                    # Start with default ports" -ForegroundColor $White
    Write-Host "  .\start-swapskill.ps1 -BackendPort 8002  # Custom backend port" -ForegroundColor $White
    Write-Host "  .\start-swapskill.ps1 -Production        # Production mode" -ForegroundColor $White
    exit 0
}

if ($Help) {
    Show-Help
}

# Function to log messages with timestamp
function Write-Log {
    param([string]$Message, [string]$Color = $White)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor $Color
}

# Function to check if port is available
function Test-Port {
    param([int]$Port)
    try {
        $connection = New-Object System.Net.Sockets.TcpClient
        $connection.Connect("localhost", $Port)
        $connection.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to kill processes on specific ports
function Stop-ProcessOnPort {
    param([int]$Port)
    try {
        $processes = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
        foreach ($processId in $processes) {
            if ($processId -and $processId -ne 0) {
                Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
                Write-Log "Stopped process $processId on port $Port" $Yellow
            }
        }
    }
    catch {
        Write-Log "No processes found on port $Port" $Yellow
    }
}

# Function to check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..." $Blue
    
    # Check if Python is installed
    try {
        $pythonVersion = python --version 2>&1
        Write-Log "✅ Python: $pythonVersion" $Green
    }
    catch {
        Write-Log "❌ Python not found. Please install Python 3.8+" $Red
        return $false
    }
    
    # Check if Node.js is installed
    try {
        $nodeVersion = node --version 2>&1
        Write-Log "✅ Node.js: $nodeVersion" $Green
    }
    catch {
        Write-Log "❌ Node.js not found. Please install Node.js 16+" $Red
        return $false
    }
    
    # Check if npm is installed
    try {
        $npmVersion = npm --version 2>&1
        Write-Log "✅ npm: v$npmVersion" $Green
    }
    catch {
        Write-Log "❌ npm not found. Please install npm" $Red
        return $false
    }
    
    return $true
}

# Function to setup backend environment
function Setup-Backend {
    Write-Log "Setting up Django backend..." $Blue
    
    # Navigate to backend directory
    if (-not (Test-Path "skill-swap-backend")) {
        Write-Log "❌ Backend directory not found" $Red
        return $false
    }
    
    Set-Location "skill-swap-backend"
    
    # Check if virtual environment exists
    if (-not (Test-Path "venv")) {
        Write-Log "Creating Python virtual environment..." $Yellow
        python -m venv venv
        if ($LASTEXITCODE -ne 0) {
            Write-Log "❌ Failed to create virtual environment" $Red
            Set-Location ".."
            return $false
        }
    }
    
    # Activate virtual environment
    Write-Log "Activating virtual environment..." $Yellow
    & "venv\Scripts\Activate.ps1"
    
    # Install/update dependencies
    Write-Log "Installing Python dependencies..." $Yellow
    pip install -r requirements.txt --quiet
    if ($LASTEXITCODE -ne 0) {
        Write-Log "❌ Failed to install Python dependencies" $Red
        Set-Location ".."
        return $false
    }
    
    # Run migrations
    Write-Log "Running database migrations..." $Yellow
    python manage.py migrate --verbosity=0
    if ($LASTEXITCODE -ne 0) {
        Write-Log "❌ Database migrations failed" $Red
        Set-Location ".."
        return $false
    }
    
    # Collect static files
    Write-Log "Collecting static files..." $Yellow
    python manage.py collectstatic --noinput --verbosity=0
    if ($LASTEXITCODE -ne 0) {
        Write-Log "⚠️ Static files collection failed (non-critical)" $Yellow
    }
    
    Set-Location ".."
    Write-Log "✅ Backend setup completed" $Green
    return $true
}

# Function to setup frontend environment
function Setup-Frontend {
    Write-Log "Setting up React frontend..." $Blue
    
    # Navigate to frontend directory
    if (-not (Test-Path "skill-swap-frontend")) {
        Write-Log "❌ Frontend directory not found" $Red
        return $false
    }
    
    Set-Location "skill-swap-frontend"
    
    # Install/update dependencies
    if (-not (Test-Path "node_modules") -or (Test-Path "package-lock.json" -and ((Get-Item "package-lock.json").LastWriteTime -gt (Get-Item "node_modules").LastWriteTime))) {
        Write-Log "Installing Node.js dependencies..." $Yellow
        npm install --silent
        if ($LASTEXITCODE -ne 0) {
            Write-Log "❌ Failed to install Node.js dependencies" $Red
            Set-Location ".."
            return $false
        }
    }
    
    Set-Location ".."
    Write-Log "✅ Frontend setup completed" $Green
    return $true
}

# Function to start backend server
function Start-Backend {
    Write-Log "Starting Django backend server on port $BackendPort..." $Blue
    
    # Check if port is available
    if (Test-Port $BackendPort) {
        Write-Log "Port $BackendPort is in use. Attempting to free it..." $Yellow
        Stop-ProcessOnPort $BackendPort
        Start-Sleep -Seconds 2
    }
    
    Set-Location "skill-swap-backend"
    
    # Activate virtual environment and start server
    $backendCommand = if ($Production) {
        "& venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:$BackendPort --settings=skillswap.settings_production"
    } else {
        "& venv\Scripts\Activate.ps1; python manage.py runserver 127.0.0.1:$BackendPort"
    }
    
    $backendJob = Start-Job -ScriptBlock {
        param($command, $workingDir)
        Set-Location $workingDir
        Invoke-Expression $command
    } -ArgumentList $backendCommand, (Get-Location).Path
    
    Set-Location ".."
    
    # Wait for backend to start
    $maxWait = 30
    $waited = 0
    while ($waited -lt $maxWait) {
        if (Test-Port $BackendPort) {
            Write-Log "✅ Backend server started successfully on http://127.0.0.1:$BackendPort" $Green
            return $backendJob
        }
        Start-Sleep -Seconds 1
        $waited++
    }
    
    Write-Log "❌ Backend server failed to start within $maxWait seconds" $Red
    Stop-Job $backendJob -ErrorAction SilentlyContinue
    Remove-Job $backendJob -ErrorAction SilentlyContinue
    return $null
}

# Function to start frontend server
function Start-Frontend {
    Write-Log "Starting React frontend server on port $FrontendPort..." $Blue
    
    # Check if port is available
    if (Test-Port $FrontendPort) {
        Write-Log "Port $FrontendPort is in use. Attempting to free it..." $Yellow
        Stop-ProcessOnPort $FrontendPort
        Start-Sleep -Seconds 2
    }
    
    Set-Location "skill-swap-frontend"
    
    # Set environment variables
    $env:REACT_APP_API_URL = "http://localhost:$BackendPort/api"
    $env:REACT_APP_WS_URL = "ws://localhost:$BackendPort/ws"
    
    $frontendCommand = if ($Production) {
        "npm run build; npx serve -s build -l $FrontendPort"
    } else {
        "npx vite --host --port $FrontendPort"
    }
    
    $frontendJob = Start-Job -ScriptBlock {
        param($command, $workingDir, $apiUrl, $wsUrl)
        Set-Location $workingDir
        $env:REACT_APP_API_URL = $apiUrl
        $env:REACT_APP_WS_URL = $wsUrl
        Invoke-Expression $command
    } -ArgumentList $frontendCommand, (Get-Location).Path, $env:REACT_APP_API_URL, $env:REACT_APP_WS_URL
    
    Set-Location ".."
    
    # Wait for frontend to start
    $maxWait = 60
    $waited = 0
    while ($waited -lt $maxWait) {
        if (Test-Port $FrontendPort) {
            Write-Log "✅ Frontend server started successfully on http://localhost:$FrontendPort" $Green
            return $frontendJob
        }
        Start-Sleep -Seconds 1
        $waited++
    }
    
    Write-Log "❌ Frontend server failed to start within $maxWait seconds" $Red
    Stop-Job $frontendJob -ErrorAction SilentlyContinue
    Remove-Job $frontendJob -ErrorAction SilentlyContinue
    return $null
}

# Function to monitor servers
function Monitor-Servers {
    param($BackendJob, $FrontendJob)
    
    Write-Log "🚀 SwapSkill application is running!" $Green
    Write-Log "📱 Frontend: http://localhost:$FrontendPort" $Blue
    Write-Log "🔧 Backend API: http://localhost:$BackendPort/api/" $Blue
    Write-Log "👨‍💼 Admin Panel: http://localhost:$BackendPort/admin/" $Blue
    Write-Log "📊 Health Check: http://localhost:$BackendPort/health/" $Blue
    Write-Log "" $White
    Write-Log "Press Ctrl+C to stop both servers..." $Yellow
    
    try {
        while ($true) {
            # Check if jobs are still running
            if ($BackendJob.State -eq "Failed" -or $BackendJob.State -eq "Completed") {
                Write-Log "❌ Backend server stopped unexpectedly" $Red
                break
            }
            
            if ($FrontendJob.State -eq "Failed" -or $FrontendJob.State -eq "Completed") {
                Write-Log "❌ Frontend server stopped unexpectedly" $Red
                break
            }
            
            Start-Sleep -Seconds 5
        }
    }
    catch {
        Write-Log "Shutting down servers..." $Yellow
    }
    finally {
        # Cleanup
        Write-Log "Stopping servers..." $Yellow
        Stop-Job $BackendJob -ErrorAction SilentlyContinue
        Stop-Job $FrontendJob -ErrorAction SilentlyContinue
        Remove-Job $BackendJob -ErrorAction SilentlyContinue
        Remove-Job $FrontendJob -ErrorAction SilentlyContinue
        
        # Kill processes on ports
        Stop-ProcessOnPort $BackendPort
        Stop-ProcessOnPort $FrontendPort
        
        Write-Log "✅ SwapSkill application stopped" $Green
    }
}

# Main execution
function Main {
    Write-Host ""
    Write-Host "SwapSkill Application Startup" -ForegroundColor $Blue
    Write-Host "=================================" -ForegroundColor $Blue
    Write-Host ""
    
    # Check prerequisites
    if (-not (Test-Prerequisites)) {
        exit 1
    }
    
    # Setup environments
    if (-not (Setup-Backend)) {
        exit 1
    }
    
    if (-not (Setup-Frontend)) {
        exit 1
    }
    
    # Start servers
    $backendJob = Start-Backend
    if (-not $backendJob) {
        exit 1
    }
    
    $frontendJob = Start-Frontend
    if (-not $frontendJob) {
        Stop-Job $backendJob -ErrorAction SilentlyContinue
        Remove-Job $backendJob -ErrorAction SilentlyContinue
        exit 1
    }
    
    # Monitor servers
    Monitor-Servers $backendJob $frontendJob
}

# Run main function
Main
