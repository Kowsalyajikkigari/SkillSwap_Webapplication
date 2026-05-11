# SwapSkill Technical Documentation

## 🏗️ System Architecture

SwapSkill is a modern, scalable skill-sharing platform built with a microservices-inspired architecture using Django REST Framework for the backend and React with TypeScript for the frontend.

### Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React/TS)    │◄──►│   (Django)      │◄──►│   Services      │
│                 │    │                 │    │                 │
│ • React 18      │    │ • Django 4.2    │    │ • Ultravox AI   │
│ • TypeScript    │    │ • DRF 3.14      │    │ • Twilio        │
│ • Tailwind CSS │    │ • WebSockets    │    │ • Email Service │
│ • WebSocket     │    │ • JWT Auth      │    │ • File Storage  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Database      │
                    │   (SQLite)      │
                    │                 │
                    │ • User Data     │
                    │ • Skills        │
                    │ • Sessions      │
                    │ • Messages      │
                    └─────────────────┘
```

### Technology Stack

#### Backend
- **Framework**: Django 4.2 with Django REST Framework 3.14
- **Database**: SQLite (development), PostgreSQL (production ready)
- **Authentication**: JWT with SimpleJWT
- **Real-time**: Django Channels with WebSockets
- **Caching**: Django Cache Framework (Redis ready)
- **Voice AI**: Ultravox integration
- **Communication**: Twilio for voice calls
- **File Storage**: Django file handling (S3 ready)

#### Frontend
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom components
- **State Management**: React Context + Hooks
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Real-time**: WebSocket integration
- **Build Tool**: Vite

#### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Process Management**: Gunicorn + Nginx (production)
- **Monitoring**: Health check endpoints
- **Logging**: Structured logging with rotation
- **Security**: CORS, CSRF, Rate limiting, Input validation

## 📊 Database Schema

### Core Models

#### User Management
```sql
-- Custom User Model
users_user (
    id: AutoField (PK)
    email: EmailField (Unique)
    first_name: CharField(30)
    last_name: CharField(30)
    is_active: BooleanField
    is_staff: BooleanField
    date_joined: DateTimeField
    last_login: DateTimeField
)

-- User Profile
users_profile (
    id: AutoField (PK)
    user_id: OneToOneField -> users_user
    bio: TextField
    location: CharField(100)
    avatar: ImageField
    phone: CharField(20)
    date_of_birth: DateField
    sessions_completed: PositiveIntegerField
    average_rating: DecimalField
    created_at: DateTimeField
    updated_at: DateTimeField
)
```

#### Skills System
```sql
-- Skill Categories
skills_skillcategory (
    id: AutoField (PK)
    name: CharField(50)
    description: TextField
    icon: CharField(50)
    created_at: DateTimeField
)

-- Skills
skills_skill (
    id: AutoField (PK)
    name: CharField(100)
    description: TextField
    category_id: ForeignKey -> skills_skillcategory
    created_at: DateTimeField
)

-- User Teaching Skills
skills_userskill (
    id: AutoField (PK)
    user_id: ForeignKey -> users_user
    skill_id: ForeignKey -> skills_skill
    level: CharField(20) -- beginner, intermediate, advanced
    years_experience: PositiveIntegerField
    description: TextField
    hourly_rate: DecimalField
    created_at: DateTimeField
)

-- User Learning Goals
skills_userlearningskill (
    id: AutoField (PK)
    user_id: ForeignKey -> users_user
    skill_id: ForeignKey -> skills_skill
    current_level: CharField(20)
    goal: TextField
    created_at: DateTimeField
)
```

#### Session Management
```sql
-- Session Requests
skill_sessions_sessionrequest (
    id: AutoField (PK)
    requester_id: ForeignKey -> users_user
    provider_id: ForeignKey -> users_user
    skill_id: ForeignKey -> skills_skill
    message: TextField
    proposed_date: DateField
    proposed_time: TimeField
    session_type: CharField(20) -- virtual, in_person
    status: CharField(20) -- pending, accepted, rejected
    created_at: DateTimeField
)

-- Sessions
skill_sessions_session (
    id: AutoField (PK)
    requester_id: ForeignKey -> users_user
    provider_id: ForeignKey -> users_user
    skill_id: ForeignKey -> skills_skill
    title: CharField(200)
    description: TextField
    date: DateField
    start_time: TimeField
    end_time: TimeField
    duration_minutes: PositiveIntegerField
    session_type: CharField(20)
    status: CharField(20) -- confirmed, completed, cancelled
    meeting_link: URLField
    notes: TextField
    created_at: DateTimeField
)

-- User Availability
skill_sessions_useravailability (
    id: AutoField (PK)
    user_id: ForeignKey -> users_user
    weekday: IntegerField -- 0=Monday, 6=Sunday
    start_time: TimeField
    end_time: TimeField
    is_available: BooleanField
    timezone: CharField(50)
    created_at: DateTimeField
)

