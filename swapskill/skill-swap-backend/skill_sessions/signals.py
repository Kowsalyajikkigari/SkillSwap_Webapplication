from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import SessionFeedback
from users.models import Profile


@receiver(post_save, sender=SessionFeedback)
def update_user_rating(sender, instance, created, **kwargs):
    """Update user's average rating when feedback is created or updated."""
    if created or instance.pk:
        # Get all feedback for the recipient
        recipient_feedback = SessionFeedback.objects.filter(recipient=instance.recipient)
        
        # Calculate average rating
        if recipient_feedback.exists():
            total_rating = sum(feedback.rating for feedback in recipient_feedback)
            average_rating = total_rating / recipient_feedback.count()
            
            # Update recipient's profile
            profile = Profile.objects.get(user=instance.recipient)
            profile.average_rating = average_rating
            profile.save()
