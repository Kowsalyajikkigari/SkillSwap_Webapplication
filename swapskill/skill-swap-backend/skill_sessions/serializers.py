from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Session, SessionRequest, SessionFeedback
from skills.serializers import SkillSerializer

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for user information."""
    
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'avatar_url')
    
    def get_avatar_url(self, obj):
        """Get avatar URL safely."""
        try:
            if hasattr(obj, 'profile') and obj.profile.avatar:
                return obj.profile.avatar.url
        except:
            pass
        return None


class SessionRequestSerializer(serializers.ModelSerializer):
    """Serializer for session requests."""
    
    requester_details = UserBasicSerializer(source='requester', read_only=True)
    provider_details = UserBasicSerializer(source='provider', read_only=True)
    skill_details = SkillSerializer(source='skill', read_only=True)
    
    class Meta:
        model = SessionRequest
        fields = '__all__'
        read_only_fields = ('requester', 'status')


class SessionSerializer(serializers.ModelSerializer):
    """Serializer for sessions."""
    
    requester_details = UserBasicSerializer(source='requester', read_only=True)
    provider_details = UserBasicSerializer(source='provider', read_only=True)
    skill_details = SkillSerializer(source='skill', read_only=True)
    
    duration = serializers.IntegerField(source='duration_minutes')

    class Meta:
        model = Session
        fields = '__all__'
        read_only_fields = ('requester', 'status')


class SessionFeedbackSerializer(serializers.ModelSerializer):
    """Serializer for session feedback."""
    
    user_details = UserBasicSerializer(source='user', read_only=True)
    recipient_details = UserBasicSerializer(source='recipient', read_only=True)
    
    class Meta:
        model = SessionFeedback
        fields = '__all__'
        read_only_fields = ('user', 'recipient')
    
    def validate(self, attrs):
        """Validate that the user is part of the session."""
        session = attrs.get('session')
        user = self.context['request'].user
        
        if user != session.requester and user != session.provider:
            raise serializers.ValidationError("You can only provide feedback for sessions you participated in.")
        
        if user == session.requester:
            attrs['recipient'] = session.provider
        else:
            attrs['recipient'] = session.requester
        
        return attrs
