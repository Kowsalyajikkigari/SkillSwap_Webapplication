# Skills APIs

Base URL: `http://127.0.0.1:8000/api/skills/`

## Overview

Skills management endpoints handle skill categories, individual skills, user teaching skills, and user learning skills. These endpoints support the core skill-swapping functionality.

## Endpoints

### 1. Skill Categories

#### Get All Categories
**Endpoint:** `GET /api/skills/categories/`  
**Authentication:** Not required  
**Description:** Retrieve all skill categories

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "name": "string",
    "description": "string",
    "icon": "string (CSS class or icon name)",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Get Single Category
**Endpoint:** `GET /api/skills/categories/{id}/`  
**Authentication:** Not required

**Response (200 OK):**
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "icon": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### 2. Skills

#### Get All Skills
**Endpoint:** `GET /api/skills/all/`  
**Authentication:** Not required  
**Description:** Retrieve all available skills with filtering and search

**Query Parameters:**
- `search` - Search in skill name and description
- `category` - Filter by category ID

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "name": "string",
    "description": "string",
    "category": "integer (category ID)",
    "category_name": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Get Single Skill
**Endpoint:** `GET /api/skills/all/{id}/`  
**Authentication:** Not required

**Response (200 OK):**
```json
{
  "id": "integer",
  "name": "string",
  "description": "string",
  "category": "integer",
  "category_name": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Get Skills by Category
**Endpoint:** `GET /api/skills/all/by_category/`  
**Authentication:** Not required  
**Description:** Get skills grouped by category

**Response (200 OK):**
```json
{
  "Programming": [
    {
      "id": 1,
      "name": "Python",
      "description": "Python programming language",
      "category": 1,
      "category_name": "Programming"
    }
  ],
  "Design": [
    {
      "id": 5,
      "name": "UI/UX Design",
      "description": "User interface and experience design",
      "category": 2,
      "category_name": "Design"
    }
  ]
}
```

---

### 3. User Teaching Skills

#### Get User's Teaching Skills
**Endpoint:** `GET /api/skills/teaching/`  
**Authentication:** Required  
**Description:** Get skills that the current user can teach

**Query Parameters:**
- `search` - Search in skill name and description
- `level` - Filter by skill level (beginner, intermediate, advanced, expert)
- `skill__category` - Filter by skill category ID

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "user": "integer",
    "skill": "integer (skill ID)",
    "skill_name": "string",
    "category_name": "string",
    "level": "string (beginner|intermediate|advanced|expert)",
    "description": "string",
    "years_experience": "integer",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Add Teaching Skill
**Endpoint:** `POST /api/skills/teaching/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "skill": "integer (required, skill ID)",
  "level": "string (required, beginner|intermediate|advanced|expert)",
  "description": "string (optional)",
  "years_experience": "integer (optional, default: 0)"
}
```

**Response (201 Created):**
```json
{
  "id": "integer",
  "user": "integer",
  "skill": "integer",
  "skill_name": "string",
  "category_name": "string",
  "level": "string",
  "description": "string",
  "years_experience": "integer",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Update Teaching Skill
**Endpoint:** `PUT /api/skills/teaching/{id}/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "skill": "integer (optional)",
  "level": "string (optional)",
  "description": "string (optional)",
  "years_experience": "integer (optional)"
}
```

#### Delete Teaching Skill
**Endpoint:** `DELETE /api/skills/teaching/{id}/`  
**Authentication:** Required

**Response (204 No Content)**

#### Get Detailed Teaching Skills
**Endpoint:** `GET /api/skills/teaching/detailed/`  
**Authentication:** Required  
**Description:** Get teaching skills with complete skill information

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "user": "integer",
    "skill": {
      "id": "integer",
      "name": "string",
      "description": "string",
      "category": "integer",
      "category_name": "string"
    },
    "level": "string",
    "description": "string",
    "years_experience": "integer",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

---

### 4. User Learning Skills

#### Get User's Learning Skills
**Endpoint:** `GET /api/skills/learning/`  
**Authentication:** Required  
**Description:** Get skills that the current user wants to learn

**Query Parameters:**
- `search` - Search in skill name and goal
- `current_level` - Filter by current level (beginner, intermediate, advanced)
- `skill__category` - Filter by skill category ID

**Response (200 OK):**
```json
[
  {
    "id": "integer",
    "user": "integer",
    "skill": "integer",
    "skill_name": "string",
    "category_name": "string",
    "current_level": "string (beginner|intermediate|advanced)",
    "goal": "string",
    "created_at": "datetime",
    "updated_at": "datetime"
  }
]
```

#### Add Learning Skill
**Endpoint:** `POST /api/skills/learning/`  
**Authentication:** Required

**Request Payload:**
```json
{
  "skill": "integer (required, skill ID)",
  "current_level": "string (required, beginner|intermediate|advanced)",
  "goal": "string (optional)"
}
```

**Response (201 Created):**
```json
{
  "id": "integer",
  "user": "integer",
  "skill": "integer",
  "skill_name": "string",
  "category_name": "string",
  "current_level": "string",
  "goal": "string",
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

#### Update Learning Skill
**Endpoint:** `PUT /api/skills/learning/{id}/`  
**Authentication:** Required

#### Delete Learning Skill
**Endpoint:** `DELETE /api/skills/learning/{id}/`  
**Authentication:** Required

#### Get Detailed Learning Skills
**Endpoint:** `GET /api/skills/learning/detailed/`  
**Authentication:** Required

## Status Codes

- **200 OK** - Request successful
- **201 Created** - Resource created successfully
- **204 No Content** - Resource deleted successfully
- **400 Bad Request** - Invalid request data
- **401 Unauthorized** - Authentication required
- **403 Forbidden** - Permission denied
- **404 Not Found** - Resource not found
- **409 Conflict** - Duplicate skill (user already has this skill)

## Notes

1. **Unique Constraints**: Users cannot have duplicate teaching or learning skills
2. **Level Choices**: Teaching skills support 4 levels, learning skills support 3 levels
3. **Auto-populated Fields**: `skill_name` and `category_name` are automatically populated
4. **Search Functionality**: Supports full-text search across skill names and descriptions
