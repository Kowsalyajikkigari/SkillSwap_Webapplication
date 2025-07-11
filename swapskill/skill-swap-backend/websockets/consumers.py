import json
import time
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.core.cache import cache

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for chat messages."""
    
    async def connect(self):
        """Connect to the WebSocket."""
        try:
            self.user = self.scope.get("user")

            # Check if user exists and is authenticated
            if not self.user or self.user.is_anonymous:
                print("WebSocket: Anonymous user attempted to connect to chat")
                await self.close()
                return

            # Rate limiting for WebSocket connections
            user_ip = self.scope.get('client', ['unknown', None])[0]
            rate_key = f"ws_connect_{user_ip}"
            current_time = time.time()

            # Allow 10 connections per minute per IP
            connections = cache.get(rate_key) or []
            connections = [t for t in connections if current_time - t < 60]  # Keep only last minute

            if len(connections) >= 10:
                print(f"WebSocket: Rate limit exceeded for IP {user_ip}")
                await self.close()
                return

            connections.append(current_time)
            cache.set(rate_key, connections, 60)

            print(f"WebSocket: User {self.user.email} connecting to chat")

            # Create a user-specific group
            self.user_group_name = f'user_{self.user.id}'

            # Join user group
            await self.channel_layer.group_add(
                self.user_group_name,
                self.channel_name
            )

            await self.accept()

        except Exception as e:
            print(f"WebSocket connection error: {e}")
            await self.close()
    
    async def disconnect(self, close_code):
        """Disconnect from the WebSocket."""
        print(f"WebSocket: User disconnecting with code {close_code}")
        # Leave user group
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')

            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': text_data_json.get('timestamp', '')
                }))
            elif message_type == 'typing':
                # Handle typing indicators
                conversation_id = text_data_json.get('conversation_id')
                if conversation_id:
                    # Send typing indicator to other participants
                    await self.channel_layer.group_send(
                        f'conversation_{conversation_id}',
                        {
                            'type': 'typing_indicator',
                            'user_id': self.user.id,
                            'user_name': self.user.first_name or self.user.email,
                            'is_typing': text_data_json.get('is_typing', True)
                        }
                    )
            elif message_type == 'join_conversation':
                # Join conversation group for typing indicators
                conversation_id = text_data_json.get('conversation_id')
                if conversation_id:
                    await self.channel_layer.group_add(
                        f'conversation_{conversation_id}',
                        self.channel_name
                    )
            elif message_type == 'leave_conversation':
                # Leave conversation group
                conversation_id = text_data_json.get('conversation_id')
                if conversation_id:
                    await self.channel_layer.group_discard(
                        f'conversation_{conversation_id}',
                        self.channel_name
                    )
        except json.JSONDecodeError:
            # Invalid JSON, ignore
            pass
    
    async def chat_message(self, event):
        """Send message to WebSocket."""
        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'chat_message',
            'message': event['message']
        }))

    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket."""
        # Don't send typing indicator to the user who is typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'user_id': event['user_id'],
                'user_name': event['user_name'],
                'is_typing': event['is_typing']
            }))


class NotificationConsumer(AsyncWebsocketConsumer):
    """WebSocket consumer for notifications."""

    async def connect(self):
        """Connect to the WebSocket."""
        self.user = self.scope["user"]

        # Anonymous users can't connect
        if self.user.is_anonymous:
            print("WebSocket: Anonymous user attempted to connect to notifications")
            await self.close()
            return

        print(f"WebSocket: User {self.user.email} connecting to notifications")

        # Create a user-specific group
        self.user_group_name = f'user_notifications_{self.user.id}'

        # Join user group
        await self.channel_layer.group_add(
            self.user_group_name,
            self.channel_name
        )

        await self.accept()
    
    async def disconnect(self, close_code):
        """Disconnect from the WebSocket."""
        print(f"WebSocket: Notification user disconnecting with code {close_code}")
        # Leave user group
        if hasattr(self, 'user_group_name'):
            await self.channel_layer.group_discard(
                self.user_group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'notification')
            
            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': text_data_json.get('timestamp', '')
                }))
            else:
                # Handle other message types if needed
                pass
        except json.JSONDecodeError:
            # Invalid JSON, ignore
            pass
    
    async def notification(self, event):
        """Send notification to WebSocket."""
        # Send notification to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'notification',
            'notification': event['notification']
        }))


class TestChatConsumer(AsyncWebsocketConsumer):
    """Test WebSocket consumer for chat messages (allows anonymous connections)."""

    async def connect(self):
        """Connect to the WebSocket."""
        print("WebSocket: Test chat consumer - accepting connection")
        await self.accept()

    async def disconnect(self, close_code):
        """Disconnect from the WebSocket."""
        print(f"WebSocket: Test chat consumer disconnecting with code {close_code}")

    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'message')

            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': text_data_json.get('timestamp', ''),
                    'message': 'Test chat consumer is working!'
                }))
            else:
                # Echo back the message
                await self.send(text_data=json.dumps({
                    'type': 'echo',
                    'original_message': text_data_json,
                    'message': 'Test chat consumer received your message'
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON received'
            }))


class TestNotificationConsumer(AsyncWebsocketConsumer):
    """Test WebSocket consumer for notifications (allows anonymous connections)."""

    async def connect(self):
        """Connect to the WebSocket."""
        print("WebSocket: Test notification consumer - accepting connection")
        await self.accept()

    async def disconnect(self, close_code):
        """Disconnect from the WebSocket."""
        print(f"WebSocket: Test notification consumer disconnecting with code {close_code}")

    async def receive(self, text_data):
        """Receive message from WebSocket."""
        try:
            text_data_json = json.loads(text_data)
            message_type = text_data_json.get('type', 'notification')

            if message_type == 'ping':
                # Respond to ping with pong
                await self.send(text_data=json.dumps({
                    'type': 'pong',
                    'timestamp': text_data_json.get('timestamp', ''),
                    'message': 'Test notification consumer is working!'
                }))
            else:
                # Echo back the message
                await self.send(text_data=json.dumps({
                    'type': 'echo',
                    'original_message': text_data_json,
                    'message': 'Test notification consumer received your message'
                }))
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                'type': 'error',
                'message': 'Invalid JSON received'
            }))
