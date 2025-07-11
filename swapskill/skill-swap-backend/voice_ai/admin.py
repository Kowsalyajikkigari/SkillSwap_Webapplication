from django.contrib import admin
from .models import VoiceSession, VoiceInteraction, VoiceSessionResult


@admin.register(VoiceSession)
class VoiceSessionAdmin(admin.ModelAdmin):
    """Admin interface for VoiceSession model"""

    list_display = [
        'session_id', 'user', 'session_type', 'status',
        'phone_number', 'duration_formatted', 'created_at'
    ]
    list_filter = ['session_type', 'status', 'created_at']
    search_fields = ['session_id', 'user__username', 'user__email', 'phone_number']
    readonly_fields = [
        'id', 'session_id', 'created_at', 'updated_at',
        'ai_response_count', 'user_input_count'
    ]

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'session_id', 'user', 'phone_number')
        }),
        ('Call Details', {
            'fields': ('call_sid', 'ultravox_call_id', 'session_type', 'status')
        }),
        ('Conversation Data', {
            'fields': ('conversation_data', 'ai_response_count', 'user_input_count'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'started_at', 'completed_at', 'updated_at', 'duration_seconds'),
            'classes': ('collapse',)
        }),
    )

    def duration_formatted(self, obj):
        """Display formatted duration"""
        if obj.duration_seconds:
            minutes = obj.duration_seconds // 60
            seconds = obj.duration_seconds % 60
            return f"{minutes}m {seconds}s"
        return "-"
    duration_formatted.short_description = "Duration"

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('user')


@admin.register(VoiceInteraction)
class VoiceInteractionAdmin(admin.ModelAdmin):
    """Admin interface for VoiceInteraction model"""

    list_display = [
        'voice_session', 'sequence_number', 'interaction_type',
        'confidence_score', 'processing_time_ms', 'timestamp'
    ]
    list_filter = ['interaction_type', 'timestamp']
    search_fields = ['voice_session__session_id', 'user_input', 'ai_response']
    readonly_fields = ['id', 'timestamp']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'voice_session', 'interaction_type', 'sequence_number')
        }),
        ('Conversation Content', {
            'fields': ('user_input', 'ai_response', 'system_action')
        }),
        ('Metadata', {
            'fields': ('metadata', 'confidence_score', 'processing_time_ms', 'timestamp'),
            'classes': ('collapse',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('voice_session', 'voice_session__user')


@admin.register(VoiceSessionResult)
class VoiceSessionResultAdmin(admin.ModelAdmin):
    """Admin interface for VoiceSessionResult model"""

    list_display = [
        'voice_session', 'result_type', 'success',
        'follow_up_required', 'created_at'
    ]
    list_filter = ['result_type', 'success', 'follow_up_required', 'created_at']
    search_fields = ['voice_session__session_id', 'summary']
    readonly_fields = ['id', 'created_at']

    fieldsets = (
        ('Basic Information', {
            'fields': ('id', 'voice_session', 'result_type', 'success')
        }),
        ('Results Data', {
            'fields': ('skills_found', 'sessions_booked', 'availability_data')
        }),
        ('Summary', {
            'fields': ('summary', 'follow_up_required', 'follow_up_notes')
        }),
        ('Timestamps', {
            'fields': ('created_at',)
        }),
    )

    def get_queryset(self, request):
        return super().get_queryset(request).select_related('voice_session', 'voice_session__user')
