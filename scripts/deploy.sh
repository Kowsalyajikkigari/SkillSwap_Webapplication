#!/bin/bash

# SwapSkill Deployment Script
# This script handles the complete deployment of SwapSkill application

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT=${1:-development}
PROJECT_NAME="swapskill"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deployment.log"

# Functions
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1" | tee -a "$LOG_FILE"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" | tee -a "$LOG_FILE"
    exit 1
}

# Create necessary directories
create_directories() {
    log "Creating necessary directories..."
    mkdir -p logs backups ssl nginx
    success "Directories created"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        error "Docker is not installed. Please install Docker first."
    fi
    
    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null; then
        error "Docker Compose is not installed. Please install Docker Compose first."
    fi
    
    # Check if .env file exists
    if [ ! -f .env ]; then
        warning ".env file not found. Creating from template..."
        cp .env.example .env
        warning "Please edit .env file with your configuration before continuing."
        exit 1
    fi
    
    success "Prerequisites check passed"
}

# Backup existing data
backup_data() {
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Creating backup..."
        
        # Create backup directory with timestamp
        BACKUP_TIMESTAMP=$(date +%Y%m%d_%H%M%S)
        BACKUP_PATH="$BACKUP_DIR/backup_$BACKUP_TIMESTAMP"
        mkdir -p "$BACKUP_PATH"
        
        # Backup database
        if docker-compose ps | grep -q "swapskill_db"; then
            log "Backing up database..."
            docker-compose exec -T db pg_dump -U swapskill_user swapskill > "$BACKUP_PATH/database.sql"
            success "Database backup created"
        fi
        
        # Backup media files
        if [ -d "./media" ]; then
            log "Backing up media files..."
            cp -r ./media "$BACKUP_PATH/"
            success "Media files backup created"
        fi
        
        success "Backup completed: $BACKUP_PATH"
    fi
}

# Build and deploy
deploy() {
    log "Starting deployment for $ENVIRONMENT environment..."
    
    # Pull latest changes (if in production)
    if [ "$ENVIRONMENT" = "production" ]; then
        log "Pulling latest changes..."
        git pull origin main
        success "Code updated"
    fi
    
    # Build and start services
    log "Building and starting services..."
    
    if [ "$ENVIRONMENT" = "production" ]; then
        docker-compose -f docker-compose.yml -f docker-compose.prod.yml up --build -d
    else
        docker-compose up --build -d
    fi
    
    success "Services started"
}

# Health check
health_check() {
    log "Performing health checks..."
    
    # Wait for services to start
    sleep 30
    
    # Check backend health
    log "Checking backend health..."
    for i in {1..10}; do
        if curl -f http://localhost:8000/health/ &> /dev/null; then
            success "Backend is healthy"
            break
        fi
        if [ $i -eq 10 ]; then
            error "Backend health check failed"
        fi
        log "Waiting for backend... (attempt $i/10)"
        sleep 10
    done
    
    # Check frontend health
    log "Checking frontend health..."
    for i in {1..10}; do
        if curl -f http://localhost:3000/health &> /dev/null; then
            success "Frontend is healthy"
            break
        fi
        if [ $i -eq 10 ]; then
            error "Frontend health check failed"
        fi
        log "Waiting for frontend... (attempt $i/10)"
        sleep 10
    done
    
    # Check database connection
    log "Checking database connection..."
    if docker-compose exec -T backend python manage.py check --database default &> /dev/null; then
        success "Database connection is healthy"
    else
        error "Database connection failed"
    fi
    
    success "All health checks passed"
}

# Post-deployment tasks
post_deployment() {
    log "Running post-deployment tasks..."
    
    # Run database migrations
    log "Running database migrations..."
    docker-compose exec -T backend python manage.py migrate
    success "Database migrations completed"
    
    # Collect static files
    log "Collecting static files..."
    docker-compose exec -T backend python manage.py collectstatic --noinput
    success "Static files collected"
    
    # Create superuser if needed
    log "Checking superuser..."
    docker-compose exec -T backend python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(email='kowsalyajikkigari05@gmail.com').exists():
    User.objects.create_superuser(
        email='kowsalyajikkigari05@gmail.com',
        password='Devi@4321',
        first_name='Kowsalya',
        last_name='Jikkigari'
    )
    print('Superuser created')
else:
    print('Superuser already exists')
"
    success "Superuser check completed"
    
    # Load initial data
    log "Loading initial data..."
    docker-compose exec -T backend python manage.py loaddata initial_data.json || true
    success "Initial data loaded"
    
    success "Post-deployment tasks completed"
}

# Cleanup old containers and images
cleanup() {
    log "Cleaning up old containers and images..."
    
    # Remove stopped containers
    docker container prune -f
    
    # Remove unused images
    docker image prune -f
    
    # Remove unused volumes (be careful in production)
    if [ "$ENVIRONMENT" != "production" ]; then
        docker volume prune -f
    fi
    
    success "Cleanup completed"
}

# Show deployment status
show_status() {
    log "Deployment Status:"
    echo ""
    echo "Services:"
    docker-compose ps
    echo ""
    echo "Application URLs:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend API: http://localhost:8000/api/"
    echo "  Admin Panel: http://localhost:8000/admin/"
    echo "  Health Check: http://localhost:8000/health/"
    echo ""
    echo "Logs:"
    echo "  View all logs: docker-compose logs"
    echo "  View backend logs: docker-compose logs backend"
    echo "  View frontend logs: docker-compose logs frontend"
    echo ""
}

# Rollback function
rollback() {
    log "Rolling back deployment..."
    
    # Stop current services
    docker-compose down
    
    # Restore from latest backup
    LATEST_BACKUP=$(ls -t $BACKUP_DIR | head -n1)
    if [ -n "$LATEST_BACKUP" ]; then
        log "Restoring from backup: $LATEST_BACKUP"
        
        # Restore database
        if [ -f "$BACKUP_DIR/$LATEST_BACKUP/database.sql" ]; then
            docker-compose up -d db
            sleep 10
            docker-compose exec -T db psql -U swapskill_user -d swapskill < "$BACKUP_DIR/$LATEST_BACKUP/database.sql"
        fi
        
        # Restore media files
        if [ -d "$BACKUP_DIR/$LATEST_BACKUP/media" ]; then
            rm -rf ./media
            cp -r "$BACKUP_DIR/$LATEST_BACKUP/media" ./
        fi
        
        success "Rollback completed"
    else
        error "No backup found for rollback"
    fi
}

# Main deployment flow
main() {
    log "Starting SwapSkill deployment..."
    log "Environment: $ENVIRONMENT"
    
    case "${2:-deploy}" in
        "deploy")
            create_directories
            check_prerequisites
            backup_data
            deploy
            health_check
            post_deployment
            cleanup
            show_status
            success "Deployment completed successfully!"
            ;;
        "rollback")
            rollback
            ;;
        "status")
            show_status
            ;;
        "logs")
            docker-compose logs -f
            ;;
        "stop")
            log "Stopping services..."
            docker-compose down
            success "Services stopped"
            ;;
        "restart")
            log "Restarting services..."
            docker-compose restart
            health_check
            success "Services restarted"
            ;;
        *)
            echo "Usage: $0 [environment] [action]"
            echo "Environments: development, production"
            echo "Actions: deploy, rollback, status, logs, stop, restart"
            exit 1
            ;;
    esac
}

# Run main function
main "$@"
