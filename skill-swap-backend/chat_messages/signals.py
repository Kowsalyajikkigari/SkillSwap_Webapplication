from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import Message
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
import json


@receiver(post_save, sender=Message)
def notify_new_message(sender, instance, created, **kwargs):
    """Send notification when a new message is created."""
    if created:
        # Get the channel layer
        channel_layer = get_channel_layer()
        
        # Prepare the message data
        message_data = {
            'id': instance.id,
            'conversation_id': instance.conversation.id,
            'sender_id': instance.sender.id,
            'content': instance.content,
            'created_at': instance.created_at.isoformat(),
        }
        
        # Send to each participant's channel group
        for participant in instance.conversation.participants.all():
            if participant != instance.sender:  # Don't send to the sender
                async_to_sync(channel_layer.group_send)(
                    f'user_{participant.id}',
                    {
                        'type': 'chat_message',
                        'message': message_data
                    }
                )
