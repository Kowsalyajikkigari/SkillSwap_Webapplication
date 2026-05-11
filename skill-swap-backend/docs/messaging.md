# Messaging APIs

Base URL: `http://127.0.0.1:8000/api/messages/`

## Overview

Messaging endpoints handle conversations and messages between users. The system supports real-time messaging with file attachments and read status tracking.

## Endpoints

### 1. Conversations

#### Get All Conversations
**Endpoint:** `GET /api/messages/conversations/`  
**Authentication:** Required  
**Description:** Get all conversations for the current user

**Query Parameters:**
- `search` - Search in participant names and emails

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "participants": ["integer", "integer"],
    "participants_details": [
      {
        "id": "integer",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "avatar": "string (URL, nullable)"
      }
    ],
    "created_at": "datetime",
    "updated_at": "datetime",
    "last_message_content": {
      "id": "integer",
      "content": "string",
      "sender_id": "integer",
      "created_at": "datetime",
      "is_read": "boolean"
    },
    "unread_count": "integer"
  }
]
```

#### Get Single Conversation
**Endpoint:** `GET /api/messages/conversations/{id}/`  
**Authentication:** Required  
**Description:** Get conversation details with all messages

**Response (200 OK):**
```json
{
  "id": "integer",
  "participants": ["integer", "integer"],
  "participants_details": [
    {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    }
  ],
  "created_at": "datetime",
  "updated_at": "datetime",
  "messages": [
    {
      "id": "integer",
      "conversation": "integer",
      "sender": "integer",
      "sender_details": {
        "id": "integer",
        "email": "string",
        "first_name": "string",
        "last_name": "string",
        "avatar": "string (URL, nullable)"
      },
      "content": "string",
      "is_read": "boolean",
      "created_at": "datetime",
      "attachments": [
        {
          "id": "integer",
          "file": "string (URL)",
          "file_name": "string",
          "file_type": "string",
          "created_at": "datetime"
        }
      ]
    }
  ]
}
```

#### Create Conversation
**Endpoint:** `POST /api/messages/conversations/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "participants": ["integer"] // Array of user IDs (excluding current user)
}
```

**Response (201 Created):**
```json
{
  "id": "integer",
  "participants": ["integer", "integer"],
  "participants_details": [ ... ],
  "created_at": "datetime",
  "updated_at": "datetime",
  "last_message_content": null,
  "unread_count": 0
}
```

#### Update Conversation
**Endpoint:** `PUT /api/messages/conversations/{id}/`  
**Authentication:** Required

#### Delete Conversation
**Endpoint:** `DELETE /api/messages/conversations/{id}/`  
**Authentication:** Required

#### Get Conversation Messages
**Endpoint:** `GET /api/messages/conversations/{id}/messages/`  
**Authentication:** Required  
**Description:** Get all messages for a conversation and mark them as read

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "conversation": "integer",
    "sender": "integer",
    "sender_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "content": "string",
    "is_read": "boolean",
    "created_at": "datetime",
    "attachments": [
      {
        "id": "integer",
        "file": "string (URL)",
        "file_name": "string",
        "file_type": "string",
        "created_at": "datetime"
      }
    ]
  }
]
```

#### Start Conversation with User
**Endpoint:** `POST /api/messages/conversations/start_with_user/`  
**Authentication:** Required  
**Description:** Start or get existing conversation with a specific user

**Request Payload:**
```json
{
  "user_id": "integer (required)"
}
```

**Response (200 OK or 201 Created):**
```json
{
  "id": "integer",
  "participants": ["integer", "integer"],
  "participants_details": [ ... ],
  "created_at": "datetime",
  "updated_at": "datetime",
  "last_message_content": { ... },
  "unread_count": "integer"
}
```

---

### 2. Messages

#### Get All Messages
**Endpoint:** `GET /api/messages/messages/`  
**Authentication:** Required  
**Description:** Get all messages from user's conversations

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "conversation": "integer",
    "sender": "integer",
    "sender_details": {
      "id": "integer",
      "email": "string",
      "first_name": "string",
      "last_name": "string",
      "avatar": "string (URL, nullable)"
    },
    "content": "string",
    "is_read": "boolean",
    "created_at": "datetime",
    "attachments": [
      {
        "id": "integer",
        "file": "string (URL)",
        "file_name": "string",
        "file_type": "string",
        "created_at": "datetime"
      }
    ]
  }
]
```

#### Get Single Message
**Endpoint:** `GET /api/messages/messages/{id}/`  
**Authentication:** Required

#### Create Message
**Endpoint:** `POST /api/messages/messages/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "conversation": "integer (required)",
  "content": "string (required)",
  "attachments": ["file", "file"] // Optional array of files
}
```

**Response (201 Created):**
```json
{
  "id": "integer",
  "conversation": "integer",
  "sender": "integer",
  "sender_details": { ... },
  "content": "string",
  "is_read": false,
  "created_at": "datetime",
  "attachments": [
    {
      "id": "integer",
      "file": "string (URL)",
      "file_name": "string",
      "file_type": "string",
      "created_at": "datetime"
    }
  ]
}
```

#### Update Message
**Endpoint:** `PUT /api/messages/messages/{id}/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "content": "string (optional)"
}
```

#### Delete Message
**Endpoint:** `DELETE /api/messages/messages/{id}/`  
**Authentication:** Required

---

### 3. File Attachments

File attachments are handled as part of message creation. When creating a message with attachments:

1. Use `multipart/form-data` content type
2. Include files in the `attachments` field
3. Supported file types: images, documents, archives
4. Maximum file size: 10MB per file
5. Files are stored in `media/message_attachments/`

#### Example with Attachments
```bash
curl -X POST http://127.0.0.1:8000/api/messages/messages/ \
  -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..." \
  -F "conversation=1" \
  -F "content=Here's the document you requested" \
  -F "attachments=@document.pdf" \
  -F "attachments=@image.jpg"
```

## Real-time Features

The messaging system supports real-time updates through WebSocket connections:

1. **WebSocket URL**: `ws://127.0.0.1:8000/ws/chat/{conversation_id}/`
2. **Authentication**: Include JWT token in WebSocket headers
3. **Message Format**: JSON with message data
4. **Events**: New messages, read status updates, typing indicators

### WebSocket Message Format
```json
{
  "type": "message",
  "data": {
    "id": "integer",
    "conversation_id": "integer",
    "sender_id": "integer",
    "content": "string",
    "created_at": "datetime"
  }
}
```

## Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Resource deleted successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Permission denied (not a conversation participant)
- **404 Not Found** - Resource not found
- **413 Payload Too Large** - File attachment too large

## Notes

1. **Conversation Participants**: Users are automatically added to conversations they create
2. **Message Read Status**: Messages are marked as read when conversation messages are retrieved
3. **File Attachments**: Automatically extract file name and type from uploaded files
4. **Real-time Updates**: New messages trigger WebSocket notifications to all participants
5. **Search Functionality**: Conversations can be searched by participant names and emails
6. **Unread Count**: Automatically calculated excluding messages sent by the current user
