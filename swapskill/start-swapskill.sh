#!/bin/bash

# SwapSkill Application Startup Script for Unix/Linux/macOS
# This script starts both Django backend and React frontend servers simultaneously

set -e  # Exit on any error

# Default configuration
BACKEND_PORT=${BACKEND_PORT:-8000}
FRONTEND_PORT=${FRONTEND_PORT:-3000}
PRODUCTION=${PRODUCTION:-false}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color

# PIDs for cleanup
BACKEND_PID=""
FRONTEND_PID=""

# Function to display help
show_help() {
    echo -e "${BLUE}SwapSkill Application Startup Script${NC}"
    echo -e "${BLUE}=====================================${NC}"
    echo ""
    echo -e "${WHITE}Usage: ./start-swapskill.sh [OPTIONS]${NC}"
    echo ""
    echo -e "${YELLOW}Options:${NC}"
    echo -e "${WHITE}  -b, --backend-port <port>    Backend server port (default: 8001)${NC}"
    echo -e "${WHITE}  -f, --frontend-port <port>   Frontend server port (default: 3000)${NC}"
    echo -e "${WHITE}  -p, --production            Start in production mode${NC}"
    echo -e "${WHITE}  -h, --help                  Show this help message${NC}"
    echo ""
    echo -e "${YELLOW}Environment Variables:${NC}"
    echo -e "${WHITE}  BACKEND_PORT                Backend server port${NC}"
    echo -e "${WHITE}  FRONTEND_PORT               Frontend server port${NC}"
    echo -e "${WHITE}  PRODUCTION                  Production mode (true/false)${NC}"
    echo ""
    echo -e "${YELLOW}Examples:${NC}"
    echo -e "${WHITE}  ./start-swapskill.sh                      # Start with default ports${NC}"
    echo -e "${WHITE}  ./start-swapskill.sh -b 8002              # Custom backend port${NC}"
    echo -e "${WHITE}  ./start-swapskill.sh --production         # Production mode${NC}"
    echo -e "${WHITE}  BACKEND_PORT=8002 ./start-swapskill.sh    # Using environment variable${NC}"
    exit 0
}

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -b|--backend-port)
            BACKEND_PORT="$2"
            shift 2
            ;;
        -f|--frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        -p|--production)
            PRODUCTION=true
            shift
            ;;
        -h|--help)
            show_help
            ;;
        *)
            echo -e "${RED}Unknown option: $1${NC}"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

# Function to log messages with timestamp
log() {
    local message="$1"
    local color="${2:-$WHITE}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo -e "${color}[$timestamp] $message${NC}"
}

# Function to check if port is available
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1; then
        return 1  # Port is in use
    else
        return 0  # Port is available
    fi
}

# Function to kill process on specific port
kill_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    if [ ! -z "$pids" ]; then
        echo "$pids" | xargs kill -9 2>/dev/null || true
        log "Stopped processes on port $port" $YELLOW
        sleep 2
    fi
}

# Function to check prerequisites
check_prerequisites() {
    log "Checking prerequisites..." $BLUE
    
    # Check if Python is installed
    if command -v python3 &> /dev/null; then
        local python_version=$(python3 --version 2>&1)
        log "✅ Python: $python_version" $GREEN
    elif command -v python &> /dev/null; then
        local python_version=$(python --version 2>&1)
        log "✅ Python: $python_version" $GREEN
    else
        log "❌ Python not found. Please install Python 3.8+" $RED
        return 1
    fi
    
    # Check if Node.js is installed
    if command -v node &> /dev/null; then
        local node_version=$(node --version 2>&1)
        log "✅ Node.js: $node_version" $GREEN
    else
        log "❌ Node.js not found. Please install Node.js 16+" $RED
        return 1
    fi
    
    # Check if npm is installed
    if command -v npm &> /dev/null; then
        local npm_version=$(npm --version 2>&1)
        log "✅ npm: v$npm_version" $GREEN
    else
        log "❌ npm not found. Please install npm" $RED
        return 1
    fi
    
    return 0
}

# Function to setup backend environment
setup_backend() {
    log "Setting up Django backend..." $BLUE
    
    # Navigate to backend directory
    if [ ! -d "skill-swap-backend" ]; then
        log "❌ Backend directory not found" $RED
        return 1
    fi
    
    cd skill-swap-backend
    
    # Determine Python command
    if command -v python3 &> /dev/null; then
        PYTHON_CMD="python3"
    else
        PYTHON_CMD="python"
    fi
    
    # Check if virtual environment exists
    if [ ! -d "venv" ]; then
        log "Creating Python virtual environment..." $YELLOW
        $PYTHON_CMD -m venv venv
        if [ $? -ne 0 ]; then
            log "❌ Failed to create virtual environment" $RED
            cd ..
            return 1
        fi
    fi
    
    # Activate virtual environment
    log "Activating virtual environment..." $YELLOW
    source venv/bin/activate
    
    # Install/update dependencies
    log "Installing Python dependencies..." $YELLOW
    pip install -r requirements.txt --quiet
    if [ $? -ne 0 ]; then
        log "❌ Failed to install Python dependencies" $RED
        cd ..
        return 1
    fi
    
    # Run migrations
    log "Running database migrations..." $YELLOW
    python manage.py migrate --verbosity=0
    if [ $? -ne 0 ]; then
        log "❌ Database migrations failed" $RED
        cd ..
        return 1
    fi
    
    # Collect static files
    log "Collecting static files..." $YELLOW
    python manage.py collectstatic --noinput --verbosity=0 2>/dev/null || {
        log "⚠️ Static files collection failed (non-critical)" $YELLOW
    }
    
    cd ..
    log "✅ Backend setup completed" $GREEN
    return 0
}

