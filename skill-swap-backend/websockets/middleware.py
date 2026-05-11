from channels.auth import AuthMiddlewareStack
from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.contrib.auth import get_user_model

User = get_user_model()


@database_sync_to_async
def get_user(token_key):
    """Get user from token."""
    try:
        access_token = AccessToken(token_key)
        user_id = access_token.payload.get('user_id')
        return User.objects.get(id=user_id)
    except (InvalidToken, TokenError, User.DoesNotExist):
        return AnonymousUser()


class JWTAuthMiddleware:
    """JWT authentication middleware for WebSockets."""
    
    def __init__(self, app):
        self.app = app
    
    async def __call__(self, scope, receive, send):
        """Process the connection."""
        # Get the token from query string
        query_string = scope.get('query_string', b'').decode()

        token = None
        if query_string:
            try:
                # Parse query parameters more safely
                from urllib.parse import parse_qs
                query_params = parse_qs(query_string)
                token = query_params.get('token', [None])[0]
            except Exception as e:
                print(f"Error parsing query string: {e}")

        if token:
            # Get the user from the token
            user = await get_user(token)
            scope['user'] = user
            print(f"WebSocket authenticated user: {user}")
        else:
            scope['user'] = AnonymousUser()
            print("WebSocket: No token provided, using AnonymousUser")

        return await self.app(scope, receive, send)


def JWTAuthMiddlewareStack(app):
    """Wrap JWTAuthMiddleware around the AuthMiddlewareStack."""
    return JWTAuthMiddleware(AuthMiddlewareStack(app))
