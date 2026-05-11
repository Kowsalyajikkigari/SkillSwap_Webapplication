from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
import uuid
import logging

from .models import VoiceSession
from .serializers import (
    VoiceSessionSerializer, VoiceInteractionSerializer, VoiceSessionResultSerializer,
    InitiateVoiceCallSerializer, VoiceSessionSummarySerializer
)
from .ultravox_client import SkillSwapVoiceAI, prepare_user_context
from .twilio_client import SkillSwapVoiceCallManager, validate_phone_number, format_phone_number

logger = logging.getLogger(__name__)


class VoiceSettingsView(APIView):
    """API endpoint to manage voice AI settings for users"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get voice settings for the authenticated user"""
        user = request.user

        # Get user's profile to check for phone number
        phone_number = None
        if hasattr(user, 'profile'):
            # For now, use a default phone number since Profile model doesn't have phone field
            # In production, you might want to add a phone field to Profile model
            phone_number = getattr(user.profile, 'phone', None)

        # Default voice settings
        settings = {
            'phone_number': phone_number,
            'preferred_voice': 'default',
            'auto_answer': False,
            'notifications_enabled': True,
            'call_history_retention': 30
        }

        return Response(settings)

    def patch(self, request):
        """Update voice settings for the authenticated user"""
        user = request.user

        # For now, we'll just return the updated settings
        # In a full implementation, you'd save these to a UserVoiceSettings model
        updated_settings = {
            'phone_number': request.data.get('phone_number'),
            'preferred_voice': request.data.get('preferred_voice', 'default'),
            'auto_answer': request.data.get('auto_answer', False),
            'notifications_enabled': request.data.get('notifications_enabled', True),
            'call_history_retention': request.data.get('call_history_retention', 30)
        }

        # If phone number is provided, you could save it to user profile
        # Note: Profile model doesn't currently have a phone field
        # In production, you might want to add a phone field to Profile model
        if updated_settings['phone_number'] and hasattr(user, 'profile'):
            # For now, we'll just return the settings without saving
            # setattr(user.profile, 'phone', updated_settings['phone_number'])
            # user.profile.save()
            pass

        return Response(updated_settings)


