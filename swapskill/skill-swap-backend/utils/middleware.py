"""
Security middleware for SwapSkill application
Provides automatic security checks for all requests
"""

import logging
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.core.cache import cache
from utils.security import security_manager, rate_limiter
from utils.error_handlers import format_error_response

logger = logging.getLogger('swapskill')


class SecurityMiddleware(MiddlewareMixin):
    """Middleware for automatic security checks"""
    
    def process_request(self, request):
        """Process incoming request for security issues"""
        
        # Skip security checks for certain paths
        skip_paths = [
            '/admin/',
            '/static/',
            '/media/',
            '/favicon.ico',
            '/health/',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Validate request security
        security_result = security_manager.validate_request_security(request)
        
        if not security_result['is_safe']:
            logger.warning(f"Security issues detected in request from {rate_limiter.get_client_ip(request)}: {security_result['issues']}")
            
            error_response = format_error_response(
                Exception("Security validation failed"),
                request_id=getattr(request, 'id', None)
            )
            
            return JsonResponse(error_response, status=400)
        
        return None


class RateLimitMiddleware(MiddlewareMixin):
    """Middleware for rate limiting"""
    
    def process_request(self, request):
        """Apply rate limiting to requests"""
        
        # Skip rate limiting for certain paths
        skip_paths = [
            '/admin/',
            '/static/',
            '/media/',
            '/favicon.ico',
            '/health/',
            '/ws/',  # Skip WebSocket connections
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Different rate limits for different endpoints
        rate_limits = {
            '/api/users/register/': {'limit': 5, 'window': 60},  # 5 registrations per hour
            '/api/users/login/': {'limit': 10, 'window': 60},    # 10 login attempts per hour
            '/api/voice-ai/': {'limit': 20, 'window': 60},       # 20 voice calls per hour
            '/api/auth/profile/completion-status/': {'limit': 5000, 'window': 60},  # Very high limit for profile status
            '/api/messages/unread-counts/': {'limit': 5000, 'window': 60},  # Very high limit for unread counts (polling endpoint)
            '/api/auth/': {'limit': 1000, 'window': 60},         # High limit for auth endpoints
            '/api/messages/': {'limit': 1000, 'window': 60},     # High limit for messaging
            'default': {'limit': 500, 'window': 60}              # 500 requests per hour default
        }
        
        # Determine rate limit for this path
        rate_config = rate_limits.get('default')
        for path, config in rate_limits.items():
            if path != 'default' and request.path.startswith(path):
                rate_config = config
                break
        
        # Check rate limit
        action = f"request:{request.path}"
        if rate_limiter.is_rate_limited(request, action, rate_config['limit'], rate_config['window']):
            
            # Get rate limit info for response headers
            rate_info = rate_limiter.get_rate_limit_info(request, action, rate_config['limit'])
            
            error_response = format_error_response(
                Exception("Rate limit exceeded"),
                request_id=getattr(request, 'id', None)
            )
            
            response = JsonResponse(error_response, status=429)
            response['X-RateLimit-Limit'] = str(rate_info['limit'])
            response['X-RateLimit-Remaining'] = str(rate_info['remaining'])
            response['X-RateLimit-Reset'] = str(int(rate_info['reset_time'].timestamp()))
            
            return response
        
        return None


class RequestLoggingMiddleware(MiddlewareMixin):
    """Middleware for request logging"""
    
    def process_request(self, request):
        """Log incoming requests"""
        
        # Skip logging for static files and admin
        skip_paths = [
            '/static/',
            '/media/',
            '/favicon.ico',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return None
        
        # Log request details
        client_ip = rate_limiter.get_client_ip(request)
        user_agent = request.META.get('HTTP_USER_AGENT', 'Unknown')
        
        logger.info(f"Request: {request.method} {request.path} from {client_ip} - {user_agent}")
        
        return None
    
    def process_response(self, request, response):
        """Log response details"""
        
        # Skip logging for static files
        skip_paths = [
            '/static/',
            '/media/',
            '/favicon.ico',
        ]
        
        if any(request.path.startswith(path) for path in skip_paths):
            return response
        
        # Log response status
        client_ip = rate_limiter.get_client_ip(request)
        logger.info(f"Response: {response.status_code} for {request.method} {request.path} from {client_ip}")
        
        # Log errors
        if response.status_code >= 400:
            logger.warning(f"Error response {response.status_code} for {request.path}")
        
        return response


class CORSMiddleware(MiddlewareMixin):
    """Middleware for CORS handling"""
    
    def process_response(self, request, response):
        """Add CORS headers to response"""
        
        # Allow specific origins in production
        allowed_origins = [
            'http://localhost:3000',  # React development server
            'http://127.0.0.1:3000',
            'https://your-production-domain.com',  # Replace with actual domain
        ]
        
        origin = request.META.get('HTTP_ORIGIN')
        
        if origin in allowed_origins:
            response['Access-Control-Allow-Origin'] = origin
        
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-CSRFToken'
        response['Access-Control-Allow-Credentials'] = 'true'
        response['Access-Control-Max-Age'] = '86400'  # 24 hours
        
        return response


class HealthCheckMiddleware(MiddlewareMixin):
    """Middleware for health check endpoint"""
    
    def process_request(self, request):
        """Handle health check requests"""
        
        if request.path == '/health/':
            from django.db import connection
            from django.core.cache import cache
            
            health_status = {
                'status': 'healthy',
                'timestamp': logger.handlers[0].formatter.formatTime(logging.LogRecord(
                    name='', level=0, pathname='', lineno=0, msg='', args=(), exc_info=None
                )) if logger.handlers else None,
                'services': {}
            }
            
            # Check database
            try:
                with connection.cursor() as cursor:
                    cursor.execute("SELECT 1")
                health_status['services']['database'] = 'healthy'
            except Exception as e:
                health_status['services']['database'] = f'unhealthy: {str(e)}'
                health_status['status'] = 'unhealthy'
            
            # Check cache
            try:
                cache.set('health_check', 'test', 10)
                cache.get('health_check')
                health_status['services']['cache'] = 'healthy'
            except Exception as e:
                health_status['services']['cache'] = f'unhealthy: {str(e)}'
                health_status['status'] = 'unhealthy'
            
            status_code = 200 if health_status['status'] == 'healthy' else 503
            return JsonResponse(health_status, status=status_code)
        
        return None


class SecurityHeadersMiddleware(MiddlewareMixin):
    """Middleware for security headers"""
    
    def process_response(self, request, response):
        """Add security headers to response"""
        
        # Content Security Policy
        response['Content-Security-Policy'] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self' https:; "
            "connect-src 'self' wss: https:; "
            "media-src 'self'; "
            "object-src 'none'; "
            "frame-ancestors 'none';"
        )
        
        # Other security headers
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['X-XSS-Protection'] = '1; mode=block'
        response['Referrer-Policy'] = 'strict-origin-when-cross-origin'
        response['Permissions-Policy'] = 'geolocation=(), microphone=(), camera=()'
        
        # HSTS for HTTPS
        if request.is_secure():
            response['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains'
        
        return response
