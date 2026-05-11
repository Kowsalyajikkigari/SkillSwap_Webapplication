"""
Security utilities for SwapSkill application
Provides SQL injection protection, XSS prevention, and rate limiting
"""

import re
import hashlib
import secrets
from typing import Dict, Any, List, Optional
from django.core.cache import cache
from django.http import HttpRequest
from django.utils import timezone
from datetime import timedelta
import logging

logger = logging.getLogger('swapskill')


class SecurityManager:
    """Comprehensive security management utility"""
    
    # SQL injection patterns to detect
    SQL_INJECTION_PATTERNS = [
        r"(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)",
        r"(--|#|/\*|\*/)",
        r"(\b(OR|AND)\s+\d+\s*=\s*\d+)",
        r"(\b(OR|AND)\s+['\"]?\w+['\"]?\s*=\s*['\"]?\w+['\"]?)",
        r"(INFORMATION_SCHEMA|SYSOBJECTS|SYSCOLUMNS)",
        r"(\bxp_\w+|\bsp_\w+)",
    ]
    
    # XSS patterns to detect
    XSS_PATTERNS = [
        r"<script[^>]*>.*?</script>",
        r"javascript:",
        r"vbscript:",
        r"onload\s*=",
        r"onerror\s*=",
        r"onclick\s*=",
        r"onmouseover\s*=",
        r"<iframe[^>]*>",
        r"<object[^>]*>",
        r"<embed[^>]*>",
        r"<link[^>]*>",
        r"<meta[^>]*>",
    ]
    
    @staticmethod
    def detect_sql_injection(input_string: str) -> bool:
        """Detect potential SQL injection attempts"""
        
        if not input_string:
            return False
        
        input_lower = input_string.lower()
        
        for pattern in SecurityManager.SQL_INJECTION_PATTERNS:
            if re.search(pattern, input_lower, re.IGNORECASE):
                logger.warning(f"Potential SQL injection detected: {pattern}")
                return True
        
        return False
    
    @staticmethod
    def detect_xss(input_string: str) -> bool:
        """Detect potential XSS attempts"""
        
        if not input_string:
            return False
        
        input_lower = input_string.lower()
        
        for pattern in SecurityManager.XSS_PATTERNS:
            if re.search(pattern, input_lower, re.IGNORECASE):
                logger.warning(f"Potential XSS detected: {pattern}")
                return True
        
        return False
    
    @staticmethod
    def sanitize_input(input_string: str, allow_html: bool = False) -> str:
        """Sanitize user input to prevent security issues"""
        
        if not input_string:
            return ''
        
        # Remove null bytes
        sanitized = input_string.replace('\x00', '')
        
        # If HTML is not allowed, escape it
        if not allow_html:
            import html
            sanitized = html.escape(sanitized)
        else:
            # Use bleach for HTML sanitization (already implemented in validators.py)
            import bleach
            allowed_tags = ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a']
            allowed_attributes = {'a': ['href', 'title']}
            sanitized = bleach.clean(sanitized, tags=allowed_tags, attributes=allowed_attributes)
        
        return sanitized
    
    @staticmethod
    def validate_request_security(request: HttpRequest) -> Dict[str, Any]:
        """Validate request for security issues"""
        
        security_issues = []
        
        # Check request data for SQL injection
        if hasattr(request, 'data') and request.data:
            for key, value in request.data.items():
                if isinstance(value, str):
                    if SecurityManager.detect_sql_injection(value):
                        security_issues.append(f"SQL injection detected in field: {key}")
                    
                    if SecurityManager.detect_xss(value):
                        security_issues.append(f"XSS detected in field: {key}")
        
        # Check query parameters
        for key, value in request.GET.items():
            if SecurityManager.detect_sql_injection(value):
                security_issues.append(f"SQL injection detected in query param: {key}")
            
            if SecurityManager.detect_xss(value):
                security_issues.append(f"XSS detected in query param: {key}")
        
        return {
            'is_safe': len(security_issues) == 0,
            'issues': security_issues
        }


class RateLimiter:
    """Rate limiting utility using Django cache"""
    
    @staticmethod
    def get_client_ip(request: HttpRequest) -> str:
        """Get client IP address from request"""
        
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        
        return ip
    
    @staticmethod
    def is_rate_limited(request: HttpRequest, action: str, limit: int, window_minutes: int = 60) -> bool:
        """Check if request is rate limited"""
        
        client_ip = RateLimiter.get_client_ip(request)
        cache_key = f"rate_limit:{action}:{client_ip}"
        
        # Get current count
        current_count = cache.get(cache_key, 0)
        
        if current_count >= limit:
            logger.warning(f"Rate limit exceeded for {client_ip} on action {action}")
            return True
        
        # Increment count
        cache.set(cache_key, current_count + 1, timeout=window_minutes * 60)
        
        return False
    
    @staticmethod
    def get_rate_limit_info(request: HttpRequest, action: str, limit: int) -> Dict[str, Any]:
        """Get rate limit information for client"""
        
        client_ip = RateLimiter.get_client_ip(request)
        cache_key = f"rate_limit:{action}:{client_ip}"
        
        current_count = cache.get(cache_key, 0)
        remaining = max(0, limit - current_count)
        
        return {
            'limit': limit,
            'used': current_count,
            'remaining': remaining,
            'reset_time': timezone.now() + timedelta(hours=1)  # Assuming 1 hour window
        }


