from django.contrib import admin
from .models import Session, SessionRequest, SessionFeedback


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    """Admin for sessions."""
    
    list_display = ('id', 'skill', 'requester', 'provider', 'date', 'status', 'created_at')
    list_filter = ('status', 'session_type', 'date')
    search_fields = ('requester__email', 'provider__email', 'skill__name', 'title')
    date_hierarchy = 'date'


@admin.register(SessionRequest)
class SessionRequestAdmin(admin.ModelAdmin):
    """Admin for session requests."""
    
    list_display = ('id', 'skill', 'requester', 'provider', 'status', 'created_at')
    list_filter = ('status', 'session_type')
    search_fields = ('requester__email', 'provider__email', 'skill__name', 'message')
    date_hierarchy = 'created_at'


@admin.register(SessionFeedback)
class SessionFeedbackAdmin(admin.ModelAdmin):
    """Admin for session feedback."""
    
    list_display = ('id', 'session', 'user', 'recipient', 'rating', 'created_at')
    list_filter = ('rating',)
    search_fields = ('user__email', 'recipient__email', 'comment')
    date_hierarchy = 'created_at'
