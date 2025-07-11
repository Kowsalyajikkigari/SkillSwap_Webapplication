from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
# from django_ratelimit.decorators import ratelimit
# from django.utils.decorators import method_decorator
from .serializers import (
    UserSerializer,
    ProfileSerializer,
    UserProfileSerializer,
    RegisterSerializer,
    CustomTokenObtainPairSerializer,
    PasswordResetSerializer,
    PasswordResetConfirmSerializer
)
from .models import Profile
from utils.error_handlers import handle_api_error, ValidationError, AuthenticationError, NotFoundError
from utils.validators import input_validator
import logging

User = get_user_model()
logger = logging.getLogger('swapskill')


# @method_decorator(ratelimit(key='ip', rate='3/m', method='POST', block=True), name='post')
class RegisterView(generics.CreateAPIView):
    """View for user registration."""
    
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer
    
    @handle_api_error
    def post(self, request, *args, **kwargs):
        """Create a new user account with comprehensive validation."""
        try:
            logger.info(f"Registration attempt with data: {request.data}")
            # Validate input data
            email = input_validator.validate_email(request.data.get('email'))
            password = input_validator.validate_string(
                request.data.get('password'), 'password', min_length=8, max_length=128
            )
            first_name = input_validator.validate_string(
                request.data.get('first_name'), 'first_name', min_length=1, max_length=30
            )
            last_name = input_validator.validate_string(
                request.data.get('last_name'), 'last_name', min_length=1, max_length=30
            )

            # Check if user already exists
            if User.objects.filter(email=email).exists():
                raise ValidationError("User with this email already exists")

            # Get password confirmation
            password2 = input_validator.validate_string(
                request.data.get('password2'), 'password2', min_length=8, max_length=128
            )

            # Validate password confirmation
            if password != password2:
                raise ValidationError("Passwords do not match")

            # Create user with validated data
            validated_data = {
                'email': email,
                'password': password,
                'password2': password2,
                'first_name': first_name,
                'last_name': last_name
            }

            serializer = self.get_serializer(data=validated_data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            logger.info(f"New user registered: {user.email}")

            return Response({
                'success': True,
                'message': 'Account created successfully. Please log in to continue.',
                'user': {
                    'id': user.id,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            }, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            logger.error(f"Registration validation error: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            raise ValidationError("Registration failed. Please check your input and try again.")


# @method_decorator(ratelimit(key='ip', rate='5/m', method='POST', block=True), name='post')
class CustomTokenObtainPairView(TokenObtainPairView):
    """Custom token view to include user data in response."""
    
    serializer_class = CustomTokenObtainPairSerializer


class LogoutView(APIView):
    """View for user logout."""
    
    permission_classes = (permissions.IsAuthenticated,)
    
    def post(self, request):
        try:
            refresh_token = request.data["refresh"]
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response(status=status.HTTP_205_RESET_CONTENT)
        except Exception as e:
            return Response(status=status.HTTP_400_BAD_REQUEST)


class UserDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user details."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


class AllUsersView(generics.ListAPIView):
    """View for retrieving all users with their profiles."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        # Return all users except the current user
        return User.objects.exclude(id=self.request.user.id).select_related('profile')


class PublicUsersView(generics.ListAPIView):
    """Public view for retrieving users for session scheduling (no auth required)."""

    permission_classes = ()  # No authentication required
    serializer_class = UserProfileSerializer

    def get_queryset(self):
        # Return all users with profiles for session scheduling
        return User.objects.filter(profile__isnull=False).select_related('profile')


class UserProfileView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating user profile."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserProfileSerializer

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        """Enhanced update method with proper avatar handling."""
        print(f"🔄 UserProfileView.update called")
        print(f"📋 Request data: {request.data}")
        print(f"📁 Request files: {request.FILES}")

        user = self.get_object()

        # Ensure user has a profile
        profile, created = Profile.objects.get_or_create(user=user)
        if created:
            print(f"✅ Created new profile for user: {user.email}")

        # Handle avatar upload specifically
        if 'avatar' in request.FILES:
            avatar_file = request.FILES['avatar']
            print(f"📸 Avatar file received:")
            print(f"  - Name: {avatar_file.name}")
            print(f"  - Size: {avatar_file.size}")
            print(f"  - Content type: {avatar_file.content_type}")

            # Validate file
            if not avatar_file.content_type.startswith('image/'):
                return Response(
                    {'avatar': ['File must be an image.']},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Save avatar to profile
            profile.avatar = avatar_file
            profile.save()
            print(f"✅ Avatar saved to profile: {profile.avatar.url}")

        # Handle other profile fields
        profile_fields = ['bio', 'location', 'availability']
        profile_data = {}
        user_data = {}

        for field, value in request.data.items():
            if field in profile_fields:
                profile_data[field] = value
            elif field in ['first_name', 'last_name']:
                user_data[field] = value

        # Update profile fields
        if profile_data:
            for field, value in profile_data.items():
                setattr(profile, field, value)
            profile.save()
            print(f"✅ Profile updated: {profile_data}")

        # Update user fields
        if user_data:
            for field, value in user_data.items():
                setattr(user, field, value)
            user.save()
            print(f"✅ User updated: {user_data}")

        # Return updated data
        serializer = self.get_serializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)


class ProfileDetailView(generics.RetrieveUpdateAPIView):
    """View for retrieving and updating profile details."""

    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = ProfileSerializer

    def get_object(self):
        return self.request.user.profile


class ProfileCompletionStatusView(APIView):
    """View for checking user profile completion status."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user

        # Get or create profile
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            # Create profile if it doesn't exist
            profile = Profile.objects.create(user=user)

        # Use model methods for completion checking
        basic_info_complete = profile.is_basic_info_complete()
        has_teaching_skills = profile.has_teaching_skills()
        has_learning_skills = profile.has_learning_skills()
        has_availability = bool(profile.availability and profile.availability.strip())

        # Define completion steps
        completion_steps = {
            'basic_info': basic_info_complete,
            'teaching_skills': has_teaching_skills,
            'learning_goals': has_learning_skills,
            'availability': has_availability,
        }

        # Calculate completion
        completed_steps = [step for step, is_complete in completion_steps.items() if is_complete]

        # Required steps for profile completion (availability is optional)
        required_steps = ['basic_info', 'teaching_skills', 'learning_goals']
        completed_required_steps = [step for step in completed_steps if step in required_steps]

        completion_percentage = profile.get_completion_percentage()
        is_complete = profile.is_complete()

        # Detailed missing fields for debugging
        missing_fields = []
        if not basic_info_complete:
            if not (user.first_name and user.first_name.strip()):
                missing_fields.append('first_name')
            if not (user.last_name and user.last_name.strip()):
                missing_fields.append('last_name')
            if not (profile.bio and profile.bio.strip()):
                missing_fields.append('bio')
            if not (profile.location and profile.location.strip()):
                missing_fields.append('location')
        if not has_teaching_skills:
            missing_fields.append('teaching_skills')
        if not has_learning_skills:
            missing_fields.append('learning_skills')

        # Determine next step
        all_steps = ['basic_info', 'teaching_skills', 'learning_goals', 'availability']
        next_step = None
        for step in all_steps:
            if step not in completed_steps:
                next_step = step
                break

        return Response({
            'is_complete': is_complete,
            'completion_percentage': completion_percentage,
            'completed_steps': completed_steps,
            'missing_fields': missing_fields,
            'next_step': next_step,
            'required_steps': all_steps,
            'profile_data': {
                'bio': profile.bio or '',
                'location': profile.location or '',
                'avatar': profile.avatar.url if profile.avatar else None,
                'first_name': user.first_name or '',
                'last_name': user.last_name or '',
            }
        }, status=status.HTTP_200_OK)


class PasswordResetView(APIView):
    """View for requesting password reset."""

    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "If an account with that email exists, we've sent you a password reset link."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """View for confirming password reset."""

    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "Password has been reset successfully."},
                status=status.HTTP_200_OK
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DashboardStatsView(APIView):
    """View for getting user dashboard statistics."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        
        # Get or create profile
        try:
            profile = user.profile
        except Profile.DoesNotExist:
            profile = Profile.objects.create(user=user)

        # Get teaching skills count
        teaching_skills_count = getattr(user, 'teaching_skills', None)
        teaching_skills_count = teaching_skills_count.count() if teaching_skills_count else 0

        # Get learning skills count
        learning_skills_count = getattr(user, 'learning_skills', None)
        learning_skills_count = learning_skills_count.count() if learning_skills_count else 0

        # Get sessions data (if skill_sessions app is available)
        try:
            from skill_sessions.models import SkillSession
            completed_sessions = SkillSession.objects.filter(
                participants=user, 
                status='completed'
            ).count()
            total_sessions = SkillSession.objects.filter(participants=user).count()
            pending_sessions = SkillSession.objects.filter(
                participants=user, 
                status='pending'
            ).count()
        except ImportError:
            completed_sessions = 0
            total_sessions = 0
            pending_sessions = 0

        # Get messages count (if chat_messages app is available)
        try:
            from chat_messages.models import Conversation
            conversations_count = Conversation.objects.filter(participants=user).count()
        except ImportError:
            conversations_count = 0

        # Calculate level and progress
        points = profile.points
        level = profile.level
        next_level_points = level * 250  # Simple level calculation
        progress_to_next_level = min((points % 250) / 250 * 100, 100)

        stats = {
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'avatar': profile.avatar.url if profile.avatar else None,
                'bio': profile.bio or '',
                'location': profile.location or '',
                'member_since': user.date_joined.strftime('%B %Y'),
            },
            'profile': {
                'level': level,
                'points': points,
                'next_level_points': next_level_points,
                'progress_to_next_level': progress_to_next_level,
                'average_rating': float(profile.average_rating),
                'sessions_completed': profile.sessions_completed,
            },
            'skills': {
                'teaching_count': teaching_skills_count,
                'learning_count': learning_skills_count,
            },
            'sessions': {
                'completed': completed_sessions,
                'total': total_sessions,
                'pending': pending_sessions,
            },
            'activity': {
                'conversations': conversations_count,
                'hours_exchanged': completed_sessions * 1.5,  # Estimate
            }
        }

        return Response(stats, status=status.HTTP_200_OK)


class RecommendedUsersView(APIView):
    """View for getting recommended users using enhanced matching algorithm."""

    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        """Get recommended users based on advanced skill compatibility matching."""
        try:
            logger.info(f"Fetching recommended users for: {request.user.email}")
            from skills.matching_algorithm import skill_matcher

            current_user = request.user

            # Use enhanced matching algorithm for better recommendations
            logger.info("Finding teachers...")
            recommended_teachers = skill_matcher.find_teachers_for_user(current_user, limit=10)
            logger.info(f"Found {len(recommended_teachers)} teachers.")

            logger.info("Finding students...")
            recommended_students = skill_matcher.find_students_for_user(current_user, limit=10)
            logger.info(f"Found {len(recommended_students)} students.")

            response_data = {
                'teachers': recommended_teachers,
                'students': recommended_students,
                'algorithm_version': '2.0',  # Enhanced algorithm indicator
                'total_teachers': len(recommended_teachers),
                'total_students': len(recommended_students),
                'matching_factors': [
                    'skill_overlap',
                    'level_compatibility',
                    'location_proximity',
                    'rating_quality',
                    'activity_level'
                ]
            }
            logger.info("Successfully fetched recommended users.")
            return Response(response_data, status=status.HTTP_200_OK)

        except Exception as e:
            logger.error(f"Error fetching recommended users: {str(e)}", exc_info=True)
            return Response(
                {'error': f'Failed to fetch recommended users: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
