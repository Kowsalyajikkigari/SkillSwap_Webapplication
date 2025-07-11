from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Profile

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model."""
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'avatar', 'bio', 'location')
        read_only_fields = ('id',)

    def get_avatar(self, obj):
        """Get avatar URL from profile."""
        try:
            if obj.profile.avatar:
                return obj.profile.avatar.url
        except (Profile.DoesNotExist, AttributeError):
            pass
        return None


class ProfileSerializer(serializers.ModelSerializer):
    """Serializer for the Profile model."""

    class Meta:
        model = Profile
        fields = '__all__'
        read_only_fields = ('user', 'level', 'points', 'sessions_completed', 'average_rating')


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for User with Profile data."""

    profile = ProfileSerializer(read_only=True)
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'avatar', 'bio', 'location', 'profile')
        read_only_fields = ('id', 'email')  # Email should be read-only for updates

    def get_avatar(self, obj):
        """Get avatar URL from profile."""
        try:
            if obj.profile.avatar:
                return obj.profile.avatar.url
        except (Profile.DoesNotExist, AttributeError):
            pass
        return None

    def update(self, instance, validated_data):
        """Override update to handle profile fields properly."""
        # Update the User instance (excluding avatar since it's read-only)
        user_fields = ['first_name', 'last_name', 'bio', 'location']
        for field in user_fields:
            if field in validated_data:
                setattr(instance, field, validated_data[field])
        instance.save()

        return instance


class RegisterSerializer(serializers.ModelSerializer):
    """Serializer for user registration."""

    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)

    class Meta:
        model = User
        fields = ('email', 'password', 'password2', 'first_name', 'last_name')
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True}
        }

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)

        # Profile is automatically created by signal
        # No need to create it manually here

        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom token serializer to include user data in response."""

    def validate(self, attrs):
        data = super().validate(attrs)

        # Add user data to response
        user = self.user
        data['user'] = {
            'id': user.id,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
        }

        # Get avatar from profile
        try:
            if user.profile.avatar:
                data['user']['avatar'] = user.profile.avatar.url
        except (Profile.DoesNotExist, AttributeError):
            data['user']['avatar'] = None

        return data


class PasswordResetSerializer(serializers.Serializer):
    """Serializer for password reset request."""

    email = serializers.EmailField()

    def validate_email(self, value):
        """Check if user with this email exists."""
        if not User.objects.filter(email=value).exists():
            # Don't reveal if email exists or not for security
            pass
        return value

    def save(self):
        """Send password reset email."""
        email = self.validated_data['email']
        try:
            user = User.objects.get(email=email)

            # Generate reset token
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))

            # Create reset link (you can customize this URL)
            reset_link = f"http://localhost:3001/reset-password/{uid}/{token}/"

            # Send email
            subject = f"{settings.EMAIL_SUBJECT_PREFIX}Password Reset"
            message = f"""
Hello {user.first_name},

You requested a password reset for your SkillSwap account.

Click the link below to reset your password:
{reset_link}

If you didn't request this, please ignore this email.

Best regards,
The SkillSwap Team
            """

            send_mail(
                subject=subject,
                message=message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[email],
                fail_silently=False,
            )

        except User.DoesNotExist:
            # Don't reveal if email exists or not for security
            pass


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer for password reset confirmation."""

    uid = serializers.CharField()
    token = serializers.CharField()
    new_password = serializers.CharField(validators=[validate_password])
    confirm_password = serializers.CharField()

    def validate(self, attrs):
        """Validate password reset token and passwords match."""
        if attrs['new_password'] != attrs['confirm_password']:
            raise serializers.ValidationError({"confirm_password": "Passwords don't match."})

        try:
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            raise serializers.ValidationError({"uid": "Invalid reset link."})

        if not default_token_generator.check_token(user, attrs['token']):
            raise serializers.ValidationError({"token": "Invalid or expired reset link."})

        attrs['user'] = user
        return attrs

    def save(self):
        """Reset the user's password."""
        user = self.validated_data['user']
        user.set_password(self.validated_data['new_password'])
        user.save()
        return user
