# API Reference

Complete listing of all SkillSwap API endpoints.

Base URL: `http://127.0.0.1:8000`

## Authentication Endpoints
**Base:** `/api/auth/`

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register/` | Register new user | No |
| POST | `/api/auth/login/` | User login | No |
| POST | `/api/auth/token/refresh/` | Refresh access token | No |
| POST | `/api/auth/logout/` | User logout | Yes |
| GET | `/api/auth/user/` | Get current user details | Yes |
| PUT | `/api/auth/user/` | Update current user details | Yes |
| GET | `/api/auth/user/profile/` | Get user with profile data | Yes |
| PUT | `/api/auth/user/profile/` | Update user with profile data | Yes |
| GET | `/api/auth/profile/` | Get profile details only | Yes |
| PUT | `/api/auth/profile/` | Update profile details only | Yes |

## Skills Endpoints
**Base:** `/api/skills/`

### Skill Categories
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/skills/categories/` | List all categories | No |
| POST | `/api/skills/categories/` | Create category | Yes |
| GET | `/api/skills/categories/{id}/` | Get category details | No |
| PUT | `/api/skills/categories/{id}/` | Update category | Yes |
| DELETE | `/api/skills/categories/{id}/` | Delete category | Yes |

### Skills
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/skills/all/` | List all skills | No |
| POST | `/api/skills/all/` | Create skill | Yes |
| GET | `/api/skills/all/{id}/` | Get skill details | No |
| PUT | `/api/skills/all/{id}/` | Update skill | Yes |
| DELETE | `/api/skills/all/{id}/` | Delete skill | Yes |
| GET | `/api/skills/all/by_category/` | Get skills grouped by category | No |

### User Teaching Skills
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/skills/teaching/` | List user's teaching skills | Yes |
| POST | `/api/skills/teaching/` | Add teaching skill | Yes |
| GET | `/api/skills/teaching/{id}/` | Get teaching skill details | Yes |
| PUT | `/api/skills/teaching/{id}/` | Update teaching skill | Yes |
| DELETE | `/api/skills/teaching/{id}/` | Delete teaching skill | Yes |
| GET | `/api/skills/teaching/detailed/` | Get detailed teaching skills | Yes |

### User Learning Skills
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/skills/learning/` | List user's learning skills | Yes |
| POST | `/api/skills/learning/` | Add learning skill | Yes |
| GET | `/api/skills/learning/{id}/` | Get learning skill details | Yes |
| PUT | `/api/skills/learning/{id}/` | Update learning skill | Yes |
| DELETE | `/api/skills/learning/{id}/` | Delete learning skill | Yes |
| GET | `/api/skills/learning/detailed/` | Get detailed learning skills | Yes |

## Sessions Endpoints
**Base:** `/api/sessions/`

### Session Requests
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sessions/requests/` | List session requests | Yes |
| POST | `/api/sessions/requests/` | Create session request | Yes |
| GET | `/api/sessions/requests/{id}/` | Get request details | Yes |
| PUT | `/api/sessions/requests/{id}/` | Update session request | Yes |
| DELETE | `/api/sessions/requests/{id}/` | Delete session request | Yes |
| POST | `/api/sessions/requests/{id}/accept/` | Accept session request | Yes |
| POST | `/api/sessions/requests/{id}/decline/` | Decline session request | Yes |

### Sessions
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sessions/sessions/` | List user's sessions | Yes |
| POST | `/api/sessions/sessions/` | Create session | Yes |
| GET | `/api/sessions/sessions/{id}/` | Get session details | Yes |
| PUT | `/api/sessions/sessions/{id}/` | Update session | Yes |
| DELETE | `/api/sessions/sessions/{id}/` | Delete session | Yes |
| POST | `/api/sessions/sessions/{id}/complete/` | Mark session as completed | Yes |
| POST | `/api/sessions/sessions/{id}/cancel/` | Cancel session | Yes |

### Session Feedback
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/sessions/feedback/` | List user's feedback | Yes |
| POST | `/api/sessions/feedback/` | Create feedback | Yes |
| GET | `/api/sessions/feedback/{id}/` | Get feedback details | Yes |
| PUT | `/api/sessions/feedback/{id}/` | Update feedback | Yes |
| DELETE | `/api/sessions/feedback/{id}/` | Delete feedback | Yes |
| GET | `/api/sessions/feedback/for_session/` | Get feedback for session | Yes |

## Messaging Endpoints
**Base:** `/api/messages/`

### Conversations
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/conversations/` | List user's conversations | Yes |
| POST | `/api/messages/conversations/` | Create conversation | Yes |
| GET | `/api/messages/conversations/{id}/` | Get conversation details | Yes |
| PUT | `/api/messages/conversations/{id}/` | Update conversation | Yes |
| DELETE | `/api/messages/conversations/{id}/` | Delete conversation | Yes |
| GET | `/api/messages/conversations/{id}/messages/` | Get conversation messages | Yes |
| POST | `/api/messages/conversations/start_with_user/` | Start conversation with user | Yes |

### Messages
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/messages/messages/` | List user's messages | Yes |
| POST | `/api/messages/messages/` | Create message | Yes |
| GET | `/api/messages/messages/{id}/` | Get message details | Yes |
| PUT | `/api/messages/messages/{id}/` | Update message | Yes |
| DELETE | `/api/messages/messages/{id}/` | Delete message | Yes |

## WebSocket Endpoints

| Endpoint | Description | Auth Required |
|----------|-------------|---------------|
| `ws://127.0.0.1:8000/ws/chat/{conversation_id}/` | Real-time messaging | Yes |

## Query Parameters

### Common Filtering Parameters
- `search` - Full-text search (available on most list endpoints)
- `ordering` - Sort results (e.g., `?ordering=-created_at`)
- `page` - Page number for pagination
- `page_size` - Number of items per page

### Skills Specific
- `category` - Filter by category ID
- `level` - Filter by skill level
- `skill__category` - Filter by skill's category

### Sessions Specific
- `status` - Filter by status
- `skill` - Filter by skill ID
- `session_type` - Filter by session type
- `date` - Filter by date

### Messages Specific
- `conversation` - Filter by conversation ID
- `is_read` - Filter by read status

## HTTP Status Codes

| Code | Description |
|------|-------------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 204 | No Content - Resource deleted successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Permission denied |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource already exists |
| 413 | Payload Too Large - File too large |
| 422 | Unprocessable Entity - Validation errors |
| 500 | Internal Server Error - Server error |

## Rate Limiting

- **Authentication endpoints**: 5 requests per minute
- **General API endpoints**: 100 requests per minute
- **File upload endpoints**: 10 requests per minute

## Pagination

List endpoints support pagination with the following parameters:
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

Response format:
```json
{
  "count": 150,
  "next": "http://127.0.0.1:8000/api/endpoint/?page=2",
  "previous": null,
  "results": [ ... ]
}
```

## File Upload Limits

- **Avatar images**: 5MB max, JPEG/PNG/GIF
- **Message attachments**: 10MB max per file
- **Supported formats**: Images, documents (PDF, DOC, DOCX), archives (ZIP, RAR)

## CORS Configuration

The API supports CORS for frontend integration:
- **Allowed Origins**: `http://localhost:3000`, `http://127.0.0.1:3000`
- **Allowed Methods**: GET, POST, PUT, DELETE, OPTIONS
- **Allowed Headers**: Authorization, Content-Type
