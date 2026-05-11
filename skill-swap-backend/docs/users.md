# User Management APIs

Base URL: `http://127.0.0.1:8000/api/auth/`

## Overview

User management endpoints handle user profile information, account details, and extended profile data including availability preferences and statistics.

## Endpoints

### 1. Get Current User Details

**Endpoint:** `GET /api/auth/user/`  
**Authentication:** Required (Bearer token)  
**Description:** Retrieve current authenticated user's basic information

#### Request Payload
None (GET request)

#### Response Payload
**Success (200 OK):**
```json
{
  "id": "integer",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "avatar": "string (URL, nullable)",
  "bio": "string (optional)",
  "location": "string (optional)"
}
```

#### Example Request
```bash
curl -X GET http://127.0.0.1:8000/api/auth/user/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

---

### 2. Update Current User Details

**Endpoint:** `PUT /api/auth/user/`  
**Authentication:** Required (Bearer token)  
**Description:** Update current authenticated user's basic information

#### Request Payload
```json
{
  "email": "string (optional, valid email)",
  "first_name": "string (optional, max 150 chars)",
  "last_name": "string (optional, max 150 chars)",
  "avatar": "file (optional, image file)",
  "bio": "string (optional)",
  "location": "string (optional, max 100 chars)"
}
```

#### Response Payload
**Success (200 OK):**
```json
{
  "id": "integer",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "avatar": "string (URL, nullable)",
  "bio": "string",
  "location": "string"
}
```

#### Example Request
```bash
curl -X PUT http://127.0.0.1:8000/api/auth/user/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Smith",
    "bio": "Passionate software developer",
    "location": "San Francisco, CA"
  }'
```

---

### 3. Get User Profile with Extended Data

**Endpoint:** `GET /api/auth/user/profile/`  
**Authentication:** Required (Bearer token)  
**Description:** Retrieve current user's complete profile including extended profile data

#### Request Payload
None (GET request)

#### Response Payload
**Success (200 OK):**
```json
{
  "id": "integer",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "avatar": "string (URL, nullable)",
  "bio": "string",
  "location": "string",
  "profile": {
    "id": "integer",
    "user": "integer",
    "level": "integer",
    "points": "integer",
    "sessions_completed": "integer",
    "average_rating": "decimal (0.00-5.00)",
    "available_weekdays": "boolean",
    "available_weekends": "boolean",
    "available_mornings": "boolean",
    "available_afternoons": "boolean",
    "available_evenings": "boolean"
  }
}
```

#### Example Request
```bash
curl -X GET http://127.0.0.1:8000/api/auth/user/profile/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
```

---

### 4. Update User Profile with Extended Data

**Endpoint:** `PUT /api/auth/user/profile/`  
**Authentication:** Required (Bearer token)  
**Description:** Update current user's complete profile including extended profile data

#### Request Payload
```json
{
  "email": "string (optional)",
  "first_name": "string (optional)",
  "last_name": "string (optional)",
  "avatar": "file (optional)",
  "bio": "string (optional)",
  "location": "string (optional)"
}
```

#### Response Payload
**Success (200 OK):**
```json
{
  "id": "integer",
  "email": "string",
  "first_name": "string",
  "last_name": "string",
  "avatar": "string (URL, nullable)",
  "bio": "string",
  "location": "string",
  "profile": {
    "id": "integer",
    "user": "integer",
    "level": "integer",
    "points": "integer",
    "sessions_completed": "integer",
    "average_rating": "decimal",
    "available_weekdays": "boolean",
    "available_weekends": "boolean",
    "available_mornings": "boolean",
    "available_afternoons": "boolean",
    "available_evenings": "boolean"
  }
}
```

---

### 5. Get Profile Details Only

**Endpoint:** `GET /api/auth/profile/`  
**Authentication:** Required (Bearer token)  
**Description:** Retrieve only the extended profile information

#### Request Payload
None (GET request)

#### Response Payload
**Success (200 OK):**
```json
{
  "id": "integer",
  "user": "integer",
  "level": "integer",
  "points": "integer",
  "sessions_completed": "integer",
  "average_rating": "decimal (0.00-5.00)",
  "available_weekdays": "boolean",
  "available_weekends": "boolean",
  "available_mornings": "boolean",
  "available_afternoons": "boolean",
  "available_evenings": "boolean"
}
```

---

### 6. Update Profile Details Only

**Endpoint:** `PUT /api/auth/profile/`  
**Authentication:** Required (Bearer token)  
**Description:** Update only the extended profile information (availability preferences)

#### Request Payload
```json
{
  "available_weekdays": "boolean (optional)",
  "available_weekends": "boolean (optional)",
  "available_mornings": "boolean (optional)",
  "available_afternoons": "boolean (optional)",
  "available_evenings": "boolean (optional)"
}
```

#### Response Payload
**Success (200 OK):**
```json
{
  "id": "integer",
  "user": "integer",
  "level": "integer",
  "points": "integer",
  "sessions_completed": "integer",
  "average_rating": "decimal",
  "available_weekdays": "boolean",
  "available_weekends": "boolean",
  "available_mornings": "boolean",
  "available_afternoons": "boolean",
  "available_evenings": "boolean"
}
```

## Status Codes

- **200 OK** - Request successful
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Permission denied
- **404 Not Found** - User or profile not found

## Notes

1. **Read-only Fields**: `level`, `points`, `sessions_completed`, and `average_rating` are automatically calculated
2. **Avatar Upload**: Supports common image formats (JPEG, PNG, GIF)
3. **Profile Auto-creation**: Profile is automatically created when user registers
4. **Availability Defaults**: New profiles default to weekdays and afternoons/evenings available
