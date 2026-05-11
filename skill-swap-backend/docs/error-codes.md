# Error Codes and Responses

This document outlines the standard error responses and codes used throughout the SkillSwap API.

## Standard Error Response Format

All API errors follow a consistent JSON format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field_name": ["Specific field error message"]
  }
}
```

## HTTP Status Codes

### 400 Bad Request
**Description:** The request was invalid or cannot be served.

**Common Scenarios:**
- Missing required fields
- Invalid data format
- Validation errors

**Example Response:**
```json
{
  "email": ["This field is required."],
  "password": ["Password fields didn't match."]
}
```

### 401 Unauthorized
**Description:** Authentication is required and has failed or has not been provided.

**Common Scenarios:**
- Missing authentication token
- Invalid or expired token
- Invalid login credentials

**Example Responses:**
```json
{
  "detail": "Authentication credentials were not provided."
}
```

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid",
  "messages": [
    {
      "token_class": "AccessToken",
      "token_type": "access",
      "message": "Token is invalid or expired"
    }
  ]
}
```

```json
{
  "detail": "No active account found with the given credentials"
}
```

### 403 Forbidden
**Description:** The request is understood but access is denied.

**Common Scenarios:**
- User doesn't have permission to access resource
- Trying to modify another user's data
- Provider-only or participant-only actions

**Example Responses:**
```json
{
  "detail": "Only the provider can accept this request."
}
```

```json
{
  "detail": "You can only provide feedback for sessions you participated in."
}
```

### 404 Not Found
**Description:** The requested resource could not be found.

**Common Scenarios:**
- Invalid resource ID
- Resource has been deleted
- User doesn't have access to resource

**Example Response:**
```json
{
  "detail": "Not found."
}
```

### 409 Conflict
**Description:** The request conflicts with the current state of the resource.

**Common Scenarios:**
- Duplicate skill assignment
- Email already exists during registration
- Attempting to modify resource in invalid state

**Example Responses:**
```json
{
  "detail": "User with this email already exists."
}
```

```json
{
  "detail": "Cannot accept a request with status 'declined'."
}
```

### 413 Payload Too Large
**Description:** The request payload is larger than the server is willing to process.

**Common Scenarios:**
- File upload exceeds size limit
- Request body too large

**Example Response:**
```json
{
  "detail": "File size exceeds maximum allowed size of 10MB."
}
```

### 422 Unprocessable Entity
**Description:** The request was well-formed but contains semantic errors.

**Common Scenarios:**
- Validation errors
- Business logic violations
- Invalid field combinations

**Example Response:**
```json
{
  "non_field_errors": ["Password fields didn't match."]
}
```

### 500 Internal Server Error
**Description:** A generic error message when an unexpected condition was encountered.

**Example Response:**
```json
{
  "detail": "Internal server error. Please try again later."
}
```

## Authentication Error Codes

### TOKEN_NOT_VALID
**Status:** 401  
**Description:** The provided token is invalid, expired, or malformed.

```json
{
  "detail": "Given token not valid for any token type",
  "code": "token_not_valid"
}
```

### AUTHENTICATION_FAILED
**Status:** 401  
**Description:** Login credentials are incorrect.

```json
{
  "detail": "No active account found with the given credentials"
}
```

### TOKEN_EXPIRED
**Status:** 401  
**Description:** The access token has expired.

```json
{
  "detail": "Token is invalid or expired",
  "code": "token_not_valid"
}
```

## Validation Error Codes

### REQUIRED_FIELD
**Status:** 400  
**Description:** A required field is missing.

```json
{
  "email": ["This field is required."]
}
```

### INVALID_EMAIL
**Status:** 400  
**Description:** Email format is invalid.

```json
{
  "email": ["Enter a valid email address."]
}
```

### PASSWORD_MISMATCH
**Status:** 400  
**Description:** Password confirmation doesn't match.

```json
{
  "password": ["Password fields didn't match."]
}
```

### UNIQUE_CONSTRAINT
**Status:** 400  
**Description:** Value must be unique but already exists.

```json
{
  "email": ["User with this email already exists."]
}
```

### INVALID_CHOICE
**Status:** 400  
**Description:** Value is not a valid choice.

```json
{
  "level": ["Select a valid choice. expert is not one of the available choices."]
}
```

## Business Logic Error Codes

### PERMISSION_DENIED
**Status:** 403  
**Description:** User doesn't have permission for this action.

```json
{
  "detail": "Only session participants can mark it as completed."
}
```

### INVALID_STATE
**Status:** 400  
**Description:** Resource is in an invalid state for the requested action.

```json
{
  "detail": "Cannot complete a session with status 'cancelled'."
}
```

### DUPLICATE_RESOURCE
**Status:** 409  
**Description:** Resource already exists.

```json
{
  "detail": "You already have this skill in your teaching skills."
}
```

### RESOURCE_NOT_FOUND
**Status:** 404  
**Description:** Referenced resource doesn't exist.

```json
{
  "skill": ["Invalid pk \"999\" - object does not exist."]
}
```

## File Upload Error Codes

### FILE_TOO_LARGE
**Status:** 413  
**Description:** Uploaded file exceeds size limit.

```json
{
  "avatar": ["File size exceeds maximum allowed size of 5MB."]
}
```

### INVALID_FILE_TYPE
**Status:** 400  
**Description:** File type is not supported.

```json
{
  "avatar": ["File type not supported. Please upload a JPEG, PNG, or GIF image."]
}
```

## Rate Limiting Error Codes

### RATE_LIMIT_EXCEEDED
**Status:** 429  
**Description:** Too many requests in a given time period.

```json
{
  "detail": "Request was throttled. Expected available in 60 seconds."
}
```

## WebSocket Error Codes

### WS_AUTHENTICATION_FAILED
**Description:** WebSocket authentication failed.

```json
{
  "type": "error",
  "code": "authentication_failed",
  "message": "Invalid or missing authentication token"
}
```

### WS_PERMISSION_DENIED
**Description:** User doesn't have permission to join conversation.

```json
{
  "type": "error",
  "code": "permission_denied",
  "message": "You are not a participant in this conversation"
}
```

## Error Handling Best Practices

### For Frontend Developers

1. **Always check status codes** before processing response data
2. **Handle common errors gracefully** (401, 403, 404, 500)
3. **Display user-friendly messages** instead of raw error responses
4. **Implement retry logic** for 500 errors and network failures
5. **Validate data client-side** to reduce 400 errors

### Example Error Handling (JavaScript)

```javascript
try {
  const response = await fetch('/api/auth/login/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials)
  });

  if (!response.ok) {
    const errorData = await response.json();
    
    switch (response.status) {
      case 400:
        // Handle validation errors
        displayValidationErrors(errorData);
        break;
      case 401:
        // Handle authentication errors
        redirectToLogin();
        break;
      case 500:
        // Handle server errors
        showErrorMessage('Server error. Please try again later.');
        break;
      default:
        showErrorMessage('An unexpected error occurred.');
    }
    return;
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  // Handle network errors
  showErrorMessage('Network error. Please check your connection.');
}
```

## Support

If you encounter errors not documented here or need clarification on error handling, please contact the development team.
