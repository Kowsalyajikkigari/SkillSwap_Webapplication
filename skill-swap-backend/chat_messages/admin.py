from django.contrib import admin
from .models import Conversation, Message, Attachment, Notification


class MessageInline(admin.TabularInline):
    """Inline admin for messages."""
    model = Message
    extra = 0
    readonly_fields = ('sender', 'content', 'is_read', 'created_at')
    can_delete = False


@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    """Admin for conversations."""
    
    list_display = ('id', 'get_participants', 'created_at', 'updated_at')
    filter_horizontal = ('participants',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [MessageInline]
    
    def get_participants(self, obj):
        """Get a comma-separated list of participants."""
        return ", ".join([user.email for user in obj.participants.all()])
    get_participants.short_description = 'Participants'


class AttachmentInline(admin.TabularInline):
    """Inline admin for attachments."""
    model = Attachment
    extra = 0
    readonly_fields = ('file', 'file_name', 'file_type', 'created_at')
    can_delete = False


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    """Admin for messages."""
    
    list_display = ('id', 'conversation', 'sender', 'content_preview', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('content', 'sender__email')
    readonly_fields = ('created_at',)
    inlines = [AttachmentInline]
    
    def content_preview(self, obj):
        """Get a preview of the message content."""
        if len(obj.content) > 50:
            return f"{obj.content[:50]}..."
        return obj.content
    content_preview.short_description = 'Content'


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    """Admin for attachments."""

    list_display = ('id', 'message', 'file_name', 'file_type', 'created_at')
    list_filter = ('file_type', 'created_at')
    search_fields = ('file_name', 'message__content', 'message__sender__email')
    readonly_fields = ('created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    """Admin for notifications."""

    list_display = ('id', 'recipient', 'sender', 'notification_type', 'title', 'is_read', 'created_at')
    list_filter = ('notification_type', 'is_read', 'created_at')
    search_fields = ('title', 'content', 'recipient__email', 'sender__email')
    readonly_fields = ('created_at', 'read_at')

    def get_queryset(self, request):
        """Optimize queryset with select_related."""
        return super().get_queryset(request).select_related('recipient', 'sender')
