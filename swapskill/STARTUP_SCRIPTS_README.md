# SwapSkill Automated Startup Scripts

This directory contains automated startup scripts that launch both the Django backend and React frontend servers simultaneously with a single command.

## 🚀 Available Scripts

### 1. Windows PowerShell Script
**File**: `start-swapskill.ps1`
- **Platform**: Windows 10/11 with PowerShell 5.1+
- **Features**: Advanced error handling, port management, environment setup
- **Execution**: Runs servers in background jobs with monitoring

### 2. Windows Batch Script  
**File**: `start-swapskill.bat`
- **Platform**: Windows (all versions)
- **Features**: Simple setup, opens servers in separate windows
- **Execution**: Launches servers in separate command windows

### 3. Unix/Linux/macOS Bash Script
**File**: `start-swapskill.sh`
- **Platform**: Linux, macOS, WSL, Git Bash
- **Features**: Cross-platform compatibility, signal handling
- **Execution**: Runs servers with proper cleanup on exit

## 📋 Prerequisites

Before using any startup script, ensure you have:

- **Python 3.8+** installed and accessible via `python` command
- **Node.js 16+** installed and accessible via `node` command
- **npm** package manager installed
- **Git** (optional, for cloning the repository)

## 🎯 Quick Start

### Windows (Recommended - PowerShell)
```powershell
# Navigate to SwapSkill project directory
cd path\to\swapskill

# Run with default settings (Backend: 8001, Frontend: 3000)
.\start-swapskill.ps1

# Run with custom ports
.\start-swapskill.ps1 -BackendPort 8002 -FrontendPort 3001

# Run in production mode
.\start-swapskill.ps1 -Production
```

### Windows (Alternative - Batch)
```cmd
# Navigate to SwapSkill project directory
cd path\to\swapskill

# Run with default settings
start-swapskill.bat

# Run with custom ports
start-swapskill.bat -b 8002 -f 3001

# Run in production mode
start-swapskill.bat --production
```

### Linux/macOS/WSL
```bash
# Navigate to SwapSkill project directory
cd path/to/swapskill

# Make script executable (first time only)
chmod +x start-swapskill.sh

# Run with default settings
./start-swapskill.sh

# Run with custom ports
./start-swapskill.sh --backend-port 8002 --frontend-port 3001

# Run in production mode
./start-swapskill.sh --production
```

## ⚙️ Configuration Options

### Command Line Arguments

| Option | PowerShell | Batch | Bash | Description |
|--------|------------|-------|------|-------------|
| Backend Port | `-BackendPort 8002` | `-b 8002` | `--backend-port 8002` | Set Django server port |
| Frontend Port | `-FrontendPort 3001` | `-f 3001` | `--frontend-port 3001` | Set React server port |
| Production Mode | `-Production` | `-p` | `--production` | Enable production mode |
| Help | `-Help` | `-h` | `--help` | Show usage information |

### Environment Variables

You can also set configuration via environment variables:

```bash
# Set ports via environment variables
export BACKEND_PORT=8002
export FRONTEND_PORT=3001
export PRODUCTION=true

# Run script (will use environment variables)
./start-swapskill.sh
```

## 🔧 What the Scripts Do

### 1. Prerequisites Check
- ✅ Verify Python 3.8+ is installed
- ✅ Verify Node.js 16+ is installed  
- ✅ Verify npm is available
- ✅ Check project directory structure

### 2. Environment Setup
- 🐍 **Backend Setup**:
  - Create Python virtual environment (if not exists)
  - Activate virtual environment
  - Install/update Python dependencies from `requirements.txt`
  - Run database migrations
  - Collect static files (production mode)

- ⚛️ **Frontend Setup**:
  - Install/update Node.js dependencies from `package.json`
  - Set environment variables for API URLs
  - Prepare build configuration

### 3. Server Management
- 🔍 **Port Management**:
  - Check if ports are available
  - Kill existing processes on target ports
  - Handle port conflicts gracefully

- 🚀 **Server Startup**:
  - Start Django backend server
  - Start React/Vite frontend server
  - Wait for servers to become available
  - Verify successful startup

