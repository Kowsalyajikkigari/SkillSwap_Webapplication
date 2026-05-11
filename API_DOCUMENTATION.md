# SkillSwap API Documentation

## 🚀 Overview

SkillSwap is a comprehensive skill-sharing platform that enables users to teach and learn skills through sessions, real-time chat, and AI-powered voice interactions. This documentation covers all API endpoints and integration guides.

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [User Management](#user-management)
3. [Profile Management](#profile-management)
4. [Skills & Categories](#skills--categories)
5. [Session Management](#session-management)
6. [Real-time Messaging](#real-time-messaging)
7. [Voice AI Integration](#voice-ai-integration)
8. [Notifications](#notifications)
9. [WebSocket Connections](#websocket-connections)
10. [Error Handling](#error-handling)
11. [Rate Limiting](#rate-limiting)
12. [Environment Setup](#environment-setup)

## 🔐 Authentication

### JWT Token Authentication
The API uses JWT (JSON Web Tokens) for authentication with the following configuration:

```json
{
  "ACCESS_TOKEN_LIFETIME": "24 hours",
  "REFRESH_TOKEN_LIFETIME": "7 days",
  "ALGORITHM": "HS256",
  "AUTH_HEADER_TYPES": ["Bearer"]
}
```

### Headers Required
```http
Authorization: Bearer <access_token>
Content-Type: application/json
```

## 🛠 API Endpoints

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Response:**
```json
{
  "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe"
  }
}
```

#### Login
```http
POST /api/auth/login/
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Refresh Token
```http
POST /api/auth/token/refresh/
```

**Request Body:**
```json
{
  "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

### User Profile Endpoints

#### Get Current User Profile
```http
GET /api/auth/profile/
```

#### Update Profile
```http
PATCH /api/auth/profile/
```

**Request Body:**
```json
{
  "bio": "Passionate about teaching and learning new skills",
  "location": "San Francisco, CA",
  "avatar": "<file_upload>"
}
```

### Skills Endpoints

#### List All Skills
```http
GET /api/skills/all/
```

**Query Parameters:**
- `search`: Search skills by name
- `category`: Filter by category ID
- `page`: Pagination page number

#### Create New Skill
```http
POST /api/skills/all/
```

**Request Body:**
```json
{
  "name": "Python Programming",
  "description": "Learn Python from basics to advanced",
  "category": 1
}
```

#### User Teaching Skills
```http
GET /api/skills/teaching/
POST /api/skills/teaching/
```

#### User Learning Skills
```http
GET /api/skills/learning/
POST /api/skills/learning/
```

### Session Management

#### Create Session Request
```http
POST /api/sessions/requests/
```

**Request Body:**
```json
{
  "skill": 1,
  "provider": 2,
  "preferred_datetime": "2024-01-15T14:00:00Z",
  "duration_hours": 2,
  "message": "I'd like to learn Python basics"
}
```

#### List User Sessions
```http
GET /api/sessions/
```

#### Update Session Status
```http
PATCH /api/sessions/{session_id}/
```

### Messaging Endpoints

#### List Conversations
```http
GET /api/messages/conversations/
```

#### Send Message
```http
POST /api/messages/
```

**Request Body:**
```json
{
  "conversation": 1,
  "content": "Hello! When would you like to schedule our session?"
}
```

## 🎤 Voice AI Integration

### Initiate Voice Call
```http
POST /api/voice-ai/initiate-call/
```

**Request Body:**
```json
{
  "phone_number": "+1234567890",
  "session_type": "skill_discovery",
  "context_data": {}
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "uuid-string",
  "call_sid": "twilio-call-sid",
  "ultravox_call_id": "ultravox-call-id",
  "message": "Voice call initiated successfully"
}
```

### Session Types
- `skill_discovery`: AI helps discover relevant skills
- `availability_check`: Check tutor availability
- `session_booking`: Book learning sessions
- `session_management`: Manage existing sessions
- `general_inquiry`: General platform questions

### End Voice Call
```http
POST /api/voice-ai/end-call/
```

## 👥 User Management

### Get Current User Profile
```http
GET /api/users/profile/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "profile": {
      "bio": "Passionate about technology and learning",
      "location": "San Francisco, CA",
      "avatar": "https://example.com/avatars/user1.jpg",
      "phone": "+1234567890",
      "date_of_birth": "1990-01-01",
      "completion_percentage": 85,
      "sessions_completed": 12,
      "average_rating": 4.8
    }
  }
}
```

### Update User Profile
```http
PUT /api/users/profile/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "first_name": "John",
  "last_name": "Doe",
  "profile": {
    "bio": "Updated bio",
    "location": "New York, NY",
    "phone": "+1234567890"
  }
}
```

### Upload Avatar
```http
POST /api/users/profile/avatar/
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

avatar: <image_file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "avatar_url": "https://example.com/avatars/user1_new.jpg"
  },
  "message": "Avatar updated successfully"
}
```

## 🎯 Skills & Categories

### Get All Skill Categories
```http
GET /api/skills/categories/
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Programming",
      "description": "Software development and coding skills",
      "icon": "code",
      "skills_count": 25
    },
    {
      "id": 2,
      "name": "Design",
      "description": "Creative and visual design skills",
      "icon": "palette",
      "skills_count": 18
    }
  ]
}
```

### Get Skills by Category
```http
GET /api/skills/?category=1
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "id": 1,
        "name": "Python Programming",
        "description": "Python programming language",
        "category": {
          "id": 1,
          "name": "Programming"
        },
        "teachers_count": 15,
        "learners_count": 45
      }
    ],
    "pagination": {
      "page": 1,
      "total_pages": 3,
      "total_count": 25
    }
  }
}
```

### Add User Teaching Skill
```http
POST /api/skills/teaching/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "skill_id": 1,
  "level": "advanced",
  "years_experience": 5,
  "description": "I have 5 years of Python development experience",
  "hourly_rate": 50.00
}
```

### Add User Learning Goal
```http
POST /api/skills/learning/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "skill_id": 2,
  "current_level": "beginner",
  "goal": "Learn web development with React"
}
```

## 📅 Session Management

### Get User Sessions
```http
GET /api/sessions/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Python Basics Session",
      "skill": {
        "id": 1,
        "name": "Python Programming"
      },
      "requester": {
        "id": 2,
        "name": "Jane Smith",
        "avatar": "https://example.com/avatars/user2.jpg"
      },
      "provider": {
        "id": 1,
        "name": "John Doe",
        "avatar": "https://example.com/avatars/user1.jpg"
      },
      "date": "2025-07-10",
      "start_time": "14:00:00",
      "end_time": "15:00:00",
      "duration_minutes": 60,
      "session_type": "virtual",
      "status": "confirmed",
      "meeting_link": "https://meet.google.com/abc-def-ghi"
    }
  ]
}
```

### Create Session Request
```http
POST /api/sessions/requests/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "provider_id": 1,
  "skill_id": 1,
  "message": "I'd like to learn Python basics",
  "proposed_date": "2025-07-10",
  "proposed_time": "14:00:00",
  "session_type": "virtual"
}
```

### Accept/Reject Session Request
```http
PATCH /api/sessions/requests/{request_id}/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "status": "accepted",
  "response_message": "Looking forward to teaching you Python!"
}
```

### Get User Availability
```http
GET /api/sessions/availability/?start_date=2025-07-01&end_date=2025-07-31
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "regular_schedule": [
      {
        "weekday": 1,
        "start_time": "09:00:00",
        "end_time": "17:00:00",
        "timezone": "UTC"
      }
    ],
    "exceptions": [
      {
        "date": "2025-07-15",
        "is_available": false,
        "reason": "Personal appointment"
      }
    ],
    "available_slots": [
      {
        "date": "2025-07-10",
        "start_time": "14:00:00",
        "end_time": "15:00:00"
      }
    ]
  }
}
```

## 💬 Real-time Messaging

### Get Conversations
```http
GET /api/chat/conversations/
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "participants": [
        {
          "id": 1,
          "name": "John Doe",
          "avatar": "https://example.com/avatars/user1.jpg"
        },
        {
          "id": 2,
          "name": "Jane Smith",
          "avatar": "https://example.com/avatars/user2.jpg"
        }
      ],
      "last_message": {
        "content": "Thanks for the great session!",
        "timestamp": "2025-07-03T17:30:00Z",
        "sender": {
          "id": 2,
          "name": "Jane Smith"
        }
      },
      "unread_count": 0
    }
  ]
}
```

### Get Messages
```http
GET /api/chat/conversations/{conversation_id}/messages/
Authorization: Bearer <access_token>
```

### Send Message
```http
POST /api/chat/conversations/{conversation_id}/messages/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "content": "Hello! How are you?",
  "message_type": "text"
}
```

## 🔌 WebSocket Connections

### Real-time Chat
```javascript
const socket = new WebSocket('ws://localhost:8000/ws/chat/{conversation_id}/');

// Send message
socket.send(JSON.stringify({
  'message': 'Hello!',
  'sender': user_id
}));

// Receive message
socket.onmessage = function(event) {
  const data = JSON.parse(event.data);
  console.log('New message:', data.message);
};
```

## ⚠️ Error Handling

### Standard Error Response
```json
{
  "error": "error_code",
  "message": "Human readable error message",
  "details": {
    "field_name": ["Field specific error"]
  }
}
```

### Common HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## 🚦 Rate Limiting

### Current Limits
- Authentication endpoints: 5 requests per minute per IP
- API endpoints: 100 requests per minute per user
- Voice AI endpoints: 10 requests per hour per user

### Rate Limit Headers
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## 🔧 Environment Setup

### Required Environment Variables
```bash
# Django Configuration
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=yourdomain.com,localhost

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/skillswap

# Voice AI Integration
ULTRAVOX_API_KEY=your-ultravox-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# OAuth Providers
GOOGLE_OAUTH2_KEY=your-google-client-id
GOOGLE_OAUTH2_SECRET=your-google-client-secret
FACEBOOK_KEY=your-facebook-app-id
FACEBOOK_SECRET=your-facebook-app-secret
GITHUB_KEY=your-github-client-id
GITHUB_SECRET=your-github-client-secret

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
```

### Installation & Setup
```bash
# Backend Setup
cd skill-swap-backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend Setup
cd skill-swap-frontend
npm install
npm run dev
```

## 📊 API Testing

### Using cURL
```bash
# Register user
curl -X POST http://localhost:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","first_name":"Test","last_name":"User"}'

# Login
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Get profile (with token)
curl -X GET http://localhost:8000/api/auth/profile/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Using Postman
1. Import the API collection from `/docs/postman_collection.json`
2. Set environment variables for base URL and tokens
3. Run the test suite for comprehensive API testing

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS in production
- [ ] Set strong SECRET_KEY
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting
- [ ] Use environment variables for secrets
- [ ] Implement proper logging
- [ ] Set up monitoring and alerts

### API Key Management
- Never commit API keys to version control
- Use environment variables or secure key management
- Rotate keys regularly
- Monitor API usage for anomalies

---

**Note**: This documentation is for the SkillSwap platform. Replace placeholder values with actual configuration for your deployment.
