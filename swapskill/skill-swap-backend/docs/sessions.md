# Sessions APIs

Base URL: `http://127.0.0.1:8000/api/sessions/`

## Overview

Session management endpoints handle session requests, confirmed sessions, and session feedback. These are the core endpoints for the skill-swapping functionality.

## Endpoints

### 1. Session Requests

#### Get Session Requests
**Endpoint:** `GET /api/sessions/requests/`  
**Authentication:** Required  
**Description:** Get session requests sent by or received by the current user

**Query Parameters:**
- `status` - Filter by status (pending, accepted, declined)
- `skill` - Filter by skill ID
- `session_type` - Filter by type (virtual, in_person)

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "requester": "integer",
    "provider": "integer",
    "requester_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "provider_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "skill": "integer",
    "skill_details": {
      "id": "integer",
      "name": "string",
      "description": "string",
      "category": "integer",
      "category_name": "string"
    },
    "message": "string",
    "proposed_date": "date (YYYY-MM-DD, nullable)",
    "proposed_time": "time (HH:MM:SS, nullable)",
    "session_type": "string (virtual|in_person)",
    "location": "string",
    "status": "string (pending|accepted|declined)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Create Session Request
**Endpoint:** `POST /api/sessions/requests/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "provider": "integer (required, user ID)",
  "skill": "integer (required, skill ID)",
  "message": "string (required)",
  "proposed_date": "date (optional, YYYY-MM-DD)",
  "proposed_time": "time (optional, HH:MM:SS)",
  "session_type": "string (optional, default: virtual)",
  "location": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "integer",
  "requester": "integer",
  "provider": "integer",
  "requester_details": { ... },
  "provider_details": { ... },
  "skill": "integer",
  "skill_details": { ... },
  "message": "string",
  "proposed_date": "date",
  "proposed_time": "time",
  "session_type": "string",
  "location": "string",
  "status": "pending",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Accept Session Request
**Endpoint:** `POST /api/sessions/requests/{id}/accept/`  
**Authentication:** Required  
**Description:** Accept a session request (provider only)

**Request Payload:** None

**Response (200 OK):**
```json
{
  "detail": "Request accepted and session created.",
  "session": {
    "id": "integer",
    "requester": "integer",
    "provider": "integer",
    "skill": "integer",
    "title": "string",
    "description": "string",
    "date": "date",
    "start_time": "time",
    "session_type": "string",
    "location": "string",
    "status": "confirmed",
    "created_at": "datetime"
  }
}
```

#### Decline Session Request
**Endpoint:** `POST /api/sessions/requests/{id}/decline/`  
**Authentication:** Required  
**Description:** Decline a session request (provider only)

**Response (200 OK):**
```json
{
  "detail": "Request declined."
}
```

#### Update Session Request
**Endpoint:** `PUT /api/sessions/requests/{id}/`  
**Authentication:** Required

#### Delete Session Request
**Endpoint:** `DELETE /api/sessions/requests/{id}/`  
**Authentication:** Required

---

### 2. Sessions

#### Get Sessions
**Endpoint:** `GET /api/sessions/sessions/`  
**Authentication:** Required  
**Description:** Get confirmed sessions for the current user

**Query Parameters:**
- `status` - Filter by status (pending, confirmed, completed, cancelled)
- `skill` - Filter by skill ID
- `session_type` - Filter by type (virtual, in_person)
- `date` - Filter by date (YYYY-MM-DD)

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "requester": "integer",
    "provider": "integer",
    "requester_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "provider_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "skill": "integer",
    "skill_details": {
      "id": "integer",
      "name": "string",
      "description": "string",
      "category": "integer",
      "category_name": "string"
    },
    "title": "string",
    "description": "string",
    "date": "date (YYYY-MM-DD, nullable)",
    "start_time": "time (HH:MM:SS, nullable)",
    "end_time": "time (HH:MM:SS, nullable)",
    "duration_minutes": "integer",
    "session_type": "string (virtual|in_person)",
    "location": "string",
    "meeting_link": "string (URL)",
    "status": "string (pending|confirmed|completed|cancelled)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Get Single Session
**Endpoint:** `GET /api/sessions/sessions/{id}/`  
**Authentication:** Required

#### Update Session
**Endpoint:** `PUT /api/sessions/sessions/{id}/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "title": "string (optional)",
  "description": "string (optional)",
  "date": "date (optional)",
  "start_time": "time (optional)",
  "end_time": "time (optional)",
  "duration_minutes": "integer (optional)",
  "session_type": "string (optional)",
  "location": "string (optional)",
  "meeting_link": "string (optional)"
}
```

#### Complete Session
**Endpoint:** `POST /api/sessions/sessions/{id}/complete/`  
**Authentication:** Required  
**Description:** Mark session as completed (participants only)

**Response (200 OK):**
```json
{
  "detail": "Session marked as completed."
}
```

**Notes:** 
- Updates both participants' profiles (+1 session completed, +10 points)
- Only participants can mark session as completed
- Session must be in 'confirmed' status

#### Cancel Session
**Endpoint:** `POST /api/sessions/sessions/{id}/cancel/`  
**Authentication:** Required  
**Description:** Cancel a session (participants only)

**Response (200 OK):**
```json
{
  "detail": "Session cancelled."
}
```

---

### 3. Session Feedback

#### Get Session Feedback
**Endpoint:** `GET /api/sessions/feedback/`  
**Authentication:** Required  
**Description:** Get feedback given by or received by the current user

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "session": "integer",
    "user": "integer",
    "recipient": "integer",
    "user_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "recipient_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "rating": "integer (1-5)",
    "comment": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Create Session Feedback
**Endpoint:** `POST /api/sessions/feedback/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "session": "integer (required, session ID)",
  "rating": "integer (required, 1-5)",
  "comment": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "integer",
  "session": "integer",
  "user": "integer",
  "recipient": "integer",
  "user_details": { ... },
  "recipient_details": { ... },
  "rating": "integer",
  "comment": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Get Feedback for Specific Session
**Endpoint:** `GET /api/sessions/feedback/for_session/?session_id={session_id}`  
**Authentication:** Required  
**Description:** Get all feedback for a specific session

**Query Parameters:**
- `session_id` - Required, session ID

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "session": "integer",
    "user": "integer",
    "recipient": "integer",
    "user_details": { ... },
    "recipient_details": { ... },
    "rating": "integer",
    "comment": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

## Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Resource deleted successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Permission denied (e.g., only provider can accept request)
- **404 Not Found** - Resource not found

## Notes

1. **Session Lifecycle**: Request → Accept → Confirm → Complete → Feedback
2. **Permissions**: Only providers can accept/decline requests, only participants can complete/cancel sessions
3. **Automatic Session Creation**: Accepting a request automatically creates a confirmed session
4. **Feedback Constraints**: Users can only provide feedback for sessions they participated in
5. **Points System**: Completing sessions awards 10 points to both participants
