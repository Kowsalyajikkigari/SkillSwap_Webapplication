from django.db import models
from django.contrib.auth import get_user_model
from skills.models import Skill

User = get_user_model()


class Session(models.Model):
    """Model for skill exchange sessions."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
    ]
    
    TYPE_CHOICES = [
        ('virtual', 'Virtual'),
        ('in_person', 'In-Person'),
    ]
    
    # Participants
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='requested_sessions')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='provided_sessions')
    
    # Session details
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='sessions')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Scheduling
    date = models.DateField(null=True, blank=True)
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    duration_minutes = models.PositiveIntegerField(default=60)
    
    # Location
    session_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='virtual')
    location = models.CharField(max_length=200, blank=True)
    meeting_link = models.URLField(blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.skill.name} session between {self.requester.email} and {self.provider.email}"


class SessionRequest(models.Model):
    """Model for session requests."""
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('accepted', 'Accepted'),
        ('declined', 'Declined'),
    ]
    
    TYPE_CHOICES = [
        ('virtual', 'Virtual'),
        ('in_person', 'In-Person'),
    ]
    
    # Participants
    requester = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_requests')
    provider = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_requests')
    
    # Request details
    skill = models.ForeignKey(Skill, on_delete=models.CASCADE, related_name='requests')
    message = models.TextField()
    
    # Proposed scheduling
    proposed_date = models.DateField(null=True, blank=True)
    proposed_time = models.TimeField(null=True, blank=True)
    
    # Preferences
    session_type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='virtual')
    location = models.CharField(max_length=200, blank=True)
    
    # Status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Request from {self.requester.email} to {self.provider.email} for {self.skill.name}"


class SessionFeedback(models.Model):
    """Model for session feedback."""
    
    session = models.ForeignKey(Session, on_delete=models.CASCADE, related_name='feedback')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='given_feedback')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_feedback')
    
    rating = models.PositiveSmallIntegerField(choices=[(i, i) for i in range(1, 6)])
    comment = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['session', 'user']
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Feedback from {self.user.email} for session {self.session.id}"
