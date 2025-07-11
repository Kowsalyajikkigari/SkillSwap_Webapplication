"""
Comprehensive validation utilities for SwapSkill
Provides input validation, sanitization, and security checks
"""

import re
import html
import bleach
from typing import Any, Dict, List, Optional
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.validators import validate_email as django_validate_email
from django.utils import timezone
from datetime import datetime, date, time
import phonenumbers
from phonenumbers import NumberParseException


class InputValidator:
    """Comprehensive input validation utility"""
    
    # Allowed HTML tags for rich text content
    ALLOWED_HTML_TAGS = [
        'p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'
    ]
    
    ALLOWED_HTML_ATTRIBUTES = {
        'a': ['href', 'title'],
        '*': ['class']
    }
    
    @staticmethod
    def validate_string(value: Any, field_name: str, min_length: int = 0, max_length: int = 255, 
                       required: bool = True, allow_html: bool = False) -> str:
        """Validate and sanitize string input"""
        
        if value is None or value == '':
            if required:
                raise ValidationError(f"{field_name} is required")
            return ''
        
        if not isinstance(value, str):
            value = str(value)
        
        # Remove leading/trailing whitespace
        value = value.strip()
        
        # Check length
        if len(value) < min_length:
            raise ValidationError(f"{field_name} must be at least {min_length} characters long")
        
        if len(value) > max_length:
            raise ValidationError(f"{field_name} must not exceed {max_length} characters")
        
        # Sanitize HTML if not allowed
        if not allow_html:
            value = html.escape(value)
        else:
            # Clean HTML with bleach
            value = bleach.clean(
                value, 
                tags=InputValidator.ALLOWED_HTML_TAGS,
                attributes=InputValidator.ALLOWED_HTML_ATTRIBUTES,
                strip=True
            )
        
        return value
    
    @staticmethod
    def validate_email(email: str, required: bool = True) -> str:
        """Validate email address"""
        
        if not email:
            if required:
                from utils.error_handlers import ValidationError
                raise ValidationError("Email is required")
            return ''
        
        email = email.strip().lower()
        
        try:
            django_validate_email(email)
        except DjangoValidationError:
            from utils.error_handlers import ValidationError
            raise ValidationError("Invalid email format")
        
        # Additional checks
        if len(email) > 254:
            raise ValidationError("Email address is too long")
        
        # Check for suspicious patterns
        suspicious_patterns = [
            r'\.{2,}',  # Multiple consecutive dots
            r'^\.|\.$',  # Starting or ending with dot
            r'@.*@',  # Multiple @ symbols
        ]
        
        for pattern in suspicious_patterns:
            if re.search(pattern, email):
                raise ValidationError("Invalid email format")
        
        return email
    
    @staticmethod
    def validate_phone_number(phone: str, required: bool = True) -> str:
        """Validate phone number using phonenumbers library"""
        
        if not phone:
            if required:
                raise ValidationError("Phone number is required")
            return ''
        
        phone = phone.strip()
        
        try:
            # Parse phone number
            parsed_number = phonenumbers.parse(phone, None)
            
            # Validate the number
            if not phonenumbers.is_valid_number(parsed_number):
                raise ValidationError("Invalid phone number")
            
            # Format to international format
            formatted_number = phonenumbers.format_number(
                parsed_number, phonenumbers.PhoneNumberFormat.E164
            )
            
            return formatted_number
            
        except NumberParseException:
            raise ValidationError("Invalid phone number format")
    
    @staticmethod
    def validate_password(password: str) -> str:
        """Validate password strength"""
        
        if not password:
            raise ValidationError("Password is required")
        
        if len(password) < 8:
            raise ValidationError("Password must be at least 8 characters long")
        
        if len(password) > 128:
            raise ValidationError("Password is too long")
        
        # Check for required character types
        has_upper = any(c.isupper() for c in password)
        has_lower = any(c.islower() for c in password)
        has_digit = any(c.isdigit() for c in password)
        has_special = any(c in '!@#$%^&*()_+-=[]{}|;:,.<>?' for c in password)
        
        if not has_upper:
            raise ValidationError("Password must contain at least one uppercase letter")
        
        if not has_lower:
            raise ValidationError("Password must contain at least one lowercase letter")
        
        if not has_digit:
            raise ValidationError("Password must contain at least one number")
        
        if not has_special:
            raise ValidationError("Password must contain at least one special character")
        
        # Check for common weak passwords
        weak_passwords = [
            'password', '12345678', 'qwerty123', 'admin123', 'welcome123'
        ]
        
        if password.lower() in weak_passwords:
            raise ValidationError("Password is too common. Please choose a stronger password")
        
        return password
    
    @staticmethod
    def validate_integer(value: Any, field_name: str, min_value: int = None, 
                        max_value: int = None, required: bool = True) -> Optional[int]:
        """Validate integer input"""
        
        if value is None or value == '':
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
        
        try:
            value = int(value)
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a valid integer")
        
        if min_value is not None and value < min_value:
            raise ValidationError(f"{field_name} must be at least {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValidationError(f"{field_name} must not exceed {max_value}")
        
        return value
    
    @staticmethod
    def validate_float(value: Any, field_name: str, min_value: float = None, 
                      max_value: float = None, required: bool = True) -> Optional[float]:
        """Validate float input"""
        
        if value is None or value == '':
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
        
        try:
            value = float(value)
        except (ValueError, TypeError):
            raise ValidationError(f"{field_name} must be a valid number")
        
        if min_value is not None and value < min_value:
            raise ValidationError(f"{field_name} must be at least {min_value}")
        
        if max_value is not None and value > max_value:
            raise ValidationError(f"{field_name} must not exceed {max_value}")
        
        return value
    
    @staticmethod
    def validate_date(value: Any, field_name: str, required: bool = True, 
                     future_only: bool = False, past_only: bool = False) -> Optional[date]:
        """Validate date input"""
        
        if value is None or value == '':
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
        
        if isinstance(value, str):
            try:
                value = datetime.fromisoformat(value).date()
            except ValueError:
                raise ValidationError(f"{field_name} must be a valid date (YYYY-MM-DD)")
        
        if not isinstance(value, date):
            raise ValidationError(f"{field_name} must be a valid date")
        
        today = timezone.now().date()
        
        if future_only and value <= today:
            raise ValidationError(f"{field_name} must be in the future")
        
        if past_only and value >= today:
            raise ValidationError(f"{field_name} must be in the past")
        
        return value
    
    @staticmethod
    def validate_time(value: Any, field_name: str, required: bool = True) -> Optional[time]:
        """Validate time input"""
        
        if value is None or value == '':
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
        
        if isinstance(value, str):
            try:
                value = datetime.strptime(value, '%H:%M').time()
            except ValueError:
                try:
                    value = datetime.strptime(value, '%H:%M:%S').time()
                except ValueError:
                    raise ValidationError(f"{field_name} must be a valid time (HH:MM or HH:MM:SS)")
        
        if not isinstance(value, time):
            raise ValidationError(f"{field_name} must be a valid time")
        
        return value
    
    @staticmethod
    def validate_choice(value: Any, field_name: str, choices: List[Any], 
                       required: bool = True) -> Any:
        """Validate choice from predefined options"""
        
        if value is None or value == '':
            if required:
                raise ValidationError(f"{field_name} is required")
            return None
        
        if value not in choices:
            raise ValidationError(f"{field_name} must be one of: {', '.join(map(str, choices))}")
        
        return value
    
    @staticmethod
    def validate_url(value: str, field_name: str, required: bool = True) -> str:
        """Validate URL format"""
        
        if not value:
            if required:
                raise ValidationError(f"{field_name} is required")
            return ''
        
        value = value.strip()
        
        # Basic URL pattern
        url_pattern = re.compile(
            r'^https?://'  # http:// or https://
            r'(?:(?:[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?\.)+[A-Z]{2,6}\.?|'  # domain...
            r'localhost|'  # localhost...
            r'\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})'  # ...or ip
            r'(?::\d+)?'  # optional port
            r'(?:/?|[/?]\S+)$', re.IGNORECASE)
        
        if not url_pattern.match(value):
            raise ValidationError(f"{field_name} must be a valid URL")
        
        return value
    
    @staticmethod
    def sanitize_filename(filename: str) -> str:
        """Sanitize filename for safe storage"""
        
        if not filename:
            return ''
        
        # Remove path separators and dangerous characters
        filename = re.sub(r'[<>:"/\\|?*]', '', filename)
        
        # Remove leading/trailing dots and spaces
        filename = filename.strip('. ')
        
        # Limit length
        if len(filename) > 255:
            name, ext = filename.rsplit('.', 1) if '.' in filename else (filename, '')
            filename = name[:250] + ('.' + ext if ext else '')
        
        return filename
    
    @staticmethod
    def validate_json_data(data: Dict[str, Any], schema: Dict[str, Dict]) -> Dict[str, Any]:
        """Validate JSON data against a schema"""
        
        validated_data = {}
        
        for field_name, field_config in schema.items():
            field_type = field_config.get('type', 'string')
            required = field_config.get('required', False)
            value = data.get(field_name)
            
            if field_type == 'string':
                validated_data[field_name] = InputValidator.validate_string(
                    value, field_name, 
                    min_length=field_config.get('min_length', 0),
                    max_length=field_config.get('max_length', 255),
                    required=required,
                    allow_html=field_config.get('allow_html', False)
                )
            elif field_type == 'email':
                validated_data[field_name] = InputValidator.validate_email(value, required)
            elif field_type == 'integer':
                validated_data[field_name] = InputValidator.validate_integer(
                    value, field_name,
                    min_value=field_config.get('min_value'),
                    max_value=field_config.get('max_value'),
                    required=required
                )
            elif field_type == 'choice':
                validated_data[field_name] = InputValidator.validate_choice(
                    value, field_name, field_config.get('choices', []), required
                )
            # Add more types as needed
        
        return validated_data


# Global validator instance
input_validator = InputValidator()