class CSRFProtection:
    """CSRF protection utilities"""
    
    @staticmethod
    def generate_csrf_token() -> str:
        """Generate a secure CSRF token"""
        return secrets.token_urlsafe(32)
    
    @staticmethod
    def validate_csrf_token(request: HttpRequest, token: str) -> bool:
        """Validate CSRF token"""
        
        # Get token from session
        session_token = request.session.get('csrf_token')
        
        if not session_token:
            return False
        
        # Use constant-time comparison to prevent timing attacks
        return secrets.compare_digest(session_token, token)


class PasswordSecurity:
    """Password security utilities"""
    
    @staticmethod
    def hash_password(password: str, salt: str = None) -> tuple:
        """Hash password with salt"""
        
        if not salt:
            salt = secrets.token_hex(16)
        
        # Use PBKDF2 with SHA256
        password_hash = hashlib.pbkdf2_hmac(
            'sha256',
            password.encode('utf-8'),
            salt.encode('utf-8'),
            100000  # 100,000 iterations
        )
        
        return password_hash.hex(), salt
    
    @staticmethod
    def verify_password(password: str, stored_hash: str, salt: str) -> bool:
        """Verify password against stored hash"""
        
        password_hash, _ = PasswordSecurity.hash_password(password, salt)
        return secrets.compare_digest(password_hash, stored_hash)
    
    @staticmethod
    def check_password_strength(password: str) -> Dict[str, Any]:
        """Check password strength and return detailed analysis"""
        
        strength_score = 0
        feedback = []
        
        # Length check
        if len(password) >= 8:
            strength_score += 1
        else:
            feedback.append("Password should be at least 8 characters long")
        
        if len(password) >= 12:
            strength_score += 1
        
        # Character variety checks
        if re.search(r'[a-z]', password):
            strength_score += 1
        else:
            feedback.append("Password should contain lowercase letters")
        
        if re.search(r'[A-Z]', password):
            strength_score += 1
        else:
            feedback.append("Password should contain uppercase letters")
        
        if re.search(r'\d', password):
            strength_score += 1
        else:
            feedback.append("Password should contain numbers")
        
        if re.search(r'[!@#$%^&*()_+\-=\[\]{}|;:,.<>?]', password):
            strength_score += 1
        else:
            feedback.append("Password should contain special characters")
        
        # Common password check
        common_passwords = [
            'password', '123456', 'password123', 'admin', 'qwerty',
            'letmein', 'welcome', 'monkey', '1234567890'
        ]
        
        if password.lower() in common_passwords:
            strength_score = max(0, strength_score - 2)
            feedback.append("Password is too common")
        
        # Determine strength level
        if strength_score >= 5:
            strength_level = 'Strong'
        elif strength_score >= 3:
            strength_level = 'Medium'
        else:
            strength_level = 'Weak'
        
        return {
            'score': strength_score,
            'max_score': 6,
            'level': strength_level,
            'feedback': feedback,
            'is_acceptable': strength_score >= 3
        }


class FileUploadSecurity:
    """File upload security utilities"""
    
    ALLOWED_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp']
    ALLOWED_DOCUMENT_EXTENSIONS = ['.pdf', '.doc', '.docx', '.txt']
    
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
    
    @staticmethod
    def validate_file_upload(file, file_type: str = 'image') -> Dict[str, Any]:
        """Validate uploaded file for security"""
        
        issues = []
        
        # Check file size
        if file.size > FileUploadSecurity.MAX_FILE_SIZE:
            issues.append(f"File size exceeds maximum allowed size of {FileUploadSecurity.MAX_FILE_SIZE} bytes")
        
        # Check file extension
        file_extension = file.name.lower().split('.')[-1] if '.' in file.name else ''
        
        if file_type == 'image':
            allowed_extensions = FileUploadSecurity.ALLOWED_IMAGE_EXTENSIONS
        elif file_type == 'document':
            allowed_extensions = FileUploadSecurity.ALLOWED_DOCUMENT_EXTENSIONS
        else:
            allowed_extensions = FileUploadSecurity.ALLOWED_IMAGE_EXTENSIONS + FileUploadSecurity.ALLOWED_DOCUMENT_EXTENSIONS
        
        if f'.{file_extension}' not in allowed_extensions:
            issues.append(f"File type not allowed. Allowed types: {', '.join(allowed_extensions)}")
        
        # Check for executable file signatures
        file.seek(0)
        file_header = file.read(10)
        file.seek(0)
        
        # Common executable signatures
        executable_signatures = [
            b'\x4d\x5a',  # PE executable
            b'\x7f\x45\x4c\x46',  # ELF executable
            b'\xfe\xed\xfa',  # Mach-O executable
        ]
        
        for signature in executable_signatures:
            if file_header.startswith(signature):
                issues.append("File appears to be an executable")
                break
        
        return {
            'is_safe': len(issues) == 0,
            'issues': issues,
            'file_size': file.size,
            'file_extension': file_extension
        }


# Global security manager instance
security_manager = SecurityManager()
rate_limiter = RateLimiter()
csrf_protection = CSRFProtection()
password_security = PasswordSecurity()
file_upload_security = FileUploadSecurity()
