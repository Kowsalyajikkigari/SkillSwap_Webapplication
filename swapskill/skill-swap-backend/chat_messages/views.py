from rest_framework import viewsets, permissions, status, filters, generics
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Q, Count, Max
from django.shortcuts import get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .models import Conversation, Message, Notification
from .serializers import (
    ConversationSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
    MessageCreateSerializer,
    NotificationSerializer
)


class ConversationViewSet(viewsets.ModelViewSet):
    """ViewSet for conversations."""
    
    serializer_class = ConversationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter]
    search_fields = ['participants__first_name', 'participants__last_name', 'participants__email']
    
    def get_queryset(self):
        """Return conversations for the current user."""
        return Conversation.objects.filter(participants=self.request.user)
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'retrieve':
            return ConversationDetailSerializer
        return ConversationSerializer
    
    def perform_create(self, serializer):
        """Add the current user to participants when creating a conversation."""
        conversation = serializer.save()
        conversation.participants.add(self.request.user)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get messages for a conversation."""
        conversation = self.get_object()
        
        # Mark messages as read
        unread_messages = conversation.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        )
        
        for message in unread_messages:
            message.is_read = True
            message.save()
        
        # Get all messages
        messages = conversation.messages.all()
        serializer = MessageSerializer(messages, many=True)
        
        return Response(serializer.data)
    
    @action(detail=False, methods=['get', 'post'])
    def with_user(self, request):
        """Get or create a conversation with a specific user."""
        user_id = request.query_params.get('user_id') or request.data.get('user_id')
        
        if not user_id:
            return Response(
                {"detail": "user_id parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Find existing conversation
        conversations = Conversation.objects.filter(participants=request.user)
        conversation = None
        
        for conv in conversations:
            if conv.participants.filter(id=user_id).exists():
                conversation = conv
                break
        
        # Create new conversation if none exists
        if not conversation and request.method == 'POST':
            conversation = Conversation.objects.create()
            conversation.participants.add(request.user)
            conversation.participants.add(user_id)
        
        if not conversation:
            return Response(
                {"detail": "No conversation found with this user."},
                status=status.HTTP_404_NOT_FOUND
            )
        
        if request.method == 'GET':
            serializer = self.get_serializer(conversation)
            return Response(serializer.data)
        
        # Handle POST with message content
        content = request.data.get('content')
        
        if not content:
            return Response(
                {"detail": "content parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Create message
        message = Message.objects.create(
            conversation=conversation,
            sender=request.user,
            content=content
        )
        
        # Update conversation timestamp
        conversation.save()  # This will update the updated_at field
        
        serializer = self.get_serializer(conversation)
        return Response(serializer.data)


class MessageViewSet(viewsets.ModelViewSet):
    """ViewSet for messages."""
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return appropriate serializer class."""
        if self.action == 'create':
            return MessageCreateSerializer
        return MessageSerializer
    
    def get_queryset(self):
        """Return messages for the current user's conversations."""
        return Message.objects.filter(conversation__participants=self.request.user)
    
    def perform_create(self, serializer):
        """Save the sender when creating a message and send real-time notifications."""
        # Check if user is part of the conversation
        conversation = serializer.validated_data['conversation']
        if not conversation.participants.filter(id=self.request.user.id).exists():
            raise permissions.PermissionDenied("You are not a participant in this conversation.")

        # Create the message
        message = serializer.save(sender=self.request.user)

        # Update conversation timestamp
        conversation.save()  # This will update the updated_at field

        # Send real-time notifications to other participants
        channel_layer = get_channel_layer()
        message_data = MessageSerializer(message).data

        for participant in conversation.participants.all():
            if participant != self.request.user:
                # Send to chat WebSocket
                async_to_sync(channel_layer.group_send)(
                    f'user_{participant.id}',
                    {
                        'type': 'chat_message',
                        'message': message_data
                    }
                )

                # Create and send notification
                notification = Notification.objects.create(
                    recipient=participant,
                    sender=self.request.user,
                    notification_type='message',
                    title=f'New message from {self.request.user.first_name or self.request.user.email}',
                    content=message.content[:100] + ('...' if len(message.content) > 100 else ''),
                    conversation=conversation,
                    message=message,
                    action_url=f'/inbox?conversation={conversation.id}'
                )

                # Send notification via WebSocket
                notification_data = NotificationSerializer(notification).data
                async_to_sync(channel_layer.group_send)(
                    f'user_notifications_{participant.id}',
                    {
                        'type': 'notification',
                        'notification': notification_data
                    }
                )
    
    @action(detail=True, methods=['post'])
    def mark_read(self, request, pk=None):
        """Mark a message as read."""
        message = self.get_object()
        
        # Check if user is the recipient
        if message.sender == request.user:
            return Response(
                {"detail": "You cannot mark your own message as read."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        message.is_read = True
        message.save()
        
        return Response({"detail": "Message marked as read."})
    
    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        """Mark all messages in a conversation as read."""
        conversation_id = request.data.get('conversation_id')
        
        if not conversation_id:
            return Response(
                {"detail": "conversation_id parameter is required."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        conversation = get_object_or_404(Conversation, id=conversation_id)
        
        # Check if user is part of the conversation
        if not conversation.participants.filter(id=request.user.id).exists():
            return Response(
                {"detail": "You are not a participant in this conversation."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Mark all messages from other users as read
        unread_messages = conversation.messages.filter(
            is_read=False
        ).exclude(
            sender=request.user
        )
        
        unread_messages.update(is_read=True)

        return Response({"detail": f"{unread_messages.count()} messages marked as read."})


# Notification Views
class NotificationListView(generics.ListAPIView):
    """List notifications for the authenticated user."""

    serializer_class = NotificationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(recipient=self.request.user)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_notification_as_read(request, notification_id):
    """Mark a specific notification as read."""
    notification = get_object_or_404(
        Notification,
        id=notification_id,
        recipient=request.user
    )

    notification.mark_as_read()

    return Response({
        'success': True,
        'notification_id': notification_id
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def mark_all_notifications_as_read(request):
    """Mark all notifications as read for the authenticated user."""
    updated_count = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).update(is_read=True)

    return Response({
        'success': True,
        'notifications_marked': updated_count
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_unread_counts(request):
    """Get unread message and notification counts."""
    unread_messages = Message.objects.filter(
        conversation__participants=request.user,
        is_read=False
    ).exclude(sender=request.user).count()

    unread_notifications = Notification.objects.filter(
        recipient=request.user,
        is_read=False
    ).count()

    return Response({
        'unread_messages': unread_messages,
        'unread_notifications': unread_notifications
    })
