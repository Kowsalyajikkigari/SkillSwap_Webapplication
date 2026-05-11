from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes
from django_filters.rest_framework import DjangoFilterBackend
from django.shortcuts import get_object_or_404
from django.db import models
from django.utils import timezone
from datetime import datetime, timedelta
from .models import Session, SessionRequest, SessionFeedback
from .serializers import SessionSerializer, SessionRequestSerializer, SessionFeedbackSerializer
from .availability import UserAvailability, AvailabilityException, availability_manager
from users.models import Profile


class SessionRequestViewSet(viewsets.ModelViewSet):
    """ViewSet for session requests."""
    
    serializer_class = SessionRequestSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['status', 'skill', 'session_type']
    
    def get_queryset(self):
        """Return requests for the current user."""
        user = self.request.user
        return SessionRequest.objects.filter(requester=user) | SessionRequest.objects.filter(provider=user)
    
    def perform_create(self, serializer):
        """Save the requester when creating a request."""
        serializer.save(requester=self.request.user)
    
    @action(detail=True, methods=['post'])
    def accept(self, request, pk=None):
        """Accept a session request."""
        session_request = self.get_object()
        
        # Check if the user is the provider
        if request.user != session_request.provider:
            return Response(
                {"detail": "Only the provider can accept this request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the request is pending
        if session_request.status != 'pending':
            return Response(
                {"detail": f"Cannot accept a request with status '{session_request.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request status
        session_request.status = 'accepted'
        session_request.save()
        
        # Create a new session
        session = Session.objects.create(
            requester=session_request.requester,
            provider=session_request.provider,
            skill=session_request.skill,
            title=f"{session_request.skill.name} Session",
            description=session_request.message,
            date=session_request.proposed_date,
            start_time=session_request.proposed_time,
            session_type=session_request.session_type,
            location=session_request.location,
            status='confirmed'
        )
        
        return Response({
            "detail": "Request accepted and session created.",
            "session": SessionSerializer(session).data
        })
    
    @action(detail=True, methods=['post'])
    def decline(self, request, pk=None):
        """Decline a session request."""
        session_request = self.get_object()
        
        # Check if the user is the provider
        if request.user != session_request.provider:
            return Response(
                {"detail": "Only the provider can decline this request."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the request is pending
        if session_request.status != 'pending':
            return Response(
                {"detail": f"Cannot decline a request with status '{session_request.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the request status
        session_request.status = 'declined'
        session_request.save()
        
        return Response({"detail": "Request declined."})


class SessionViewSet(viewsets.ModelViewSet):
    """ViewSet for sessions."""
    
    serializer_class = SessionSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    filterset_fields = ['status', 'skill', 'session_type', 'date']
    
    def get_queryset(self):
        """Return sessions for the current user."""
        user = self.request.user
        return Session.objects.filter(requester=user) | Session.objects.filter(provider=user)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark a session as completed."""
        session = self.get_object()
        
        # Check if the user is a participant
        if request.user != session.requester and request.user != session.provider:
            return Response(
                {"detail": "Only session participants can mark it as completed."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the session is confirmed
        if session.status != 'confirmed':
            return Response(
                {"detail": f"Cannot complete a session with status '{session.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the session status
        session.status = 'completed'
        session.save()
        
        # Update user profiles
        requester_profile = Profile.objects.get(user=session.requester)
        provider_profile = Profile.objects.get(user=session.provider)
        
        requester_profile.sessions_completed += 1
        provider_profile.sessions_completed += 1
        
        requester_profile.points += 10
        provider_profile.points += 10
        
        requester_profile.save()
        provider_profile.save()
        
        return Response({"detail": "Session marked as completed."})

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming sessions for the current user."""
        from django.utils import timezone
        from datetime import timedelta

        user = request.user
        now = timezone.now()

        # Get sessions that are confirmed and scheduled for the future
        upcoming_sessions = Session.objects.filter(
            (models.Q(requester=user) | models.Q(provider=user)),
            status='confirmed',
            date__gte=now
        ).order_by('date')[:10]  # Limit to 10 upcoming sessions

        serializer = self.get_serializer(upcoming_sessions, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancel a session."""
        session = self.get_object()
        
        # Check if the user is a participant
        if request.user != session.requester and request.user != session.provider:
            return Response(
                {"detail": "Only session participants can cancel it."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Check if the session can be cancelled
        if session.status not in ['pending', 'confirmed']:
            return Response(
                {"detail": f"Cannot cancel a session with status '{session.status}'."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update the session status
        session.status = 'cancelled'
        session.save()
        
        return Response({"detail": "Session cancelled."})


class SessionFeedbackViewSet(viewsets.ModelViewSet):
    """ViewSet for session feedback."""
    
    serializer_class = SessionFeedbackSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Return feedback for the current user."""
        user = self.request.user
        return SessionFeedback.objects.filter(user=user) | SessionFeedback.objects.filter(recipient=user)
    
    def perform_create(self, serializer):
        """Save the user when creating feedback."""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def for_session(self, request):
        """Get feedback for a specific session."""
        session_id = request.query_params.get('session_id')
        if not session_id:
            return Response(
                {"detail": "session_id query parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        session = get_object_or_404(Session, id=session_id)
        
        # Check if the user is a participant
        if request.user != session.requester and request.user != session.provider:
            return Response(
                {"detail": "You can only view feedback for sessions you participated in."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        feedback = SessionFeedback.objects.filter(session=session)
        serializer = self.get_serializer(feedback, many=True)
        
        return Response(serializer.data)


class UserAvailabilityView(APIView):
    """View for managing user availability"""

    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get user's availability schedule"""
        try:
            user = request.user
            start_date = request.GET.get('start_date')
            end_date = request.GET.get('end_date')

            # Default to next 30 days if no dates provided
            if not start_date:
                start_date = timezone.now()
            else:
                start_date = datetime.fromisoformat(start_date)

            if not end_date:
                end_date = start_date + timedelta(days=30)
            else:
                end_date = datetime.fromisoformat(end_date)

            availability_data = availability_manager.get_user_availability(
                user, start_date, end_date
            )

            return Response(availability_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Failed to get availability: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def post(self, request):
        """Set user availability"""
        try:
            user = request.user
            availability_data = request.data

            # Clear existing availability
            UserAvailability.objects.filter(user=user).delete()

            # Create new availability entries
            for entry in availability_data.get('schedule', []):
                UserAvailability.objects.create(
                    user=user,
                    weekday=entry['weekday'],
                    start_time=entry['start_time'],
                    end_time=entry['end_time'],
                    is_available=entry.get('is_available', True),
                    timezone=entry.get('timezone', 'UTC')
                )

            return Response(
                {'message': 'Availability updated successfully'},
                status=status.HTTP_200_OK
            )

        except Exception as e:
            return Response(
                {'error': f'Failed to update availability: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class AvailabilityCheckView(APIView):
    """View for checking slot availability"""

    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        """Check if a specific time slot is available"""
        try:
            user_id = request.data.get('user_id')
            date_str = request.data.get('date')
            start_time_str = request.data.get('start_time')
            duration = request.data.get('duration_minutes', 60)

            if not all([user_id, date_str, start_time_str]):
                return Response(
                    {'error': 'user_id, date, and start_time are required'},
                    status=status.HTTP_400_BAD_REQUEST
                )

            from django.contrib.auth import get_user_model
            User = get_user_model()
            target_user = get_object_or_404(User, id=user_id)

            # Parse date and time
            date = datetime.fromisoformat(date_str)
            start_time = datetime.strptime(start_time_str, '%H:%M').time()

            # Check availability
            is_available = availability_manager.check_slot_availability(
                target_user, date, start_time, duration
            )

            response_data = {
                'available': is_available,
                'user_id': user_id,
                'date': date_str,
                'start_time': start_time_str,
                'duration_minutes': duration
            }

            # If not available, suggest alternatives
            if not is_available:
                alternatives = availability_manager.suggest_alternative_slots(
                    target_user, date, duration
                )
                response_data['alternatives'] = alternatives[:5]  # Top 5 suggestions

            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {'error': f'Failed to check availability: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



