from django.db import models
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.utils.translation import gettext_lazy as _


class UserManager(BaseUserManager):
    """Define a model manager for User model with no username field."""

    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        """Create and save a User with the given email and password."""
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email, password=None, **extra_fields):
        """Create and save a regular User with the given email and password."""
        extra_fields.setdefault('is_staff', False)
        extra_fields.setdefault('is_superuser', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        """Create and save a SuperUser with the given email and password."""
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self._create_user(email, password, **extra_fields)


class User(AbstractUser):
    """Custom User model with email as the unique identifier."""

    username = None
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(_('first name'), max_length=150)
    last_name = models.CharField(_('last name'), max_length=150)
    # Remove avatar from User model - it will be in Profile model only
    bio = models.TextField(blank=True)
    location = models.CharField(max_length=100, blank=True)
    member_since = models.DateTimeField(auto_now_add=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']

    objects = UserManager()

    def __str__(self):
        return self.email

    @property
    def avatar(self):
        """Get avatar from profile"""
        try:
            return self.profile.avatar if self.profile.avatar else None
        except (Profile.DoesNotExist, AttributeError):
            return None

    @property
    def avatar_url(self):
        """Get avatar URL with fallback"""
        try:
            if self.profile.avatar:
                return self.profile.avatar.url
        except (Profile.DoesNotExist, AttributeError):
            pass
        return None


class Profile(models.Model):
    """Extended profile information for users."""

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')

    # Essential profile information for onboarding
    bio = models.TextField(blank=True, null=True, help_text="Tell us about yourself")
    location = models.CharField(max_length=100, blank=True, null=True, help_text="Your city or location")
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, help_text="Profile picture")

    # Gamification fields
    level = models.IntegerField(default=1)
    points = models.IntegerField(default=0)
    sessions_completed = models.IntegerField(default=0)
    average_rating = models.DecimalField(max_digits=3, decimal_places=2, default=0.0)
    
    # Availability preferences
    availability = models.TextField(blank=True, null=True, help_text="Describe your availability and preferences")
    available_weekdays = models.BooleanField(default=True)
    available_weekends = models.BooleanField(default=True)
    available_mornings = models.BooleanField(default=False)
    available_afternoons = models.BooleanField(default=True)
    available_evenings = models.BooleanField(default=True)
    
    # Exchange preferences
    virtual_exchanges = models.BooleanField(default=True)
    in_person_exchanges = models.BooleanField(default=True)
    
    # Privacy settings
    show_email = models.BooleanField(default=False)
    show_phone = models.BooleanField(default=False)
    profile_visibility = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.email}'s Profile"

    def is_basic_info_complete(self):
        """Check if basic profile information is complete"""
        return all([
            self.user.first_name and self.user.first_name.strip(),
            self.user.last_name and self.user.last_name.strip(),
            self.bio and self.bio.strip(),
            self.location and self.location.strip(),
        ])

    def has_teaching_skills(self):
        """Check if user has teaching skills"""
        return self.user.teaching_skills.exists()

    def has_learning_skills(self):
        """Check if user has learning skills"""
        return self.user.learning_skills.exists()

    def get_completion_percentage(self):
        """Calculate profile completion percentage"""
        required_steps = [
            self.is_basic_info_complete(),
            self.has_teaching_skills(),
            self.has_learning_skills(),
        ]
        completed_steps = sum(required_steps)
        return int((completed_steps / len(required_steps)) * 100)

    def is_complete(self):
        """Check if profile is complete"""
        return self.get_completion_percentage() >= 100
