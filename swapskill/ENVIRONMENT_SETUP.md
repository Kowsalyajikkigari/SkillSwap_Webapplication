# 🔧 Environment Setup Guide

## 📋 Prerequisites

Before setting up SkillSwap, ensure you have the following installed:

- **Python 3.8+** (recommended: 3.10+)
- **Node.js 16+** (recommended: 18+)
- **Git** for version control
- **Code Editor** (VS Code recommended)

## 🔐 Environment Variables

### Backend Environment Variables

Create a `.env` file in the `skill-swap-backend/` directory:

```bash
# Django Configuration
SECRET_KEY=your-super-secret-django-key-here-make-it-long-and-random
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1,testserver

# Database Configuration (Optional - defaults to SQLite)
# DATABASE_URL=postgresql://username:password@localhost:5432/skillswap

# Voice AI Integration (Required for Voice Features)
ULTRAVOX_API_KEY=your-ultravox-api-key-here
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# OAuth Social Authentication (Optional)
GOOGLE_OAUTH2_KEY=your-google-client-id
GOOGLE_OAUTH2_SECRET=your-google-client-secret
FACEBOOK_KEY=your-facebook-app-id
FACEBOOK_SECRET=your-facebook-app-secret
GITHUB_KEY=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password
DEFAULT_FROM_EMAIL=noreply@skillswap.com
```

### Frontend Environment Variables

Create a `.env` file in the `skill-swap-frontend/` directory:

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:8000
VITE_WS_BASE_URL=ws://localhost:8000

# Feature Flags (Optional)
VITE_ENABLE_VOICE_AI=true
VITE_ENABLE_SOCIAL_LOGIN=true
VITE_ENABLE_REAL_TIME_CHAT=true

# Development Configuration
VITE_DEBUG_MODE=true
```

## 🚀 Quick Setup Commands

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone https://github.com/yourusername/skillswap.git
cd skillswap

# Run setup script (if available)
./setup.sh  # Linux/Mac
# or
setup.bat   # Windows
```

### Option 2: Manual Setup

#### Backend Setup
```bash
# Navigate to backend directory
cd skill-swap-backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example above)
cp .env.example .env  # Edit with your values

# Run database migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Collect static files (for production)
python manage.py collectstatic --noinput

# Start development server
python manage.py runserver
```

#### Frontend Setup
```bash
# Navigate to frontend directory
cd skill-swap-frontend

# Install dependencies
npm install

# Create .env file (copy from example above)
cp .env.example .env  # Edit with your values

# Start development server
npm run dev

# Or for production build
npm run build
npm run preview
```

## 🔑 API Keys Setup Guide

### 1. Ultravox API Key
1. Visit [Ultravox Console](https://console.ultravox.ai/)
2. Create an account or sign in
3. Navigate to API Keys section
4. Generate a new API key
5. Copy the key to your `.env` file

### 2. Twilio Configuration
1. Visit [Twilio Console](https://console.twilio.com/)
2. Create an account or sign in
3. Get your Account SID and Auth Token from the dashboard
4. Purchase a phone number for voice calls
5. Add all values to your `.env` file

### 3. Google OAuth (Optional)
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URIs:
   - `http://localhost:8000/auth/google/callback/`
   - `http://localhost:3000/auth/callback/google/`

### 4. Facebook OAuth (Optional)
1. Visit [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Configure OAuth redirect URIs
5. Get App ID and App Secret

### 5. GitHub OAuth (Optional)
1. Go to GitHub Settings > Developer settings > OAuth Apps
2. Create a new OAuth App
3. Set Authorization callback URL: `http://localhost:8000/auth/github/callback/`
4. Get Client ID and Client Secret

## 🗄️ Database Setup

### SQLite (Default - No Setup Required)
The project uses SQLite by default, which requires no additional setup.

### PostgreSQL (Recommended for Production)
```bash
# Install PostgreSQL
# Ubuntu/Debian:
sudo apt-get install postgresql postgresql-contrib

# macOS (with Homebrew):
brew install postgresql

# Create database
sudo -u postgres createdb skillswap

# Create user
sudo -u postgres createuser --interactive

# Update .env file with DATABASE_URL
DATABASE_URL=postgresql://username:password@localhost:5432/skillswap
```

## 🧪 Testing Setup

### Backend Tests
```bash
cd skill-swap-backend
python manage.py test

# Run with coverage
pip install coverage
coverage run --source='.' manage.py test
coverage report
coverage html  # Generate HTML report
```

### Frontend Tests
```bash
cd skill-swap-frontend
npm run test

# Run with coverage
npm run test:coverage
```

## 🚀 Production Deployment

### Environment Variables for Production
```bash
# Security
SECRET_KEY=your-production-secret-key-very-long-and-random
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com

# Database
DATABASE_URL=postgresql://user:pass@prod-db-host:5432/skillswap

# HTTPS Settings
SECURE_SSL_REDIRECT=True
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

### Deployment Checklist
- [ ] Set DEBUG=False
- [ ] Configure production database
- [ ] Set up HTTPS/SSL
- [ ] Configure static file serving
- [ ] Set up monitoring and logging
- [ ] Configure backup strategy
- [ ] Set up CI/CD pipeline

## 🔧 Development Tools

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "ms-python.python",
    "ms-python.flake8",
    "ms-python.black-formatter",
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json"
  ]
}
```

### Git Hooks Setup
```bash
# Install pre-commit hooks
pip install pre-commit
pre-commit install

# Run hooks manually
pre-commit run --all-files
```

## 🐛 Troubleshooting

### Common Issues

#### Backend Issues
```bash
# Port already in use
python manage.py runserver 8001

# Database migration issues
python manage.py migrate --fake-initial

# Static files not loading
python manage.py collectstatic --clear
```

#### Frontend Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Port already in use
npm run dev -- --port 3001
```

#### Environment Issues
```bash
# Check Python version
python --version

# Check Node version
node --version

# Verify virtual environment
which python  # Should point to venv
```

## 📞 Support

If you encounter issues:

1. Check this troubleshooting guide
2. Review the error logs
3. Search existing GitHub issues
4. Create a new issue with detailed information

---

**Note**: Replace all placeholder values (your-api-key-here, etc.) with actual values from your service providers.
