"""
Ultravox API Client for SkillSwap Voice AI Integration
Handles communication with Ultravox API for voice AI conversations
"""

import requests
import json
import logging
from typing import Dict, Any, Optional
from django.conf import settings
from .voice_prompts import get_ultravox_config

logger = logging.getLogger(__name__)


class UltravoxClient:
    """Client for interacting with Ultravox API"""
    
    def __init__(self):
        self.api_key = getattr(settings, 'ULTRAVOX_API_KEY', None)
        self.api_url = getattr(settings, 'ULTRAVOX_API_URL', 'https://api.ultravox.ai/api/calls')
        self.headers = {
            'Content-Type': 'application/json',
            'X-API-Key': self.api_key
        }
        
        if not self.api_key:
            logger.error("ULTRAVOX_API_KEY not configured in settings")
            raise ValueError("Ultravox API key is required")
    
    def create_call(self, session_type: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Create a new Ultravox call for SkillSwap

        Args:
            session_type (str): Type of voice session ('skill_discovery', 'availability_check', etc.)
            context (dict): Additional context for the AI prompt

        Returns:
            dict: Response from Ultravox API containing joinUrl and call details
        """
        try:
            # Get the appropriate configuration for this session type
            ultravox_config = get_ultravox_config(session_type, context)
            
            logger.info(f"Creating Ultravox call for session type: {session_type}")
            logger.info(f"Ultravox API URL: {self.api_url}")
            logger.info(f"Ultravox config: {json.dumps(ultravox_config, indent=2)}")

            response = requests.post(
                self.api_url,
                headers=self.headers,
                json=ultravox_config,
                timeout=30
            )

            logger.info(f"Ultravox response status: {response.status_code}")
            if response.status_code != 200:
                logger.error(f"Ultravox error response: {response.text}")

            response.raise_for_status()
            result = response.json()
            
            logger.info(f"Ultravox call created successfully: {result.get('callId', 'Unknown ID')}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to create Ultravox call: {e}")
            raise UltravoxAPIError(f"Failed to create Ultravox call: {e}")
        except Exception as e:
            logger.error(f"Unexpected error creating Ultravox call: {e}")
            raise UltravoxAPIError(f"Unexpected error: {e}")
    
    def get_call_status(self, call_id: str) -> Dict[str, Any]:
        """
        Get the status of an existing Ultravox call
        
        Args:
            call_id (str): The Ultravox call ID
        
        Returns:
            dict: Call status information
        """
        try:
            url = f"{self.api_url}/{call_id}"
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Retrieved status for Ultravox call {call_id}: {result.get('status', 'Unknown')}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get Ultravox call status: {e}")
            raise UltravoxAPIError(f"Failed to get call status: {e}")
    
    def end_call(self, call_id: str) -> Dict[str, Any]:
        """
        End an active Ultravox call

        Args:
            call_id (str): The Ultravox call ID

        Returns:
            dict: Response from ending the call
        """
        try:
            url = f"{self.api_url}/{call_id}/end"
            response = requests.post(url, headers=self.headers, timeout=30)
            response.raise_for_status()

            result = response.json()
            logger.info(f"Ended Ultravox call {call_id}")
            return result

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to end Ultravox call: {e}")
            raise UltravoxAPIError(f"Failed to end call: {e}")

    def trigger_outbound_call(self, call_id: str, phone_number: str) -> Dict[str, Any]:
        """
        Trigger an outbound call for an existing Ultravox call

        Args:
            call_id (str): The Ultravox call ID
            phone_number (str): Phone number to call

        Returns:
            dict: Response from triggering the call
        """
        try:
            # For Ultravox with Twilio integration, we need to trigger the outbound call
            # This is typically done by updating the call with the target phone number
            url = f"{self.api_url}/{call_id}"

            # Update the call to trigger outbound calling
            update_data = {
                "medium": {
                    "twilio": {
                        "phoneNumber": phone_number
                    }
                }
            }

            response = requests.patch(url, headers=self.headers, json=update_data, timeout=30)
            response.raise_for_status()

            result = response.json()
            logger.info(f"Outbound call triggered for Ultravox call {call_id} to {phone_number}")
            return result

        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to trigger outbound call: {e}")
            raise UltravoxAPIError(f"Failed to trigger outbound call: {e}")
    
    def get_call_transcript(self, call_id: str) -> Dict[str, Any]:
        """
        Get the transcript of a completed Ultravox call
        
        Args:
            call_id (str): The Ultravox call ID
        
        Returns:
            dict: Call transcript and conversation data
        """
        try:
            url = f"{self.api_url}/{call_id}/transcript"
            response = requests.get(url, headers=self.headers, timeout=30)
            response.raise_for_status()
            
            result = response.json()
            logger.info(f"Retrieved transcript for Ultravox call {call_id}")
            return result
            
        except requests.exceptions.RequestException as e:
            logger.error(f"Failed to get Ultravox call transcript: {e}")
            raise UltravoxAPIError(f"Failed to get transcript: {e}")


class SkillSwapVoiceAI:
    """High-level interface for SkillSwap voice AI operations"""
    
    def __init__(self):
        self.ultravox_client = UltravoxClient()
    
    def create_skill_discovery_call(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a personalized voice call for skill discovery

        Args:
            user_context (dict): Comprehensive user information and preferences

        Returns:
            dict: Call creation response with joinUrl
        """
        # Pass the full user context for personalized responses
        return self.ultravox_client.create_call('skill_discovery', user_context)
    
    def create_availability_check_call(self, user_context: Dict[str, Any], target_phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a personalized voice call for availability checking

        Args:
            user_context (dict): Comprehensive user information and current availability
            target_phone_number (str): Phone number to call

        Returns:
            dict: Call creation response with joinUrl
        """
        # Pass the full user context for personalized responses
        return self.ultravox_client.create_call('availability_check', user_context, target_phone_number)

    def create_session_booking_call(self, user_context: Dict[str, Any], target_phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a personalized voice call for session booking

        Args:
            user_context (dict): Comprehensive user information and booking preferences
            target_phone_number (str): Phone number to call

        Returns:
            dict: Call creation response with joinUrl
        """
        # Pass the full user context for personalized responses
        return self.ultravox_client.create_call('session_booking', user_context, target_phone_number)

    def create_session_management_call(self, user_context: Dict[str, Any], target_phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a personalized voice call for session management

        Args:
            user_context (dict): Comprehensive user information and existing sessions
            target_phone_number (str): Phone number to call

        Returns:
            dict: Call creation response with joinUrl
        """
        # Pass the full user context for personalized responses
        return self.ultravox_client.create_call('session_management', user_context, target_phone_number)

    def create_general_inquiry_call(self, user_context: Dict[str, Any], target_phone_number: Optional[str] = None) -> Dict[str, Any]:
        """
        Create a personalized voice call for general inquiries

        Args:
            user_context (dict): Comprehensive user information
            target_phone_number (str): Phone number to call

        Returns:
            dict: Call creation response with joinUrl
        """
        # Pass the full user context for personalized responses
        return self.ultravox_client.create_call('general_inquiry', user_context, target_phone_number)

    def create_general_inquiry_call(self, user_context: Dict[str, Any]) -> Dict[str, Any]:
        """
        Create a personalized voice call for general inquiries

        Args:
            user_context (dict): Comprehensive user information

        Returns:
            dict: Call creation response with joinUrl
        """
        # Pass the full user context for personalized responses
        return self.ultravox_client.create_call('personalized_assistant', user_context)


class UltravoxAPIError(Exception):
    """Custom exception for Ultravox API errors"""
    pass


# Utility functions for voice AI integration
def prepare_user_context(user, session_type: str) -> Dict[str, Any]:
    """
    Prepare comprehensive user context for personalized voice AI calls

    Args:
        user: Django User instance
        session_type (str): Type of voice session

    Returns:
        dict: Comprehensive user context with personalized data
    """
    from django.utils import timezone
    from datetime import datetime, timedelta
    import logging

    logger = logging.getLogger(__name__)

    # Base user information
    context = {
        'user_name': user.get_full_name() or user.username,
        'first_name': user.first_name,
        'user_id': user.id,
        'session_type': session_type,
        'call_timestamp': timezone.now().isoformat()
    }

    try:
        # Get user profile data
        if hasattr(user, 'profile'):
            profile = user.profile
            context.update({
                'level': getattr(profile, 'level', 1),
                'points': getattr(profile, 'points', 0),
                'next_level_points': getattr(profile, 'next_level_points', 1000),
                'average_rating': getattr(profile, 'average_rating', 0),
                'sessions_completed': getattr(profile, 'sessions_completed', 0),
                'bio': getattr(profile, 'bio', ''),
                'location': getattr(profile, 'location', ''),
                'phone': getattr(profile, 'phone', ''),
                'member_since': user.date_joined.strftime('%B %Y') if user.date_joined else 'Recently'
            })

            # Calculate profile completion
            profile_fields = ['bio', 'location', 'phone']
            completed_fields = sum(1 for field in profile_fields if getattr(profile, field, ''))
            missing_fields = [field for field in profile_fields if not getattr(profile, field, '')]
            context['profile_completion'] = {
                'percentage': round((completed_fields / len(profile_fields)) * 100),
                'missing_fields': missing_fields,
                'completed_fields': completed_fields,
                'total_fields': len(profile_fields)
            }
        else:
            # Default values for users without profiles
            context.update({
                'level': 1,
                'points': 0,
                'next_level_points': 1000,
                'average_rating': 0,
                'sessions_completed': 0,
                'bio': '',
                'location': '',
                'phone': '',
                'member_since': 'Recently',
                'profile_completion': {
                    'percentage': 25,  # Just having an account
                    'missing_fields': ['bio', 'location', 'phone'],
                    'completed_fields': 0,
                    'total_fields': 3
                }
            })

    except Exception as e:
        logger.error(f"Error fetching user profile data: {e}")

    # Get user's skills data
    try:
        # Teaching skills
        from skills.models import TeachingSkill
        teaching_skills = TeachingSkill.objects.filter(user=user).select_related('skill')
        context['teaching_skills'] = [
            {
                'name': skill.skill.name,
                'experience_level': getattr(skill, 'experience_level', 'intermediate'),
                'sessions_taught': getattr(skill, 'sessions_taught', 0)
            } for skill in teaching_skills
        ]

        # Learning skills
        from skills.models import LearningSkill
        learning_skills = LearningSkill.objects.filter(user=user).select_related('skill')
        context['learning_skills'] = [
            {
                'name': skill.skill.name,
                'interest_level': getattr(skill, 'interest_level', 'beginner'),
                'sessions_taken': getattr(skill, 'sessions_taken', 0)
            } for skill in learning_skills
        ]

    except ImportError:
        logger.warning("Skills models not available")
        context['teaching_skills'] = []
        context['learning_skills'] = []
    except Exception as e:
        logger.error(f"Error fetching user skills: {e}")
        context['teaching_skills'] = []
        context['learning_skills'] = []

    # Get upcoming sessions
    try:
        from skill_sessions.models import Session
        from django.db.models import Q
        from datetime import datetime, time

        # Create a datetime from date and start_time for filtering
        today = timezone.now().date()
        now_time = timezone.now().time()

        upcoming_sessions = Session.objects.filter(
            Q(requester=user) | Q(provider=user),
            status__in=['confirmed', 'pending']
        ).filter(
            Q(date__gt=today) | Q(date=today, start_time__gte=now_time)
        ).order_by('date', 'start_time')[:10]

        context['upcoming_sessions'] = [
            {
                'id': session.id,
                'skill': session.skill.name if session.skill else 'General',
                'partner_name': (session.provider.get_full_name() if session.requester == user
                               else session.requester.get_full_name()) or 'Unknown',
                'scheduled_time': f"{session.date.strftime('%B %d')} at {session.start_time.strftime('%I:%M %p')}" if session.date and session.start_time else 'TBD',
                'session_type': session.session_type,
                'status': session.status
            } for session in upcoming_sessions
        ]

        # Get recent completed sessions
        recent_sessions = Session.objects.filter(
            Q(requester=user) | Q(provider=user),
            status='completed',
            date__gte=timezone.now().date() - timedelta(days=30)
        ).order_by('-date', '-start_time')[:5]

        context['recent_sessions'] = [
            {
                'skill': session.skill.name if session.skill else 'General',
                'partner_name': (session.provider.get_full_name() if session.requester == user
                               else session.requester.get_full_name()) or 'Unknown',
                'completed_date': session.date.strftime('%B %d') if session.date else 'Unknown',
                'rating_received': getattr(session, 'rating_for_user', None)
            } for session in recent_sessions
        ]

    except ImportError:
        logger.warning("Session models not available")
        context['upcoming_sessions'] = []
        context['recent_sessions'] = []
    except Exception as e:
        logger.error(f"Error fetching user sessions: {e}")
        context['upcoming_sessions'] = []
        context['recent_sessions'] = []

    # Get messaging data
    try:
        from chat_messages.models import Message, Conversation

        # Get unread message count
        unread_messages = Message.objects.filter(
            conversation__participants=user,
            is_read=False
        ).exclude(sender=user).count()

        context['unread_messages_count'] = unread_messages

        # Get recent conversations
        recent_conversations = Conversation.objects.filter(
            participants=user
        ).order_by('-updated_at')[:5]

        context['recent_conversations'] = [
            {
                'id': conv.id,
                'other_participant': conv.participants.exclude(id=user.id).first().get_full_name() if conv.participants.exclude(id=user.id).exists() else 'Unknown',
                'last_message_preview': conv.last_message.content[:50] + '...' if conv.last_message and len(conv.last_message.content) > 50 else conv.last_message.content if conv.last_message else 'No messages',
                'updated_at': conv.updated_at.strftime('%B %d')
            } for conv in recent_conversations
        ]

    except ImportError:
        logger.warning("Chat message models not available")
        context['unread_messages_count'] = 0
        context['recent_conversations'] = []
    except Exception as e:
        logger.error(f"Error fetching messaging data: {e}")
        context['unread_messages_count'] = 0
        context['recent_conversations'] = []

    # Get session requests
    try:
        from skill_sessions.models import SessionRequest

        # Incoming requests (pending)
        incoming_requests = SessionRequest.objects.filter(
            provider=user,
            status='pending'
        ).order_by('-created_at')[:5]

        context['incoming_requests'] = [
            {
                'id': request.id,
                'requester_name': request.requester.get_full_name(),
                'skill': request.skill.name if request.skill else 'General',
                'proposed_time': request.proposed_time.strftime('%B %d at %I:%M %p') if request.proposed_time else 'Flexible',
                'message': request.message[:100] + '...' if request.message and len(request.message) > 100 else request.message or '',
                'created_at': request.created_at.strftime('%B %d')
            } for request in incoming_requests
        ]

        # Outgoing requests (pending)
        outgoing_requests = SessionRequest.objects.filter(
            requester=user,
            status='pending'
        ).order_by('-created_at')[:5]

        context['outgoing_requests'] = [
            {
                'id': request.id,
                'provider_name': request.provider.get_full_name(),
                'skill': request.skill.name if request.skill else 'General',
                'status': request.status,
                'created_at': request.created_at.strftime('%B %d')
            } for request in outgoing_requests
        ]

    except ImportError:
        logger.warning("Session request models not available")
        context['incoming_requests'] = []
        context['outgoing_requests'] = []
    except Exception as e:
        logger.error(f"Error fetching session requests: {e}")
        context['incoming_requests'] = []
        context['outgoing_requests'] = []

    return context


def log_voice_interaction(voice_session, interaction_type: str, user_input: str = "", 
                         ai_response: str = "", metadata: Dict[str, Any] = None):
    """
    Log a voice interaction to the database
    
    Args:
        voice_session: VoiceSession instance
        interaction_type (str): Type of interaction
        user_input (str): What the user said
        ai_response (str): What the AI responded
        metadata (dict): Additional metadata
    """
    from .models import VoiceInteraction
    
    # Get the next sequence number
    last_interaction = VoiceInteraction.objects.filter(
        voice_session=voice_session
    ).order_by('-sequence_number').first()
    
    sequence_number = (last_interaction.sequence_number + 1) if last_interaction else 1
    
    VoiceInteraction.objects.create(
        voice_session=voice_session,
        interaction_type=interaction_type,
        sequence_number=sequence_number,
        user_input=user_input,
        ai_response=ai_response,
        metadata=metadata or {}
    )
