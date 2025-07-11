from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, Message, Attachment, Notification

User = get_user_model()


class UserBasicSerializer(serializers.ModelSerializer):
    """Basic serializer for user information."""
    
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'avatar')


class AttachmentSerializer(serializers.ModelSerializer):
    """Serializer for message attachments."""
    
    class Meta:
        model = Attachment
        fields = ('id', 'file', 'file_name', 'file_type', 'created_at')
        read_only_fields = ('file_name', 'file_type')
    
    def create(self, validated_data):
        """Set file name and type from the uploaded file."""
        file = validated_data.get('file')
        if file:
            validated_data['file_name'] = file.name
            validated_data['file_type'] = file.content_type
        return super().create(validated_data)


class MessageSerializer(serializers.ModelSerializer):
    """Serializer for messages."""
    
    sender_details = UserBasicSerializer(source='sender', read_only=True)
    attachments = AttachmentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Message
        fields = ('id', 'conversation', 'sender', 'sender_details', 'content', 
                  'is_read', 'created_at', 'attachments')
        read_only_fields = ('sender', 'is_read')


class MessageCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating messages."""
    
    attachments = serializers.ListField(
        child=serializers.FileField(),
        required=False,
        write_only=True
    )
    
    class Meta:
        model = Message
        fields = ('conversation', 'content', 'attachments')
    
    def create(self, validated_data):
        """Create a message with attachments."""
        attachments_data = validated_data.pop('attachments', [])
        message = Message.objects.create(**validated_data)
        
        # Create attachments
        for file in attachments_data:
            Attachment.objects.create(
                message=message,
                file=file,
                file_name=file.name,
                file_type=file.content_type
            )
        
        return message


class ConversationSerializer(serializers.ModelSerializer):
    """Serializer for conversations."""
    
    participants_details = UserBasicSerializer(source='participants', many=True, read_only=True)
    last_message_content = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'participants_details', 'created_at', 
                  'updated_at', 'last_message_content', 'unread_count')
        read_only_fields = ('created_at', 'updated_at')
    
    def get_last_message_content(self, obj):
        """Get the content of the last message."""
        last_message = obj.last_message
        if last_message:
            return {
                'id': last_message.id,
                'content': last_message.content,
                'sender_id': last_message.sender.id,
                'created_at': last_message.created_at,
                'is_read': last_message.is_read
            }
        return None
    
    def get_unread_count(self, obj):
        """Get the count of unread messages for the current user."""
        user = self.context['request'].user
        return obj.messages.filter(is_read=False).exclude(sender=user).count()


class ConversationDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for conversations with messages."""

    participants_details = UserBasicSerializer(source='participants', many=True, read_only=True)
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = ('id', 'participants', 'participants_details', 'created_at',
                  'updated_at', 'messages')
        read_only_fields = ('created_at', 'updated_at')


class NotificationSerializer(serializers.ModelSerializer):
    """Serializer for notifications."""

    sender_details = UserBasicSerializer(source='sender', read_only=True)

    class Meta:
        model = Notification
        fields = (
            'id', 'recipient', 'sender', 'sender_details', 'notification_type',
            'title', 'content', 'is_read', 'action_url', 'conversation',
            'message', 'created_at', 'read_at'
        )
        read_only_fields = ('created_at', 'read_at')