class InitiateVoiceCallView(APIView):
    """API endpoint to initiate voice AI calls for SkillSwap users"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Initiate a new voice call for the authenticated user"""
        try:
            serializer = InitiateVoiceCallSerializer(data=request.data)

            if not serializer.is_valid():
                logger.error(f"Invalid voice call request data: {serializer.errors}")
                return Response(
                    {'error': 'Invalid request data', 'details': serializer.errors},
                    status=status.HTTP_400_BAD_REQUEST
                )

            user = request.user
            phone_number = format_phone_number(serializer.validated_data['phone_number'])
            session_type = serializer.validated_data['session_type']
            context_data = serializer.validated_data.get('context_data', {})

            logger.info(f"Voice call request from user {user.id}: {session_type} to {phone_number}")

        except Exception as e:
            logger.error(f"Error processing voice call request: {e}")
            return Response(
                {'error': 'Failed to process request', 'message': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        # Validate phone number
        if not validate_phone_number(phone_number):
            return Response(
                {'error': 'Invalid phone number format'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check if we're in development mode (check if external services are configured)
        from django.conf import settings
        development_mode = getattr(settings, 'DEBUG', False) and not all([
            getattr(settings, 'TWILIO_ACCOUNT_SID', None),
            getattr(settings, 'TWILIO_AUTH_TOKEN', None),
            getattr(settings, 'ULTRAVOX_API_KEY', None)
        ])

        # Override: Since API keys are configured, disable development mode for real calls
        development_mode = False

        if development_mode:
            logger.info("Running in development mode - simulating voice call")
            # Create voice session record
            session_id = f"vs_{uuid.uuid4().hex[:12]}"
            voice_session = VoiceSession.objects.create(
                user=user,
                session_id=session_id,
                phone_number=phone_number,
                session_type=session_type,
                conversation_data=context_data,
                status='simulated'
            )

            return Response({
                'success': True,
                'session_id': session_id,
                'call_sid': f'simulated_{session_id[:8]}',
                'message': 'Voice call simulated successfully (development mode). In production, you would receive a real call.',
                'session_type': session_type,
                'development_mode': True
            }, status=status.HTTP_201_CREATED)

        try:
            # Create voice session record
            session_id = f"vs_{uuid.uuid4().hex[:12]}"
            voice_session = VoiceSession.objects.create(
                user=user,
                session_id=session_id,
                phone_number=phone_number,
                session_type=session_type,
                conversation_data=context_data
            )

            # Prepare user context for AI (optimized for faster processing)
            logger.info(f"Preparing user context for {session_type} session")
            user_context = prepare_user_context(user, session_type)
            user_context.update(context_data)

            # Create Ultravox call first (it will handle Twilio integration)
            logger.info(f"Creating Ultravox call for session type: {session_type}")
            voice_ai = SkillSwapVoiceAI()

            try:
                if session_type == 'skill_discovery':
                    ultravox_response = voice_ai.create_skill_discovery_call(user_context)
                elif session_type == 'availability_check':
                    ultravox_response = voice_ai.create_availability_check_call(user_context)
                elif session_type == 'session_booking':
                    ultravox_response = voice_ai.create_session_booking_call(user_context)
                elif session_type == 'session_management':
                    ultravox_response = voice_ai.create_session_management_call(user_context)
                else:
                    ultravox_response = voice_ai.create_general_inquiry_call(user_context)

                logger.info(f"Ultravox call created successfully: {ultravox_response.get('callId')}")
            except Exception as e:
                logger.error(f"Failed to create Ultravox call: {e}")
                voice_session.status = 'failed'
                voice_session.save()
                return Response({
                    'success': False,
                    'error': 'Failed to create voice AI session',
                    'message': 'Unable to initialize voice AI. Please try again.'
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

            # Store Ultravox call ID
            voice_session.ultravox_call_id = ultravox_response.get('callId')
            voice_session.status = 'connecting'
            voice_session.save()

            # Initiate Twilio call using Ultravox join URL
            logger.info(f"Initiating Twilio call for session {session_id}")
            call_manager = SkillSwapVoiceCallManager()
            call_result = call_manager.initiate_skillswap_call(
                user_phone=phone_number,
                ultravox_join_url=ultravox_response.get('joinUrl'),
                voice_session_id=session_id
            )

            if call_result['success']:
                # Update voice session with call SID
                voice_session.call_sid = call_result['call_sid']
                voice_session.status = 'active'
                voice_session.save()

                logger.info(f"Voice call initiated successfully for user {user.id}, session {session_id}")

                return Response({
                    'success': True,
                    'session_id': session_id,
                    'call_sid': call_result['call_sid'],
                    'ultravox_call_id': ultravox_response.get('callId'),
                    'message': 'Voice call initiated successfully. You should receive a call shortly.',
                    'session_type': session_type
                }, status=status.HTTP_201_CREATED)
            else:
                # Mark session as failed
                voice_session.status = 'failed'
                voice_session.save()

                return Response({
                    'success': False,
                    'error': call_result.get('error', 'Unknown error'),
                    'message': call_result.get('message', 'Failed to initiate call')
                }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        except Exception as e:
            logger.error(f"Error initiating voice call for user {user.id}: {e}")
            return Response(
                {'error': 'Failed to initiate voice call', 'details': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class VoiceSessionListView(APIView):
    """API endpoint to list voice sessions for the authenticated user"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get voice sessions for the authenticated user"""
        user = request.user
        session_type = request.query_params.get('session_type')
        status_filter = request.query_params.get('status')

        # Build query
        queryset = VoiceSession.objects.filter(user=user)

        if session_type:
            queryset = queryset.filter(session_type=session_type)

        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Paginate results
        page_size = min(int(request.query_params.get('page_size', 20)), 100)
        page = int(request.query_params.get('page', 1))

        start = (page - 1) * page_size
        end = start + page_size

        sessions = queryset[start:end]
        total_count = queryset.count()

        serializer = VoiceSessionSummarySerializer(sessions, many=True)

        return Response({
            'sessions': serializer.data,
            'pagination': {
                'page': page,
                'page_size': page_size,
                'total_count': total_count,
                'has_next': end < total_count
            }
        })


class VoiceSessionDetailView(APIView):
    """API endpoint to get detailed information about a specific voice session"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, session_id):
        """Get detailed information about a voice session"""
        voice_session = get_object_or_404(
            VoiceSession,
            session_id=session_id,
            user=request.user
        )

        # Get session details
        session_serializer = VoiceSessionSerializer(voice_session)

        # Get interactions
        interactions = voice_session.interactions.all()
        interaction_serializer = VoiceInteractionSerializer(interactions, many=True)

        # Get result if available
        result_data = None
        if hasattr(voice_session, 'result'):
            result_serializer = VoiceSessionResultSerializer(voice_session.result)
            result_data = result_serializer.data

        return Response({
            'session': session_serializer.data,
            'interactions': interaction_serializer.data,
            'result': result_data
        })


@method_decorator(csrf_exempt, name='dispatch')
class TwilioWebhookView(APIView):
    """Webhook endpoint for Twilio call status updates"""

    permission_classes = []  # No authentication required for webhooks

    def post(self, request, session_id):
        """Handle Twilio call status updates"""
        try:
            # Get call status data from Twilio
            call_sid = request.data.get('CallSid')
            call_status = request.data.get('CallStatus')

            if not call_sid or not call_status:
                return HttpResponse('Missing required parameters', status=400)

            # Update voice session
            call_manager = SkillSwapVoiceCallManager()
            call_manager.handle_call_status_update(call_sid, call_status, session_id)

            logger.info(f"Webhook processed: {call_sid} -> {call_status}")

            return HttpResponse('OK')

        except Exception as e:
            logger.error(f"Error processing Twilio webhook: {e}")
            return HttpResponse('Error processing webhook', status=500)
