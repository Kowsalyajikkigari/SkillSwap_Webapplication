# Authentication APIs

Base URL: `http://127.0.0.1:8000/api/auth/`

## Overview

The SkillSwap application uses JWT (JSON Web Token) authentication. Users receive access and refresh tokens upon successful login, which must be included in subsequent API requests.

## Endpoints

### 1. User Registration

**Endpoint:** `POST /api/auth/register/`  
**Authentication:** Not required  
**Description:** Register a new user account

#### Request Payload
```json
{
  "email": "string (required, valid email)",
  "password": "string (required, min 8 chars)",
  "password2": "string (required, must match password)",
  "first_name": "string (required, max 150 chars)",
  "last_name": "string (required, max 150 chars)"
}
```

#### Response Payload
**Success (201 Created):**
```json
{
  "refresh": "string (JWT refresh token)",
  "access": "string (JWT access token)",
  "user": {
    "id": "integer",
    "email": "string",
    "first_name": "string",
    "last_name": "string"
  }
}
```

**Error (400 Bad Request):**
```json
{
  "email": ["This field is required."],
  "password": ["Password fields didn't match."],
  "first_name": ["This field is required."]
}
```

#### Example Request
```bash
curl -X POST http://127.0.0.1:8000/api/auth/register/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123",
    "password2": "securepassword123",
    "first_name": "John",
    "last_name": "Doe"
  }'
```

---

### 2. User Login

**Endpoint:** `POST /api/auth/login/`  
**Authentication:** Not required  
**Description:** Authenticate user and receive JWT tokens

#### Request Payload
```json
{
  "email": "string (required)",
  "password": "string (required)"
}
```

#### Response Payload
**Success (200 OK):**
```json
{
  "refresh": "string (JWT refresh token)",
  "access": "string (JWT access token)",
  "user": {
    "id": "integer",
    "email": "string",
    "first_name": "string",
    "last_name": "string",
    "avatar": "string (URL, nullable)"
  }
}
```

**Error (401 Unauthorized):**
```json
{
  "detail": "No active account found with the given credentials"
}
```

#### Example Request
```bash
curl -X POST http://127.0.0.1:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "securepassword123"
  }'
```

---

### 3. Token Refresh

**Endpoint:** `POST /api/auth/token/refresh/`  
**Authentication:** Not required  
**Description:** Refresh access token using refresh token

#### Request Payload
```json
{
  "refresh": "string (JWT refresh token)"
}
```

#### Response Payload
**Success (200 OK):**
```json
{
  "access": "string (new JWT access token)"
}
```

**Error (401 Unauthorized):**
```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

#### Example Request
```bash
curl -X POST http://127.0.0.1:8000/api/auth/token/refresh/ \
  -H "Content-Type: application/json" \
  -d '{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }'
```

---

### 4. User Logout

**Endpoint:** `POST /api/auth/logout/`  
**Authentication:** Required (Bearer token)  
**Description:** Logout user and blacklist refresh token

#### Request Payload
```json
{
  "refresh": "string (JWT refresh token)"
}
```

#### Response Payload
**Success (200 OK):**
```json
{
  "detail": "Successfully logged out"
}
```

#### Example Request
```bash
curl -X POST http://127.0.0.1:8000/api/auth/logout/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -d '{
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  }'
```

## Status Codes

- **200 OK** - Request successful
- **201 Created** - User successfully registered
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Invalid credentials or token
- **422 Unprocessable Entity** - Validation errors

## Notes

1. **Token Expiry**: Access tokens expire after 5 minutes, refresh tokens after 1 day
2. **Password Requirements**: Minimum 8 characters, must pass Django's password validation
3. **Email Validation**: Must be a valid email format and unique in the system
4. **Profile Creation**: User profile is automatically created upon registration via Django signals
