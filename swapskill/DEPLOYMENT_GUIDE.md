# SwapSkill Deployment Guide

This guide provides comprehensive instructions for deploying SwapSkill in different environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Local Development Setup](#local-development-setup)
4. [Docker Deployment](#docker-deployment)
5. [Production Deployment](#production-deployment)
6. [CI/CD Pipeline](#cicd-pipeline)
7. [Monitoring & Maintenance](#monitoring--maintenance)
8. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements

#### Minimum Requirements
- **CPU**: 2 cores
- **RAM**: 4GB
- **Storage**: 20GB free space
- **OS**: Ubuntu 20.04+, CentOS 8+, or macOS 10.15+

#### Recommended Requirements
- **CPU**: 4+ cores
- **RAM**: 8GB+
- **Storage**: 50GB+ SSD
- **OS**: Ubuntu 22.04 LTS

### Software Dependencies

#### Required Software
```bash
# Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Git
sudo apt-get update
sudo apt-get install git

# Node.js (for local development)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python (for local development)
sudo apt-get install python3.11 python3.11-pip python3.11-venv
```

#### Optional Software
```bash
# Nginx (for reverse proxy)
sudo apt-get install nginx

# PostgreSQL client (for database management)
sudo apt-get install postgresql-client

# Redis client (for cache management)
sudo apt-get install redis-tools
```

## 🌍 Environment Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# Copy from template
cp .env.example .env
```

#### Required Variables

```bash
# Django Configuration
SECRET_KEY=your-super-secret-key-here-make-it-long-and-random
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database Configuration
DATABASE_URL=postgresql://swapskill_user:secure_password@localhost:5432/swapskill

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-specific-password

# Voice AI Configuration
ULTRAVOX_API_KEY=your-ultravox-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# Security Configuration
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
CSRF_TRUSTED_ORIGINS=http://localhost:3000,https://your-domain.com

# File Storage (Production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket-name
AWS_S3_REGION_NAME=us-west-2
USE_S3=True

# Monitoring & Logging
SENTRY_DSN=your-sentry-dsn-for-error-tracking
LOG_LEVEL=INFO
```

#### Environment-Specific Variables

**Development:**
```bash
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
USE_S3=False
EMAIL_BACKEND=django.core.mail.backends.console.EmailBackend
```

**Staging:**
```bash
DEBUG=False
DATABASE_URL=postgresql://staging_user:password@staging-db:5432/swapskill_staging
ALLOWED_HOSTS=staging.swapskill.com
```

**Production:**
```bash
DEBUG=False
DATABASE_URL=postgresql://prod_user:secure_password@prod-db:5432/swapskill
ALLOWED_HOSTS=swapskill.com,www.swapskill.com
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
```

## 🏠 Local Development Setup

### Quick Start

1. **Clone Repository**
```bash
git clone https://github.com/your-username/swapskill.git
cd swapskill
```

2. **Set Up Environment**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Development Environment**
```bash
# Using Docker Compose
docker-compose up -d

# Or start services individually
cd skill-swap-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# In another terminal
cd skill-swap-frontend
npm install
npm start
```

### Development Workflow

1. **Backend Development**
```bash
cd skill-swap-backend
source venv/bin/activate
python manage.py makemigrations
python manage.py migrate
python manage.py test
python manage.py runserver
```

2. **Frontend Development**
```bash
cd skill-swap-frontend
npm start
npm test
npm run build
```

3. **Database Management**
```bash
# Create superuser
python manage.py createsuperuser

# Load sample data
python manage.py loaddata fixtures/sample_data.json

# Reset database
python manage.py flush
```

## 🐳 Docker Deployment

### Development with Docker

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and start
docker-compose up --build -d
```

### Production with Docker

1. **Create Production Configuration**
```bash
# Create production docker-compose file
cp docker-compose.yml docker-compose.prod.yml
# Edit docker-compose.prod.yml for production settings
```

2. **Deploy with Production Settings**
```bash
# Deploy using deployment script
chmod +x scripts/deploy.sh
./scripts/deploy.sh production deploy

# Or manually
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Docker Commands Reference

```bash
# Container Management
docker-compose ps                    # List running containers
docker-compose logs backend         # View backend logs
docker-compose exec backend bash    # Access backend container
docker-compose restart frontend     # Restart frontend service

# Database Operations
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
docker-compose exec db pg_dump -U swapskill_user swapskill > backup.sql

# Maintenance
docker-compose down --volumes        # Stop and remove volumes
docker system prune -f              # Clean up unused containers/images
```

## 🚀 Production Deployment

### Server Setup

1. **Prepare Server**
```bash
# Update system
sudo apt-get update && sudo apt-get upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Create application user
sudo useradd -m -s /bin/bash swapskill
sudo usermod -aG docker swapskill
```

2. **Deploy Application**
```bash
# Switch to application user
sudo su - swapskill

# Clone repository
git clone https://github.com/your-username/swapskill.git
cd swapskill

# Set up environment
cp .env.example .env
# Edit .env with production values

# Deploy
chmod +x scripts/deploy.sh
./scripts/deploy.sh production deploy
```

### SSL/TLS Configuration

1. **Install Certbot**
```bash
sudo apt-get install certbot python3-certbot-nginx
```

2. **Obtain SSL Certificate**
```bash
sudo certbot --nginx -d swapskill.com -d www.swapskill.com
```

3. **Auto-renewal Setup**
```bash
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx Configuration

Create `/etc/nginx/sites-available/swapskill`:

```nginx
server {
    listen 80;
    server_name swapskill.com www.swapskill.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name swapskill.com www.swapskill.com;

    ssl_certificate /etc/letsencrypt/live/swapskill.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/swapskill.com/privkey.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /ws/ {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Static files
    location /static/ {
        alias /var/www/swapskill/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Media files
    location /media/ {
        alias /var/www/swapskill/media/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/swapskill /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## 🔄 CI/CD Pipeline

### GitHub Actions Setup

The CI/CD pipeline is configured in `.github/workflows/ci-cd.yml` and includes:

1. **Automated Testing**
   - Backend unit tests
   - Frontend unit tests
   - Integration tests
   - Security scanning

2. **Build & Deploy**
   - Docker image building
   - Container registry push
   - Automated deployment

3. **Quality Checks**
   - Code linting
   - Type checking
   - Coverage reporting

### Pipeline Configuration

1. **Set up Secrets**
```bash
# In GitHub repository settings, add secrets:
DOCKER_USERNAME=your-docker-username
DOCKER_PASSWORD=your-docker-password
PRODUCTION_HOST=your-production-server-ip
PRODUCTION_USER=swapskill
PRODUCTION_SSH_KEY=your-private-ssh-key
```

2. **Configure Environments**
   - Create `staging` and `production` environments
   - Set environment-specific variables
   - Configure approval requirements for production

### Manual Deployment

```bash
# Deploy to staging
git push origin develop

# Deploy to production
git push origin main
```

## 📊 Monitoring & Maintenance

### Health Monitoring

1. **Application Health**
```bash
# Check application status
curl http://localhost:8000/health/

# Check service status
docker-compose ps
```

2. **Database Monitoring**
```bash
# Check database connection
docker-compose exec backend python manage.py check --database default

# Monitor database performance
docker-compose exec db psql -U swapskill_user -d swapskill -c "SELECT * FROM pg_stat_activity;"
```

### Log Management

1. **View Logs**
```bash
# Application logs
docker-compose logs -f backend
docker-compose logs -f frontend

# System logs
sudo journalctl -u docker
sudo tail -f /var/log/nginx/access.log
```

2. **Log Rotation**
```bash
# Configure logrotate
sudo nano /etc/logrotate.d/swapskill
```

### Backup Strategy

1. **Database Backup**
```bash
# Create backup
docker-compose exec db pg_dump -U swapskill_user swapskill > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore backup
docker-compose exec -T db psql -U swapskill_user -d swapskill < backup.sql
```

2. **Media Files Backup**
```bash
# Backup media files
tar -czf media_backup_$(date +%Y%m%d_%H%M%S).tar.gz media/

# Sync to S3 (if using AWS)
aws s3 sync media/ s3://your-backup-bucket/media/
```

### Performance Optimization

1. **Database Optimization**
```bash
# Analyze database performance
docker-compose exec backend python manage.py dbshell
ANALYZE;
VACUUM;
```

2. **Cache Management**
```bash
# Clear cache
docker-compose exec backend python manage.py shell -c "from django.core.cache import cache; cache.clear()"

# Monitor Redis
docker-compose exec redis redis-cli info memory
```

## 🔧 Troubleshooting

### Common Issues

#### Container Issues
```bash
# Container won't start
docker-compose logs backend
docker-compose down && docker-compose up -d

# Out of disk space
docker system prune -f
docker volume prune -f
```

#### Database Issues
```bash
# Connection refused
docker-compose restart db
docker-compose exec backend python manage.py check --database default

# Migration issues
docker-compose exec backend python manage.py showmigrations
docker-compose exec backend python manage.py migrate --fake-initial
```

#### Performance Issues
```bash
# High memory usage
docker stats
docker-compose restart

# Slow queries
docker-compose exec backend python manage.py shell -c "
from django.db import connection
print(connection.queries)
"
```

### Getting Help

1. **Check Logs**: Always start by checking application and system logs
2. **Health Endpoints**: Use `/health/` endpoint to verify system status
3. **Documentation**: Refer to component-specific documentation
4. **Community**: Check GitHub issues and discussions
5. **Support**: Contact support team for critical issues

---

For additional help, please refer to the [Technical Documentation](TECHNICAL_DOCUMENTATION.md) or contact the development team.
