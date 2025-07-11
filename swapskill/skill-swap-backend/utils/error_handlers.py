"""
Comprehensive error handling utilities for SwapSkill
Provides consistent error responses and logging across the application
"""

import logging
import traceback
from functools import wraps
from typing import Dict, Any, Optional
from django.http import JsonResponse
from django.core.exceptions import ValidationError, PermissionDenied
from django.db import IntegrityError, DatabaseError
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import exception_handler

logger = logging.getLogger(__name__)


class SwapSkillError(Exception):
    """Base exception class for SwapSkill application"""
    
    def __init__(self, message: str, error_code: str = None, status_code: int = 400):
        self.message = message
        self.error_code = error_code or 'SWAPSKILL_ERROR'
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(SwapSkillError):
    """Validation error for user input"""
    
    def __init__(self, message: str, field: str = None):
        self.field = field
        super().__init__(message, 'VALIDATION_ERROR', 400)


class AuthenticationError(SwapSkillError):
    """Authentication related errors"""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, 'AUTH_ERROR', 401)


class PermissionError(SwapSkillError):
    """Permission related errors"""
    
    def __init__(self, message: str = "Permission denied"):
        super().__init__(message, 'PERMISSION_ERROR', 403)


class NotFoundError(SwapSkillError):
    """Resource not found errors"""
    
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, 'NOT_FOUND_ERROR', 404)


class BusinessLogicError(SwapSkillError):
    """Business logic related errors"""
    
    def __init__(self, message: str):
        super().__init__(message, 'BUSINESS_LOGIC_ERROR', 422)


def format_error_response(error: Exception, request_id: str = None) -> Dict[str, Any]:
    """Format error response consistently"""
    
    if isinstance(error, SwapSkillError):
        return {
            'success': False,
            'error': {
                'code': error.error_code,
                'message': error.message,
                'status_code': error.status_code
            },
            'request_id': request_id,
            'timestamp': logger.handlers[0].formatter.formatTime(logging.LogRecord(
                name='', level=0, pathname='', lineno=0, msg='', args=(), exc_info=None
            )) if logger.handlers else None
        }
    
    # Handle Django validation errors
    elif isinstance(error, ValidationError):
        return {
            'success': False,
            'error': {
                'code': 'VALIDATION_ERROR',
                'message': str(error),
                'status_code': 400
            },
            'request_id': request_id
        }
    
    # Handle database errors
    elif isinstance(error, (IntegrityError, DatabaseError)):
        return {
            'success': False,
            'error': {
                'code': 'DATABASE_ERROR',
                'message': 'A database error occurred. Please try again.',
                'status_code': 500
            },
            'request_id': request_id
        }
    
    # Handle permission errors
    elif isinstance(error, PermissionDenied):
        return {
            'success': False,
            'error': {
                'code': 'PERMISSION_DENIED',
                'message': 'You do not have permission to perform this action.',
                'status_code': 403
            },
            'request_id': request_id
        }
    
    # Generic error
    else:
        return {
            'success': False,
            'error': {
                'code': 'INTERNAL_ERROR',
                'message': 'An unexpected error occurred. Please try again.',
                'status_code': 500
            },
            'request_id': request_id
        }


def handle_api_error(func):
    """Decorator for consistent API error handling"""
    
    @wraps(func)
    def wrapper(*args, **kwargs):
        try:
            return func(*args, **kwargs)
        except SwapSkillError as e:
            logger.warning(f"SwapSkill error in {func.__name__}: {e.message}")
            error_response = format_error_response(e)
            return Response(error_response, status=e.status_code)
        except ValidationError as e:
            logger.warning(f"Validation error in {func.__name__}: {str(e)}")
            error_response = format_error_response(e)
            return Response(error_response, status=400)
        except PermissionDenied as e:
            logger.warning(f"Permission denied in {func.__name__}: {str(e)}")
            error_response = format_error_response(e)
            return Response(error_response, status=403)
        except (IntegrityError, DatabaseError) as e:
            logger.error(f"Database error in {func.__name__}: {str(e)}")
            error_response = format_error_response(e)
            return Response(error_response, status=500)
        except Exception as e:
            logger.error(f"Unexpected error in {func.__name__}: {str(e)}")
            logger.error(traceback.format_exc())
            error_response = format_error_response(e)
            return Response(error_response, status=500)
    
    return wrapper