-- Session Feedback
skill_sessions_sessionfeedback (
    id: AutoField (PK)
    session_id: ForeignKey -> skill_sessions_session
    user_id: ForeignKey -> users_user
    recipient_id: ForeignKey -> users_user
    rating: PositiveIntegerField -- 1-5
    comment: TextField
    created_at: DateTimeField
)
```

#### Real-time Communication
```sql
-- Conversations
chat_messages_conversation (
    id: AutoField (PK)
    created_at: DateTimeField
    updated_at: DateTimeField
)

-- Conversation Participants (Many-to-Many)
chat_messages_conversation_participants (
    id: AutoField (PK)
    conversation_id: ForeignKey -> chat_messages_conversation
    user_id: ForeignKey -> users_user
)

-- Messages
chat_messages_message (
    id: AutoField (PK)
    conversation_id: ForeignKey -> chat_messages_conversation
    sender_id: ForeignKey -> users_user
    content: TextField
    message_type: CharField(20) -- text, image, file
    is_read: BooleanField
    timestamp: DateTimeField
)

-- Notifications
chat_messages_notification (
    id: AutoField (PK)
    recipient_id: ForeignKey -> users_user
    sender_id: ForeignKey -> users_user
    notification_type: CharField(50)
    title: CharField(200)
    content: TextField
    is_read: BooleanField
    conversation_id: ForeignKey -> chat_messages_conversation (nullable)
    created_at: DateTimeField
)
```

#### Voice AI Integration
```sql
-- Voice Sessions
voice_ai_voicesession (
    id: UUIDField (PK)
    user_id: ForeignKey -> users_user
    session_id: CharField(100) -- unique identifier
    call_sid: CharField(100) -- Twilio call SID
    ultravox_call_id: CharField(100)
    phone_number: CharField(20)
    session_type: CharField(50) -- skill_discovery, session_booking, etc.
    status: CharField(20) -- initiated, in_progress, completed, failed
    conversation_data: JSONField
    ai_response_count: PositiveIntegerField
    user_input_count: PositiveIntegerField
    duration_seconds: PositiveIntegerField
    created_at: DateTimeField
    started_at: DateTimeField
    completed_at: DateTimeField
)
```

### Database Relationships

```
User (1) ←→ (1) Profile
User (1) ←→ (M) UserSkill
User (1) ←→ (M) UserLearningSkill
User (1) ←→ (M) Session (as requester)
User (1) ←→ (M) Session (as provider)
User (1) ←→ (M) Message
User (M) ←→ (M) Conversation (participants)
User (1) ←→ (M) VoiceSession
Skill (1) ←→ (M) UserSkill
Skill (1) ←→ (M) Session
SkillCategory (1) ←→ (M) Skill
Session (1) ←→ (M) SessionFeedback
```

## 🔧 Configuration & Settings

### Environment Variables

#### Required Environment Variables
```bash
# Django Settings
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database (Production)
DATABASE_URL=postgresql://user:password@localhost:5432/swapskill

# Email Configuration
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password

# Voice AI Integration
ULTRAVOX_API_KEY=your-ultravox-api-key
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=+1234567890

# File Storage (Production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_STORAGE_BUCKET_NAME=your-s3-bucket
AWS_S3_REGION_NAME=us-west-2

# Cache (Production)
REDIS_URL=redis://localhost:6379/0

# Security
CORS_ALLOWED_ORIGINS=http://localhost:3000,https://your-domain.com
```

#### Optional Environment Variables
```bash
# Logging
LOG_LEVEL=INFO
LOG_FILE_PATH=/var/log/swapskill/

# Performance
CACHE_TIMEOUT=300
SESSION_COOKIE_AGE=86400

# Features
ENABLE_VOICE_AI=True
ENABLE_REAL_TIME_CHAT=True
ENABLE_EMAIL_NOTIFICATIONS=True
```

### Django Settings Structure

#### Core Settings (`settings.py`)
- Database configuration
- Authentication settings
- Middleware configuration
- Static/Media files
- Internationalization
- Security settings

#### Production Settings (`settings_production.py`)
- Production database (PostgreSQL)
- Redis caching
- S3 file storage
- Enhanced security headers
- Logging configuration
- Performance optimizations

### Security Configuration

#### Authentication & Authorization
- JWT token authentication
- Token rotation and blacklisting
- Password strength validation
- Rate limiting per user/IP

#### Input Validation & Sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- File upload validation

#### Security Headers
- Content Security Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)

## 📈 Performance Optimizations

### Database Optimizations
- Query optimization with `select_related` and `prefetch_related`
- Database indexing on frequently queried fields
- Connection pooling
- Query result caching

### Caching Strategy
- Redis for session storage
- API response caching
- User profile caching
- Skill data caching

### Frontend Optimizations
- Code splitting with React.lazy
- Image optimization and lazy loading
- Bundle size optimization
- Service worker for caching

### API Optimizations
- Pagination for large datasets
- Response compression
- Efficient serialization
- Rate limiting to prevent abuse

## 🔍 Monitoring & Logging

### Health Monitoring
- `/health/` endpoint for system status
- Database connectivity checks
- Cache system verification
- External service status

### Logging Configuration
- Structured logging with JSON format
- Log rotation and retention
- Error tracking and alerting
- Performance metrics logging

### Metrics Collection
- API response times
- Database query performance
- User activity tracking
- System resource usage
