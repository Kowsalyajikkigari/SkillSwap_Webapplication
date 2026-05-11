# SkillSwap API Documentation

This directory contains comprehensive API documentation for the SkillSwap Django backend application.

## Base URL
All API endpoints are accessible at: `http://127.0.0.1:8000`

## Quick Start Guide

### 1. Authentication Flow
```bash
# Register a new user
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "password2": "securepass123",
    "first_name": "John",
    "last_name": "Doe"
  }'

# Login to get tokens
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

### 2. Using the API
Include the access token in all authenticated requests:
```bash
curl -X GET http://127.0.0.1:8000/api/auth/user/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Documentation Structure

### Core API Documentation
- [Authentication APIs](./authentication.md) - User registration, login, logout, and token management
- [User Management APIs](./users.md) - User profile and account management
- [Skills APIs](./skills.md) - Skill categories, skills, and user skill management
- [Sessions APIs](./sessions.md) - Session requests, sessions, and feedback
- [Messaging APIs](./messaging.md) - Conversations and messages

### Reference Documentation
- [API Reference](./api-reference.md) - Complete endpoint listing with all HTTP methods
- [Error Codes](./error-codes.md) - Standard error responses and troubleshooting
- [Data Models](./data-models.md) - Complete data structure reference

## Key Features

### 🔐 Authentication & Authorization
- JWT-based authentication with access and refresh tokens
- User registration with email verification
- Secure password validation and hashing
- Token refresh mechanism for seamless user experience

### 👤 User Management
- Comprehensive user profiles with avatars and bio
- Availability preferences for session scheduling
- Points and level system for gamification
- Session completion tracking and ratings

### 🎯 Skills Management
- Hierarchical skill categories and individual skills
- User teaching skills with experience levels
- User learning skills with goals and current levels
- Advanced filtering and search capabilities

### 📅 Session Management
- Session request workflow (request → accept → confirm → complete)
- Flexible scheduling with date/time preferences
- Virtual and in-person session support
- Session feedback and rating system

### 💬 Real-time Messaging
- Direct messaging between users
- File attachment support
- Real-time WebSocket communication
- Read status tracking and unread counts

## API Endpoints Summary

| Category | Base URL | Endpoints | Authentication |
|----------|----------|-----------|----------------|
| Authentication | `/api/auth/` | 6 endpoints | Mixed |
| Users | `/api/auth/` | 6 endpoints | Required |
| Skills | `/api/skills/` | 18 endpoints | Mixed |
| Sessions | `/api/sessions/` | 21 endpoints | Required |
| Messaging | `/api/messages/` | 12 endpoints | Required |

**Total: 63 REST API endpoints + WebSocket support**

## Getting Started Workflow

### For New Users
1. **Register**: Use [Authentication APIs](./authentication.md) to create account
2. **Setup Profile**: Use [User Management APIs](./users.md) to complete profile
3. **Add Skills**: Use [Skills APIs](./skills.md) to add teaching and learning skills
4. **Browse & Connect**: Find other users and start conversations
5. **Request Sessions**: Use [Sessions APIs](./sessions.md) to request skill exchanges
6. **Communicate**: Use [Messaging APIs](./messaging.md) for coordination

### For Developers
1. **Study the Models**: Review [Data Models](./data-models.md) for data structure
2. **Check API Reference**: Use [API Reference](./api-reference.md) for complete endpoint list
3. **Handle Errors**: Implement proper error handling using [Error Codes](./error-codes.md)
4. **Test Authentication**: Start with auth endpoints before moving to protected resources
5. **Implement Real-time**: Add WebSocket support for messaging features

## Authentication Requirements

Most endpoints require JWT authentication. Include the access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Token Management
- **Access tokens**: Expire after 5 minutes
- **Refresh tokens**: Expire after 1 day
- **Automatic refresh**: Implement token refresh logic in your frontend

## Response Formats

### Success Response
```json
{
  "id": 1,
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe"
}
```

### Error Response
```json
{
  "detail": "Authentication credentials were not provided."
}
```

### Validation Error Response
```json
{
  "email": ["This field is required."],
  "password": ["Password fields didn't match."]
}
```

## Rate Limiting & Constraints

- **Authentication endpoints**: 5 requests/minute
- **General endpoints**: 100 requests/minute
- **File uploads**: 10 requests/minute
- **Avatar size**: 5MB maximum
- **Message attachments**: 10MB maximum per file

## CORS & Frontend Integration

The API is configured for frontend integration:
- **Allowed origins**: `localhost:3000`, `127.0.0.1:3000`
- **Supported methods**: GET, POST, PUT, DELETE, OPTIONS
- **Custom headers**: Authorization, Content-Type

## WebSocket Support

Real-time messaging via WebSocket:
```javascript
const ws = new WebSocket('ws://127.0.0.1:8000/ws/chat/1/');
ws.onmessage = function(event) {
    const data = JSON.parse(event.data);
    // Handle real-time message
};
```

## Development Tools

### Recommended Testing Tools
- **Postman**: For API testing and documentation
- **curl**: For command-line testing
- **WebSocket King**: For WebSocket testing
- **Django Admin**: For backend data management

### Frontend Integration
The API is designed to work seamlessly with:
- React applications (primary frontend)
- Vue.js applications
- Angular applications
- Mobile applications (React Native, Flutter)

## Support & Troubleshooting

1. **Check Error Codes**: Review [Error Codes](./error-codes.md) for common issues
2. **Validate Requests**: Ensure request format matches [Data Models](./data-models.md)
3. **Test Authentication**: Verify token format and expiration
4. **Check Permissions**: Ensure user has required permissions for endpoint
5. **Review Logs**: Check Django server logs for detailed error information

For technical support or questions about the API, please refer to the individual endpoint documentation or contact the development team.
