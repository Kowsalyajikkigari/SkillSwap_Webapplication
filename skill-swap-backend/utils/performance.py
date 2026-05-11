"""
Performance optimization utilities for SwapSkill
Provides caching, query optimization, and performance monitoring
"""

import time
import logging
from functools import wraps
from typing import Any, Dict, List, Optional, Callable
from django.core.cache import cache
from django.db import connection
from django.conf import settings
from django.utils import timezone
from datetime import timedelta

logger = logging.getLogger('swapskill')


class CacheManager:
    """Centralized cache management utility"""
    
    # Cache timeout configurations (in seconds)
    CACHE_TIMEOUTS = {
        'user_profile': 300,        # 5 minutes
        'skill_categories': 3600,   # 1 hour
        'skill_list': 1800,         # 30 minutes
        'user_skills': 600,         # 10 minutes
        'session_data': 300,        # 5 minutes
        'recommendations': 900,     # 15 minutes
        'voice_session': 1800,      # 30 minutes
        'availability': 600,        # 10 minutes
    }
    
    @staticmethod
    def get_cache_key(prefix: str, identifier: str, user_id: int = None) -> str:
        """Generate standardized cache key"""
        if user_id:
            return f"swapskill:{prefix}:user_{user_id}:{identifier}"
        return f"swapskill:{prefix}:{identifier}"
    
    @staticmethod
    def get_cached_data(cache_type: str, identifier: str, user_id: int = None) -> Any:
        """Get data from cache"""
        cache_key = CacheManager.get_cache_key(cache_type, identifier, user_id)
        return cache.get(cache_key)
    
    @staticmethod
    def set_cached_data(cache_type: str, identifier: str, data: Any, user_id: int = None, timeout: int = None) -> None:
        """Set data in cache"""
        cache_key = CacheManager.get_cache_key(cache_type, identifier, user_id)
        cache_timeout = timeout or CacheManager.CACHE_TIMEOUTS.get(cache_type, 300)
        cache.set(cache_key, data, timeout=cache_timeout)
    
    @staticmethod
    def invalidate_cache(cache_type: str, identifier: str = None, user_id: int = None) -> None:
        """Invalidate cache entries"""
        if identifier:
            cache_key = CacheManager.get_cache_key(cache_type, identifier, user_id)
            cache.delete(cache_key)
        else:
            # Invalidate all cache entries for this type and user
            if user_id:
                pattern = f"swapskill:{cache_type}:user_{user_id}:*"
            else:
                pattern = f"swapskill:{cache_type}:*"
            
            # Note: This requires Redis backend for pattern-based deletion
            try:
                cache.delete_pattern(pattern)
            except AttributeError:
                # Fallback for non-Redis backends
                logger.warning(f"Pattern-based cache deletion not supported for {cache_type}")
    
    @staticmethod
    def cache_user_profile(user_id: int, profile_data: Dict) -> None:
        """Cache user profile data"""
        CacheManager.set_cached_data('user_profile', str(user_id), profile_data, user_id)
    
    @staticmethod
    def get_cached_user_profile(user_id: int) -> Optional[Dict]:
        """Get cached user profile data"""
        return CacheManager.get_cached_data('user_profile', str(user_id), user_id)
    
    @staticmethod
    def cache_user_skills(user_id: int, skills_data: Dict) -> None:
        """Cache user skills data"""
        CacheManager.set_cached_data('user_skills', str(user_id), skills_data, user_id)
    
    @staticmethod
    def get_cached_user_skills(user_id: int) -> Optional[Dict]:
        """Get cached user skills data"""
        return CacheManager.get_cached_data('user_skills', str(user_id), user_id)


def cache_result(cache_type: str, timeout: int = None, key_func: Callable = None):
    """Decorator for caching function results"""
    
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Generate cache key
            if key_func:
                cache_key = key_func(*args, **kwargs)
            else:
                # Default key generation
                key_parts = [func.__name__]
                key_parts.extend(str(arg) for arg in args)
                key_parts.extend(f"{k}_{v}" for k, v in sorted(kwargs.items()))
                cache_key = "_".join(key_parts)
            
            # Try to get from cache
            cached_result = CacheManager.get_cached_data(cache_type, cache_key)
            if cached_result is not None:
                return cached_result
            
            # Execute function and cache result
            result = func(*args, **kwargs)
            CacheManager.set_cached_data(cache_type, cache_key, result, timeout=timeout)
            
            return result
        
        return wrapper
    return decorator