# Function to setup frontend environment
setup_frontend() {
    log "Setting up React frontend..." $BLUE
    
    # Navigate to frontend directory
    if [ ! -d "skill-swap-frontend" ]; then
        log "❌ Frontend directory not found" $RED
        return 1
    fi
    
    cd skill-swap-frontend
    
    # Install/update dependencies
    if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
        log "Installing Node.js dependencies..." $YELLOW
        npm install --silent
        if [ $? -ne 0 ]; then
            log "❌ Failed to install Node.js dependencies" $RED
            cd ..
            return 1
        fi
    fi
    
    cd ..
    log "✅ Frontend setup completed" $GREEN
    return 0
}

# Function to start backend server
start_backend() {
    log "Starting Django backend server on port $BACKEND_PORT..." $BLUE
    
    # Check if port is available
    if ! check_port $BACKEND_PORT; then
        log "Port $BACKEND_PORT is in use. Attempting to free it..." $YELLOW
        kill_port $BACKEND_PORT
    fi
    
    cd skill-swap-backend
    
    # Activate virtual environment and start server
    source venv/bin/activate
    
    if [ "$PRODUCTION" = true ]; then
        python manage.py runserver 127.0.0.1:$BACKEND_PORT --settings=skillswap.settings_production &
    else
        python manage.py runserver 127.0.0.1:$BACKEND_PORT &
    fi
    
    BACKEND_PID=$!
    cd ..
    
    # Wait for backend to start
    local max_wait=30
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if ! check_port $BACKEND_PORT; then
            log "✅ Backend server started successfully on http://127.0.0.1:$BACKEND_PORT" $GREEN
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done
    
    log "❌ Backend server failed to start within $max_wait seconds" $RED
    kill $BACKEND_PID 2>/dev/null || true
    return 1
}

# Function to start frontend server
start_frontend() {
    log "Starting React frontend server on port $FRONTEND_PORT..." $BLUE
    
    # Check if port is available
    if ! check_port $FRONTEND_PORT; then
        log "Port $FRONTEND_PORT is in use. Attempting to free it..." $YELLOW
        kill_port $FRONTEND_PORT
    fi
    
    cd skill-swap-frontend
    
    # Set environment variables
    export REACT_APP_API_URL="http://localhost:$BACKEND_PORT/api"
    export REACT_APP_WS_URL="ws://localhost:$BACKEND_PORT/ws"
    
    if [ "$PRODUCTION" = true ]; then
        npm run build && npx serve -s build -l $FRONTEND_PORT &
    else
        npx vite --host --port $FRONTEND_PORT &
    fi
    
    FRONTEND_PID=$!
    cd ..
    
    # Wait for frontend to start
    local max_wait=60
    local waited=0
    while [ $waited -lt $max_wait ]; do
        if ! check_port $FRONTEND_PORT; then
            log "✅ Frontend server started successfully on http://localhost:$FRONTEND_PORT" $GREEN
            return 0
        fi
        sleep 1
        waited=$((waited + 1))
    done
    
    log "❌ Frontend server failed to start within $max_wait seconds" $RED
    kill $FRONTEND_PID 2>/dev/null || true
    return 1
}

# Function to cleanup on exit
cleanup() {
    log "Shutting down servers..." $YELLOW
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    # Kill processes on ports
    kill_port $BACKEND_PORT
    kill_port $FRONTEND_PORT
    
    log "✅ SwapSkill application stopped" $GREEN
    exit 0
}

# Function to monitor servers
monitor_servers() {
    log "🚀 SwapSkill application is running!" $GREEN
    log "📱 Frontend: http://localhost:$FRONTEND_PORT" $CYAN
    log "🔧 Backend API: http://localhost:$BACKEND_PORT/api/" $CYAN
    log "👨‍💼 Admin Panel: http://localhost:$BACKEND_PORT/admin/" $CYAN
    log "📊 Health Check: http://localhost:$BACKEND_PORT/health/" $CYAN
    echo ""
    log "Press Ctrl+C to stop both servers..." $YELLOW
    
    # Wait for user interrupt
    while true; do
        # Check if processes are still running
        if ! kill -0 $BACKEND_PID 2>/dev/null; then
            log "❌ Backend server stopped unexpectedly" $RED
            break
        fi
        
        if ! kill -0 $FRONTEND_PID 2>/dev/null; then
            log "❌ Frontend server stopped unexpectedly" $RED
            break
        fi
        
        sleep 5
    done
}

# Main execution function
main() {
    echo ""
    echo -e "${BLUE}🚀 SwapSkill Application Startup${NC}"
    echo -e "${BLUE}=================================${NC}"
    echo ""
    
    # Set up signal handlers for cleanup
    trap cleanup SIGINT SIGTERM EXIT
    
    # Check prerequisites
    if ! check_prerequisites; then
        exit 1
    fi
    
    # Setup environments
    if ! setup_backend; then
        exit 1
    fi
    
    if ! setup_frontend; then
        exit 1
    fi
    
    # Start servers
    if ! start_backend; then
        exit 1
    fi
    
    if ! start_frontend; then
        cleanup
        exit 1
    fi
    
    # Monitor servers
    monitor_servers
}

# Make sure we're in the right directory
if [ ! -f "start-swapskill.sh" ]; then
    echo -e "${RED}Error: Please run this script from the SwapSkill project root directory${NC}"
    exit 1
fi

# Run main function
main "$@"