### 4. Monitoring & Cleanup
- 📊 **Monitoring**:
  - Display server URLs and status
  - Monitor server health
  - Handle unexpected shutdowns

- 🧹 **Cleanup**:
  - Graceful shutdown on Ctrl+C
  - Kill server processes
  - Clean up background jobs
  - Free up ports

## 🌐 Server URLs

After successful startup, the following URLs will be available:

| Service | URL | Description |
|---------|-----|-------------|
| **Frontend** | `http://localhost:3000` | Main SwapSkill application |
| **Backend API** | `http://localhost:8001/api/` | REST API endpoints |
| **Admin Panel** | `http://localhost:8001/admin/` | Django admin interface |
| **Health Check** | `http://localhost:8001/health/` | System health status |

## 🐛 Troubleshooting

### Common Issues

#### Port Already in Use
```
Error: Port 3000 is already in use
```
**Solution**: The script will automatically try to free the port. If it fails:
- Use different ports: `.\start-swapskill.ps1 -FrontendPort 3001`
- Manually kill processes: `taskkill /F /IM node.exe` (Windows)

#### Python Virtual Environment Issues
```
Error: Failed to create virtual environment
```
**Solution**: 
- Ensure Python is properly installed
- Check Python version: `python --version`
- Try: `python -m pip install --upgrade pip`

#### Node.js Dependencies Issues
```
Error: Failed to install Node.js dependencies
```
**Solution**:
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules`: `rm -rf skill-swap-frontend/node_modules`
- Run script again (will reinstall dependencies)

#### Database Migration Issues
```
Error: Database migrations failed
```
**Solution**:
- Check database file permissions
- Try: `python manage.py makemigrations`
- Reset database: Delete `db.sqlite3` and run script again

### Script-Specific Issues

#### PowerShell Execution Policy
```
Error: Execution of scripts is disabled on this system
```
**Solution**:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Permission Denied (Linux/macOS)
```
Error: Permission denied
```
**Solution**:
```bash
chmod +x start-swapskill.sh
```

## 🔄 Development Workflow

### Daily Development
1. **Start Development**:
   ```bash
   ./start-swapskill.sh
   ```

2. **Make Changes**: Edit code in your IDE

3. **Hot Reload**: Changes automatically reload in browser

4. **Stop Servers**: Press `Ctrl+C` in terminal

### Production Testing
1. **Build and Test**:
   ```bash
   ./start-swapskill.sh --production
   ```

2. **Verify Production Build**: Test optimized frontend

3. **Performance Testing**: Check production performance

## 📊 Performance Tips

### Development Mode
- **Hot Reload**: Instant code changes
- **Source Maps**: Easy debugging
- **Verbose Logging**: Detailed error messages

### Production Mode
- **Optimized Build**: Minified and compressed assets
- **Static Serving**: Efficient file serving
- **Performance Monitoring**: Production-ready logging

## 🛡️ Security Considerations

### Development Environment
- Scripts run servers in development mode by default
- Debug mode enabled for easier troubleshooting
- CORS configured for local development

### Production Environment
- Use `--production` flag for production builds
- Environment variables for sensitive configuration
- Security headers and HTTPS in production deployment

## 📚 Additional Resources

- **SwapSkill Documentation**: See `README.md` for project overview
- **API Documentation**: See `API_DOCUMENTATION.md` for endpoint details
- **Deployment Guide**: See `DEPLOYMENT_GUIDE.md` for production deployment
- **Technical Documentation**: See `TECHNICAL_DOCUMENTATION.md` for architecture details

## 🆘 Getting Help

If you encounter issues:

1. **Check Logs**: Look at terminal output for error messages
2. **Verify Prerequisites**: Ensure Python and Node.js are properly installed
3. **Check Ports**: Verify no other applications are using the same ports
4. **Clean Install**: Delete `venv` and `node_modules`, then run script again
5. **Manual Setup**: Follow manual setup instructions in main `README.md`

---

**Happy Coding! 🚀**
