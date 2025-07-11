from django.urls import path
from . import consumers

websocket_urlpatterns = [
    # Production WebSocket endpoints (require authentication)
    path('ws/messages/', consumers.ChatConsumer.as_asgi()),
    path('ws/notifications/', consumers.NotificationConsumer.as_asgi()),

    # Test WebSocket endpoints (allow anonymous connections)
    path('ws/test/messages/', consumers.TestChatConsumer.as_asgi()),
    path('ws/test/notifications/', consumers.TestNotificationConsumer.as_asgi()),
]