def custom_exception_handler(exc, context):
    """Custom DRF exception handler"""
    
    # Call REST framework's default exception handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        # Get request ID if available
        request = context.get('request')
        request_id = getattr(request, 'id', None) if request else None
        
        # Format the error response
        error_response = format_error_response(exc, request_id)
        response.data = error_response
    
    return response


class ErrorLogger:
    """Centralized error logging utility"""
    
    @staticmethod
    def log_error(error: Exception, context: Dict[str, Any] = None, user_id: int = None):
        """Log error with context information"""
        
        error_info = {
            'error_type': type(error).__name__,
            'error_message': str(error),
            'user_id': user_id,
            'context': context or {}
        }
        
        if isinstance(error, SwapSkillError):
            logger.warning(f"SwapSkill Error: {error_info}")
        else:
            logger.error(f"Unexpected Error: {error_info}")
            logger.error(traceback.format_exc())
    
    @staticmethod
    def log_business_event(event: str, user_id: int = None, data: Dict[str, Any] = None):
        """Log business events for monitoring"""
        
        event_info = {
            'event': event,
            'user_id': user_id,
            'data': data or {}
        }
        
        logger.info(f"Business Event: {event_info}")


def validate_required_fields(data: Dict[str, Any], required_fields: list) -> None:
    """Validate required fields in request data"""
    
    missing_fields = []
    for field in required_fields:
        if field not in data or data[field] is None or data[field] == '':
            missing_fields.append(field)
    
    if missing_fields:
        raise ValidationError(
            f"Missing required fields: {', '.join(missing_fields)}"
        )


def validate_email_format(email: str) -> None:
    """Validate email format"""
    
    import re
    email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    
    if not re.match(email_pattern, email):
        raise ValidationError("Invalid email format")


def validate_phone_number(phone: str) -> None:
    """Validate phone number format"""
    
    import re
    # Basic international phone number validation
    phone_pattern = r'^\+?[1-9]\d{1,14}$'
    
    if not re.match(phone_pattern, phone.replace(' ', '').replace('-', '')):
        raise ValidationError("Invalid phone number format")


def validate_password_strength(password: str) -> None:
    """Validate password strength"""
    
    if len(password) < 8:
        raise ValidationError("Password must be at least 8 characters long")
    
    if not any(c.isupper() for c in password):
        raise ValidationError("Password must contain at least one uppercase letter")
    
    if not any(c.islower() for c in password):
        raise ValidationError("Password must contain at least one lowercase letter")
    
    if not any(c.isdigit() for c in password):
        raise ValidationError("Password must contain at least one number")


def safe_get_object(model_class, **kwargs):
    """Safely get object or raise NotFoundError"""
    
    try:
        return model_class.objects.get(**kwargs)
    except model_class.DoesNotExist:
        raise NotFoundError(f"{model_class.__name__} not found")
    except Exception as e:
        logger.error(f"Error getting {model_class.__name__}: {str(e)}")
        raise SwapSkillError("Error retrieving data")


def safe_create_object(model_class, **kwargs):
    """Safely create object with error handling"""
    
    try:
        return model_class.objects.create(**kwargs)
    except IntegrityError as e:
        logger.warning(f"Integrity error creating {model_class.__name__}: {str(e)}")
        raise BusinessLogicError("This record already exists or violates data constraints")
    except Exception as e:
        logger.error(f"Error creating {model_class.__name__}: {str(e)}")
        raise SwapSkillError("Error creating record")


# Global error logger instance
error_logger = ErrorLogger()