class QueryOptimizer:
    """Database query optimization utilities"""
    
    @staticmethod
    def optimize_user_profile_query(user_id: int):
        """Optimized query for user profile with related data"""
        from users.models import User
        
        return User.objects.select_related('profile').prefetch_related(
            'teaching_skills__skill__category',
            'learning_skills__skill__category',
            'requested_sessions__skill',
            'provided_sessions__skill'
        ).get(id=user_id)
    
    @staticmethod
    def optimize_skill_discovery_query(user_id: int = None):
        """Optimized query for skill discovery"""
        from skills.models import UserSkill, UserLearningSkill
        
        # Use select_related and prefetch_related for efficient queries
        teaching_skills = UserSkill.objects.select_related(
            'user__profile', 'skill__category'
        ).prefetch_related('user__teaching_skills')
        
        learning_skills = UserLearningSkill.objects.select_related(
            'user__profile', 'skill__category'
        ).prefetch_related('user__learning_skills')
        
        if user_id:
            teaching_skills = teaching_skills.exclude(user_id=user_id)
            learning_skills = learning_skills.exclude(user_id=user_id)
        
        return teaching_skills, learning_skills
    
    @staticmethod
    def optimize_session_query(user_id: int):
        """Optimized query for user sessions"""
        from skill_sessions.models import Session
        
        return Session.objects.select_related(
            'requester__profile',
            'provider__profile',
            'skill__category'
        ).prefetch_related(
            'feedback'
        ).filter(
            models.Q(requester_id=user_id) | models.Q(provider_id=user_id)
        )
    
    @staticmethod
    def optimize_conversation_query(user_id: int):
        """Optimized query for user conversations"""
        from chat_messages.models import Conversation
        
        return Conversation.objects.prefetch_related(
            'participants__profile',
            'messages__sender__profile'
        ).filter(participants=user_id)


class PerformanceMonitor:
    """Performance monitoring utilities"""
    
    @staticmethod
    def monitor_query_performance(func):
        """Decorator to monitor database query performance"""
        
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Reset query count
            initial_queries = len(connection.queries)
            start_time = time.time()
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Calculate performance metrics
            end_time = time.time()
            execution_time = end_time - start_time
            query_count = len(connection.queries) - initial_queries
            
            # Log performance metrics
            if execution_time > 1.0:  # Log slow operations
                logger.warning(
                    f"Slow operation detected: {func.__name__} took {execution_time:.2f}s "
                    f"with {query_count} database queries"
                )
            elif settings.DEBUG:
                logger.debug(
                    f"Performance: {func.__name__} took {execution_time:.2f}s "
                    f"with {query_count} database queries"
                )
            
            return result
        
        return wrapper
    
    @staticmethod
    def log_api_performance(view_func):
        """Decorator to monitor API endpoint performance"""
        
        @wraps(view_func)
        def wrapper(request, *args, **kwargs):
            start_time = time.time()
            initial_queries = len(connection.queries)
            
            # Execute view
            response = view_func(request, *args, **kwargs)
            
            # Calculate metrics
            end_time = time.time()
            execution_time = end_time - start_time
            query_count = len(connection.queries) - initial_queries
            
            # Log performance
            endpoint = f"{request.method} {request.path}"
            
            if execution_time > 2.0:  # Log slow API calls
                logger.warning(
                    f"Slow API call: {endpoint} took {execution_time:.2f}s "
                    f"with {query_count} queries - Status: {response.status_code}"
                )
            
            # Add performance headers
            response['X-Response-Time'] = f"{execution_time:.3f}s"
            response['X-Query-Count'] = str(query_count)
            
            return response
        
        return wrapper


class DataPaginator:
    """Efficient data pagination utility"""
    
    @staticmethod
    def paginate_queryset(queryset, page: int = 1, page_size: int = 20):
        """Efficiently paginate queryset"""
        
        # Calculate offset
        offset = (page - 1) * page_size
        
        # Get total count (cached if possible)
        cache_key = f"count_{queryset.model.__name__}_{hash(str(queryset.query))}"
        total_count = cache.get(cache_key)
        
        if total_count is None:
            total_count = queryset.count()
            cache.set(cache_key, total_count, timeout=300)  # Cache for 5 minutes
        
        # Get paginated results
        results = list(queryset[offset:offset + page_size])
        
        # Calculate pagination info
        total_pages = (total_count + page_size - 1) // page_size
        has_next = page < total_pages
        has_previous = page > 1
        
        return {
            'results': results,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'total_pages': total_pages,
                'has_next': has_next,
                'has_previous': has_previous,
                'next_page': page + 1 if has_next else None,
                'previous_page': page - 1 if has_previous else None,
            }
        }


class ResponseOptimizer:
    """API response optimization utilities"""
    
    @staticmethod
    def compress_response_data(data: Dict) -> Dict:
        """Compress response data by removing unnecessary fields"""
        
        if isinstance(data, dict):
            # Remove None values
            compressed = {k: v for k, v in data.items() if v is not None}
            
            # Recursively compress nested dictionaries
            for key, value in compressed.items():
                if isinstance(value, dict):
                    compressed[key] = ResponseOptimizer.compress_response_data(value)
                elif isinstance(value, list):
                    compressed[key] = [
                        ResponseOptimizer.compress_response_data(item) if isinstance(item, dict) else item
                        for item in value
                    ]
            
            return compressed
        
        return data
    
    @staticmethod
    def optimize_serializer_data(serializer_data: Dict, fields_to_include: List[str] = None) -> Dict:
        """Optimize serializer data by including only necessary fields"""
        
        if fields_to_include:
            return {k: v for k, v in serializer_data.items() if k in fields_to_include}
        
        return ResponseOptimizer.compress_response_data(serializer_data)


# Global instances
cache_manager = CacheManager()
query_optimizer = QueryOptimizer()
performance_monitor = PerformanceMonitor()
data_paginator = DataPaginator()
response_optimizer = ResponseOptimizer()
