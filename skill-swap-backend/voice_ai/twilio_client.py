"""
Twilio Client for SkillSwap Voice AI Integration
Handles phone call initiation and management through Twilio
"""

import logging
from typing import Dict, Any, Optional
from django.conf import settings
from django.utils import timezone
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

logger = logging.getLogger(__name__)


class TwilioVoiceClient:
    """Client for managing Twilio voice calls"""
    
    def __init__(self):
        self.account_sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
        self.auth_token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
        self.phone_number = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
        
        if not all([self.account_sid, self.auth_token, self.phone_number]):
            logger.error("Twilio credentials not properly configured")
            raise ValueError("Twilio credentials are required")
        
        self.client = Client(self.account_sid, self.auth_token)
    
    def initiate_call(self, to_number: str, ultravox_join_url: str, 
                     webhook_url: Optional[str] = None) -> Dict[str, Any]:
        """
        Initiate a phone call that connects to Ultravox voice AI
        
        Args:
            to_number (str): Phone number to call
            ultravox_join_url (str): Ultravox join URL for the AI conversation
            webhook_url (str): Optional webhook URL for call status updates
        
        Returns:
            dict: Call information including call SID
        """
        try:
            # Create optimized TwiML for faster connection to Ultravox
            # Use direct connection instead of streaming for better performance
            twiml = f'''<Response>
                <Say voice="alice">Hello! Connecting you to your SkillSwap voice assistant...</Say>
                <Connect>
                    <Stream url="{ultravox_join_url}"/>
                </Connect>
            </Response>'''

            # Initiate the call with optimized settings
            call = self.client.calls.create(
                twiml=twiml,
                to=to_number,
                from_=self.phone_number,
                status_callback=webhook_url if webhook_url else None,
                status_callback_event=['initiated', 'ringing', 'answered', 'completed'],
                status_callback_method='POST',
                timeout=30,  # Reduce timeout for faster connection
                record=False  # Disable recording for faster processing
            )
            
            logger.info(f"Twilio call initiated: {call.sid} to {to_number}")
            
            return {
                'call_sid': call.sid,
                'status': call.status,
                'to': call.to,
                'from_number': getattr(call, 'from_', self.phone_number),
                'date_created': call.date_created.isoformat() if call.date_created else None
            }
            
        except TwilioException as e:
            logger.error(f"Twilio error initiating call: {e}")
            raise TwilioVoiceError(f"Failed to initiate call: {e}")
        except Exception as e:
            logger.error(f"Unexpected error initiating call: {e}")
            raise TwilioVoiceError(f"Unexpected error: {e}")
    
    def get_call_status(self, call_sid: str) -> Dict[str, Any]:
        """
        Get the current status of a Twilio call
        
        Args:
            call_sid (str): Twilio call SID
        
        Returns:
            dict: Call status information
        """
        try:
            call = self.client.calls(call_sid).fetch()
            
            return {
                'call_sid': call.sid,
                'status': call.status,
                'duration': call.duration,
                'start_time': call.start_time.isoformat() if call.start_time else None,
                'end_time': call.end_time.isoformat() if call.end_time else None,
                'price': call.price,
                'direction': call.direction
            }
            
        except TwilioException as e:
            logger.error(f"Twilio error getting call status: {e}")
            raise TwilioVoiceError(f"Failed to get call status: {e}")
    
    def end_call(self, call_sid: str) -> Dict[str, Any]:
        """
        End an active Twilio call
        
        Args:
            call_sid (str): Twilio call SID
        
        Returns:
            dict: Updated call information
        """
        try:
            call = self.client.calls(call_sid).update(status='completed')
            
            logger.info(f"Twilio call ended: {call_sid}")
            
            return {
                'call_sid': call.sid,
                'status': call.status,
                'end_time': call.end_time.isoformat() if call.end_time else None
            }
            
        except TwilioException as e:
            logger.error(f"Twilio error ending call: {e}")
            raise TwilioVoiceError(f"Failed to end call: {e}")
    
    def get_call_recordings(self, call_sid: str) -> list:
        """
        Get recordings for a specific call (if recording was enabled)
        
        Args:
            call_sid (str): Twilio call SID
        
        Returns:
            list: List of recording information
        """
        try:
            recordings = self.client.recordings.list(call_sid=call_sid)
            
            return [
                {
                    'recording_sid': recording.sid,
                    'duration': recording.duration,
                    'date_created': recording.date_created.isoformat() if recording.date_created else None,
                    'uri': recording.uri
                }
                for recording in recordings
            ]
            
        except TwilioException as e:
            logger.error(f"Twilio error getting recordings: {e}")
            raise TwilioVoiceError(f"Failed to get recordings: {e}")


