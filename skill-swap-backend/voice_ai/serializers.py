from rest_framework import serializers
from django.contrib.auth.models import User
from .models import VoiceSession, VoiceInteraction, VoiceSessionResult


class VoiceSessionSerializer(serializers.ModelSerializer):
    """Serializer for VoiceSession model"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    user_email = serializers.CharField(source='user.email', read_only=True)
    duration_formatted = serializers.SerializerMethodField()
    interactions_count = serializers.SerializerMethodField()
    
    class Meta:
        model = VoiceSession
        fields = [
            'id', 'session_id', 'user', 'user_name', 'user_email',
            'call_sid', 'ultravox_call_id', 'phone_number',
            'session_type', 'status', 'conversation_data',
            'ai_response_count', 'user_input_count',
            'created_at', 'started_at', 'completed_at', 'updated_at',
            'duration_seconds', 'duration_formatted', 'interactions_count'
        ]
        read_only_fields = [
            'id', 'session_id', 'user', 'created_at', 'updated_at',
            'ai_response_count', 'user_input_count'
        ]
    
    def get_duration_formatted(self, obj):
        """Return formatted duration string"""
        if obj.duration_seconds:
            minutes = obj.duration_seconds // 60
            seconds = obj.duration_seconds % 60
            return f"{minutes}m {seconds}s"
        return None
    
    def get_interactions_count(self, obj):
        """Return count of interactions in this session"""
        return obj.interactions.count()


class VoiceInteractionSerializer(serializers.ModelSerializer):
    """Serializer for VoiceInteraction model"""
    
    session_id = serializers.CharField(source='voice_session.session_id', read_only=True)
    
    class Meta:
        model = VoiceInteraction
        fields = [
            'id', 'voice_session', 'session_id', 'interaction_type',
            'sequence_number', 'user_input', 'ai_response', 'system_action',
            'metadata', 'confidence_score', 'processing_time_ms', 'timestamp'
        ]
        read_only_fields = ['id', 'timestamp']


class VoiceSessionResultSerializer(serializers.ModelSerializer):
    """Serializer for VoiceSessionResult model"""
    
    session_id = serializers.CharField(source='voice_session.session_id', read_only=True)
    session_type = serializers.CharField(source='voice_session.session_type', read_only=True)
    
    class Meta:
        model = VoiceSessionResult
        fields = [
            'id', 'voice_session', 'session_id', 'session_type',
            'result_type', 'success', 'skills_found', 'sessions_booked',
            'availability_data', 'summary', 'follow_up_required',
            'follow_up_notes', 'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class InitiateVoiceCallSerializer(serializers.Serializer):
    """Serializer for initiating voice calls"""
    
    phone_number = serializers.CharField(
        max_length=20,
        help_text="Phone number to call (with country code)"
    )
    session_type = serializers.ChoiceField(
        choices=VoiceSession.SESSION_TYPES,
        default='skill_discovery',
        help_text="Type of voice session to initiate"
    )
    skill_type = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Specific skill type for skill discovery sessions"
    )
    context_data = serializers.JSONField(
        required=False,
        default=dict,
        help_text="Additional context data for the voice session"
    )
    
    def validate_phone_number(self, value):
        """Validate phone number format"""
        import re

        # Enhanced international phone number validation
        # Pattern explanation:
        # ^\+ - Must start with +
        # (?:[1-9]\d{0,3}) - Country code: 1-4 digits, first digit 1-9
        # \d{6,14} - Phone number: 6-14 digits
        phone_pattern = r'^\+(?:[1-9]\d{0,3})\d{6,14}$'

        if not re.match(phone_pattern, value):
            raise serializers.ValidationError(
                "Phone number must be in international format (e.g., +1234567890 or +911234567890)"
            )

        # Additional length validation
        if len(value) < 10 or len(value) > 17:
            raise serializers.ValidationError(
                "Phone number must be between 10-17 digits including country code"
            )

        # Specific validation for Indian numbers (+91XXXXXXXXXX)
        if value.startswith('+91'):
            if len(value) != 13:
                raise serializers.ValidationError(
                    "Indian phone numbers must be in format +91XXXXXXXXXX (13 digits total)"
                )

        return value


class VoiceCallStatusSerializer(serializers.Serializer):
    """Serializer for voice call status updates"""
    
    call_sid = serializers.CharField(max_length=100)
    status = serializers.ChoiceField(choices=VoiceSession.STATUS_CHOICES)
    ultravox_call_id = serializers.CharField(max_length=100, required=False)
    conversation_data = serializers.JSONField(required=False, default=dict)


class SkillSearchRequestSerializer(serializers.Serializer):
    """Serializer for voice-based skill search requests"""
    
    skill_name = serializers.CharField(max_length=100)
    skill_level = serializers.ChoiceField(
        choices=[
            ('beginner', 'Beginner'),
            ('intermediate', 'Intermediate'),
            ('advanced', 'Advanced'),
            ('expert', 'Expert')
        ],
        required=False
    )
    availability_preference = serializers.CharField(
        max_length=200,
        required=False,
        help_text="User's availability preference (e.g., 'weekends', 'evenings')"
    )
    location_preference = serializers.CharField(
        max_length=100,
        required=False,
        help_text="Location preference for in-person sessions"
    )


class SessionBookingRequestSerializer(serializers.Serializer):
    """Serializer for voice-based session booking requests"""
    
    instructor_id = serializers.IntegerField()
    skill_id = serializers.IntegerField()
    preferred_datetime = serializers.DateTimeField(required=False)
    session_duration = serializers.IntegerField(
        default=60,
        help_text="Session duration in minutes"
    )
    session_type = serializers.ChoiceField(
        choices=[
            ('online', 'Online'),
            ('in_person', 'In Person'),
            ('hybrid', 'Hybrid')
        ],
        default='online'
    )
    special_requirements = serializers.CharField(
        max_length=500,
        required=False,
        help_text="Any special requirements or notes"
    )


class VoiceSessionSummarySerializer(serializers.ModelSerializer):
    """Lightweight serializer for voice session summaries"""
    
    user_name = serializers.CharField(source='user.username', read_only=True)
    duration_formatted = serializers.SerializerMethodField()
    result_summary = serializers.CharField(source='result.summary', read_only=True)
    success = serializers.BooleanField(source='result.success', read_only=True)
    
    class Meta:
        model = VoiceSession
        fields = [
            'id', 'session_id', 'user_name', 'session_type', 'status',
            'created_at', 'completed_at', 'duration_formatted',
            'result_summary', 'success'
        ]
    
    def get_duration_formatted(self, obj):
        """Return formatted duration string"""
        if obj.duration_seconds:
            minutes = obj.duration_seconds // 60
            seconds = obj.duration_seconds % 60
            return f"{minutes}m {seconds}s"
        return None
