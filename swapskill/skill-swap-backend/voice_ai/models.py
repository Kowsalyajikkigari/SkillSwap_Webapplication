from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
import uuid

User = get_user_model()

class VoiceSession(models.Model):
    """Model to track voice AI sessions for SkillSwap users"""

    SESSION_TYPES = [
        ('skill_discovery', 'Skill Discovery'),
        ('availability_check', 'Availability Check'),
        ('session_booking', 'Session Booking'),
        ('session_management', 'Session Management'),
        ('profile_update', 'Profile Update'),
        ('general_inquiry', 'General Inquiry'),
    ]

    STATUS_CHOICES = [
        ('initiated', 'Initiated'),
        ('connecting', 'Connecting'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('cancelled', 'Cancelled'),
        ('simulated', 'Simulated (Development)'),
    ]

    # Primary identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='voice_sessions')
    session_id = models.CharField(max_length=100, unique=True, db_index=True)

    # Call tracking
    call_sid = models.CharField(max_length=100, null=True, blank=True, db_index=True)
    ultravox_call_id = models.CharField(max_length=100, null=True, blank=True)
    phone_number = models.CharField(max_length=20)

    # Session details
    session_type = models.CharField(max_length=50, choices=SESSION_TYPES, default='skill_discovery')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='initiated')

    # Conversation data
    conversation_data = models.JSONField(default=dict, help_text="Stores conversation context and results")
    ai_response_count = models.PositiveIntegerField(default=0)
    user_input_count = models.PositiveIntegerField(default=0)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Duration tracking
    duration_seconds = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'session_type']),
            models.Index(fields=['status', 'created_at']),
            models.Index(fields=['call_sid']),
        ]

    def __str__(self):
        return f"Voice Session {self.session_id} - {self.user.username} ({self.session_type})"

    def mark_started(self):
        """Mark the session as started"""
        self.status = 'in_progress'
        self.started_at = timezone.now()
        self.save(update_fields=['status', 'started_at'])

    def mark_completed(self):
        """Mark the session as completed and calculate duration"""
        self.status = 'completed'
        self.completed_at = timezone.now()
        if self.started_at:
            duration = self.completed_at - self.started_at
            self.duration_seconds = int(duration.total_seconds())
        self.save(update_fields=['status', 'completed_at', 'duration_seconds'])

    def add_conversation_data(self, key, value):
        """Add data to the conversation context"""
        if not self.conversation_data:
            self.conversation_data = {}
        self.conversation_data[key] = value
        self.save(update_fields=['conversation_data'])


class VoiceInteraction(models.Model):
    """Model to track individual interactions within a voice session"""

    INTERACTION_TYPES = [
        ('user_input', 'User Input'),
        ('ai_response', 'AI Response'),
        ('system_action', 'System Action'),
        ('api_call', 'API Call'),
        ('booking_attempt', 'Booking Attempt'),
        ('skill_search', 'Skill Search'),
        ('availability_check', 'Availability Check'),
    ]

    # Primary identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    voice_session = models.ForeignKey(VoiceSession, on_delete=models.CASCADE, related_name='interactions')

    # Interaction details
    interaction_type = models.CharField(max_length=50, choices=INTERACTION_TYPES)
    sequence_number = models.PositiveIntegerField(help_text="Order of interaction in the session")

    # Content
    user_input = models.TextField(blank=True, help_text="What the user said")
    ai_response = models.TextField(blank=True, help_text="What the AI responded")
    system_action = models.TextField(blank=True, help_text="Any system actions taken")

    # Metadata
    metadata = models.JSONField(default=dict, help_text="Additional context and data")
    confidence_score = models.FloatField(null=True, blank=True, help_text="AI confidence in understanding")
    processing_time_ms = models.PositiveIntegerField(null=True, blank=True)

    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['voice_session', 'sequence_number']
        indexes = [
            models.Index(fields=['voice_session', 'sequence_number']),
            models.Index(fields=['interaction_type', 'timestamp']),
        ]

    def __str__(self):
        return f"Interaction {self.sequence_number} - {self.voice_session.session_id} ({self.interaction_type})"


class VoiceSessionResult(models.Model):
    """Model to store the results/outcomes of voice sessions"""

    RESULT_TYPES = [
        ('skill_found', 'Skill Found'),
        ('session_booked', 'Session Booked'),
        ('availability_provided', 'Availability Provided'),
        ('profile_updated', 'Profile Updated'),
        ('information_provided', 'Information Provided'),
        ('no_action', 'No Action Taken'),
        ('error_occurred', 'Error Occurred'),
    ]

    # Primary identifiers
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    voice_session = models.OneToOneField(VoiceSession, on_delete=models.CASCADE, related_name='result')

    # Result details
    result_type = models.CharField(max_length=50, choices=RESULT_TYPES)
    success = models.BooleanField(default=False)

    # Specific results
    skills_found = models.JSONField(default=list, help_text="List of skills found during discovery")
    sessions_booked = models.JSONField(default=list, help_text="List of sessions booked")
    availability_data = models.JSONField(default=dict, help_text="Availability information provided")

    # Summary
    summary = models.TextField(help_text="Human-readable summary of what was accomplished")
    follow_up_required = models.BooleanField(default=False)
    follow_up_notes = models.TextField(blank=True)

    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['result_type', 'success']),
            models.Index(fields=['created_at']),
        ]

    def __str__(self):
        return f"Result for {self.voice_session.session_id} - {self.result_type} ({'Success' if self.success else 'Failed'})"