class SkillSwapVoiceCallManager:
    """High-level manager for SkillSwap voice calls combining Twilio and Ultravox"""
    
    def __init__(self):
        self.twilio_client = TwilioVoiceClient()

    def create_placeholder_call(self, user_phone: str) -> Dict[str, Any]:
        """
        Create a placeholder Twilio call that will be connected to Ultravox

        Args:
            user_phone (str): User's phone number

        Returns:
            dict: Call creation result with call_sid
        """
        try:
            # Create a simple TwiML that plays hold music while connecting to Ultravox
            twiml = '''<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Say voice="alice">Please hold while we connect you to your SkillSwap assistant.</Say>
                <Play loop="10">https://com-twilio-sounds-music.s3.amazonaws.com/MARKOVICHAMP-Borghestral.wav</Play>
            </Response>'''

            # Create the call
            call = self.twilio_client.client.calls.create(
                twiml=twiml,
                to=user_phone,
                from_=self.twilio_client.phone_number,
                timeout=30,
                record=False
            )

            logger.info(f"Placeholder Twilio call created: {call.sid}")

            return {
                'success': True,
                'call_sid': call.sid,
                'status': call.status
            }

        except Exception as e:
            logger.error(f"Failed to create placeholder call: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def connect_to_ultravox(self, twilio_call_sid: str, ultravox_join_url: str) -> Dict[str, Any]:
        """
        Connect an existing Twilio call to Ultravox

        Args:
            twilio_call_sid (str): Existing Twilio call SID
            ultravox_join_url (str): Ultravox WebSocket URL to connect to

        Returns:
            dict: Connection result
        """
        try:
            # For Ultravox integration, we need to redirect the call to the Ultravox WebSocket
            # The Ultravox join URL is a WebSocket URL that Twilio can connect to
            twiml = f'''<?xml version="1.0" encoding="UTF-8"?>
            <Response>
                <Connect>
                    <Stream url="{ultravox_join_url.replace('wss://', 'ws://')}" />
                </Connect>
            </Response>'''

            # Update the call to use the new TwiML
            call = self.twilio_client.client.calls(twilio_call_sid).update(
                twiml=twiml
            )

            logger.info(f"Twilio call {twilio_call_sid} connected to Ultravox at {ultravox_join_url}")

            return {
                'success': True,
                'call_sid': call.sid,
                'status': call.status
            }

        except Exception as e:
            logger.error(f"Failed to connect call to Ultravox: {e}")
            return {
                'success': False,
                'error': str(e)
            }

    def cancel_call(self, call_sid: str) -> Dict[str, Any]:
        """
        Cancel/end a Twilio call

        Args:
            call_sid (str): Twilio call SID to cancel

        Returns:
            dict: Cancellation result
        """
        try:
            call = self.twilio_client.client.calls(call_sid).update(status='completed')
            logger.info(f"Twilio call {call_sid} cancelled")

            return {
                'success': True,
                'call_sid': call.sid,
                'status': call.status
            }

        except Exception as e:
            logger.error(f"Failed to cancel call {call_sid}: {e}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def initiate_skillswap_call(self, user_phone: str, ultravox_join_url: str, 
                               voice_session_id: str) -> Dict[str, Any]:
        """
        Initiate a complete SkillSwap voice call
        
        Args:
            user_phone (str): User's phone number
            ultravox_join_url (str): Ultravox join URL
            voice_session_id (str): SkillSwap voice session ID
        
        Returns:
            dict: Complete call information
        """
        try:
            # Create webhook URL for call status updates
            webhook_url = self._get_webhook_url(voice_session_id)
            
            # Initiate the Twilio call
            call_info = self.twilio_client.initiate_call(
                to_number=user_phone,
                ultravox_join_url=ultravox_join_url,
                webhook_url=webhook_url
            )
            
            logger.info(f"SkillSwap voice call initiated for session {voice_session_id}")
            
            return {
                'success': True,
                'call_sid': call_info['call_sid'],
                'status': call_info['status'],
                'ultravox_join_url': ultravox_join_url,
                'voice_session_id': voice_session_id,
                'message': 'Call initiated successfully. You should receive a call shortly.'
            }
            
        except Exception as e:
            logger.error(f"Failed to initiate SkillSwap call: {e}")
            return {
                'success': False,
                'error': str(e),
                'message': 'Failed to initiate call. Please try again.'
            }
    
    def handle_call_status_update(self, call_sid: str, status: str, 
                                 voice_session_id: str) -> None:
        """
        Handle Twilio call status updates via webhook
        
        Args:
            call_sid (str): Twilio call SID
            status (str): New call status
            voice_session_id (str): SkillSwap voice session ID
        """
        try:
            from .models import VoiceSession
            
            # Update the voice session status
            voice_session = VoiceSession.objects.get(session_id=voice_session_id)
            
            if status == 'answered':
                voice_session.mark_started()
                logger.info(f"Voice session {voice_session_id} started (call answered)")
            
            elif status in ['completed', 'busy', 'no-answer', 'failed', 'canceled']:
                voice_session.mark_completed()
                logger.info(f"Voice session {voice_session_id} completed with status: {status}")
            
            # Log the status update
            voice_session.add_conversation_data('call_status_updates', {
                'timestamp': str(timezone.now()),
                'status': status,
                'call_sid': call_sid
            })
            
        except Exception as e:
            logger.error(f"Error handling call status update: {e}")
    
    def get_call_summary(self, call_sid: str) -> Dict[str, Any]:
        """
        Get a comprehensive summary of a completed call
        
        Args:
            call_sid (str): Twilio call SID
        
        Returns:
            dict: Call summary with duration, cost, and status
        """
        try:
            call_status = self.twilio_client.get_call_status(call_sid)
            recordings = self.twilio_client.get_call_recordings(call_sid)
            
            return {
                'call_sid': call_sid,
                'status': call_status['status'],
                'duration_seconds': call_status['duration'],
                'cost': call_status['price'],
                'start_time': call_status['start_time'],
                'end_time': call_status['end_time'],
                'recordings_count': len(recordings),
                'recordings': recordings
            }
            
        except Exception as e:
            logger.error(f"Error getting call summary: {e}")
            return {'error': str(e)}
    
    def _get_webhook_url(self, voice_session_id: str) -> str:
        """
        Generate webhook URL for call status updates
        
        Args:
            voice_session_id (str): Voice session ID
        
        Returns:
            str: Webhook URL
        """
        base_url = getattr(settings, 'BASE_URL', 'http://127.0.0.1:8000')
        return f"{base_url}/api/voice-ai/webhook/call-status/{voice_session_id}/"


class TwilioVoiceError(Exception):
    """Custom exception for Twilio voice errors"""
    pass


# Utility functions
def validate_phone_number(phone_number: str) -> bool:
    """
    Validate phone number format for Twilio

    Args:
        phone_number (str): Phone number to validate

    Returns:
        bool: True if valid, False otherwise
    """
    import re

    # Enhanced international phone number validation
    # Pattern explanation:
    # ^\+ - Must start with +
    # (?:[1-9]\d{0,3}) - Country code: 1-4 digits, first digit 1-9
    # \d{6,14} - Phone number: 6-14 digits
    pattern = r'^\+(?:[1-9]\d{0,3})\d{6,14}$'

    if not re.match(pattern, phone_number):
        return False

    # Additional length validation
    if len(phone_number) < 10 or len(phone_number) > 17:
        return False

    # Specific validation for Indian numbers (+91XXXXXXXXXX)
    if phone_number.startswith('+91'):
        return len(phone_number) == 13

    return True


def format_phone_number(phone_number: str) -> str:
    """
    Format phone number for Twilio (ensure it starts with +)

    Args:
        phone_number (str): Raw phone number

    Returns:
        str: Formatted phone number
    """
    import re

    # Remove any non-digit characters except +
    cleaned = re.sub(r'[^\d+]', '', phone_number)

    # Add + if not present
    if not cleaned.startswith('+'):
        # Handle common Indian number formats
        if cleaned.startswith('91') and len(cleaned) == 12:
            # 91XXXXXXXXXX -> +91XXXXXXXXXX
            cleaned = '+' + cleaned
        elif len(cleaned) == 10:
            # Assume it's a local number that needs country code
            # This is risky - in production, you'd want to know the user's country
            # For now, we'll require the full international format
            pass
        else:
            cleaned = '+' + cleaned

    return cleaned


def estimate_call_cost(duration_seconds: int, country_code: str = 'US') -> float:
    """
    Estimate the cost of a Twilio call
    
    Args:
        duration_seconds (int): Call duration in seconds
        country_code (str): Country code for pricing
    
    Returns:
        float: Estimated cost in USD
    """
    # Basic cost estimation (actual costs may vary)
    # These are approximate Twilio rates as of 2024
    rates_per_minute = {
        'US': 0.0085,
        'CA': 0.0085,
        'GB': 0.0240,
        'AU': 0.0450,
        'IN': 0.0120,
        'default': 0.0200
    }
    
    rate = rates_per_minute.get(country_code, rates_per_minute['default'])
    duration_minutes = duration_seconds / 60
    
    return round(duration_minutes * rate, 4)
