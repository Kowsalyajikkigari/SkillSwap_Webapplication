# Data Models Reference

This document provides a comprehensive reference for all data models used in the SkillSwap API.

## User Models

### User
**Description:** Custom user model with email as the unique identifier.

```json
{
  "id": "integer (auto-generated)",
  "email": "string (unique, required, max 254 chars)",
  "first_name": "string (required, max 150 chars)",
  "last_name": "string (required, max 150 chars)",
  "avatar": "string (URL, nullable, image file)",
  "bio": "string (optional, text field)",
  "location": "string (optional, max 100 chars)",
  "member_since": "datetime (auto-generated)",
  "is_active": "boolean (default: true)",
  "is_staff": "boolean (default: false)",
  "is_superuser": "boolean (default: false)",
  "last_login": "datetime (nullable)",
  "date_joined": "datetime (auto-generated)"
}
```

**Validation Rules:**
- Email must be valid format and unique
- First name and last name are required
- Avatar must be image file (JPEG, PNG, GIF)
- Bio can contain any text content

### Profile
**Description:** Extended profile information for users.

```json
{
  "id": "integer (auto-generated)",
  "user": "integer (foreign key to User, unique)",
  "level": "integer (default: 1, read-only)",
  "points": "integer (default: 0, read-only)",
  "sessions_completed": "integer (default: 0, read-only)",
  "average_rating": "decimal (default: 0.0, precision: 3, scale: 2, read-only)",
  "available_weekdays": "boolean (default: true)",
  "available_weekends": "boolean (default: true)",
  "available_mornings": "boolean (default: false)",
  "available_afternoons": "boolean (default: true)",
  "available_evenings": "boolean (default: true)"
}
```

**Notes:**
- Profile is automatically created when user registers
- Level, points, sessions_completed, and average_rating are calculated fields
- Availability preferences can be updated by user

## Skills Models

### SkillCategory
**Description:** Categories for organizing skills.

```json
{
  "id": "integer (auto-generated)",
  "name": "string (required, max 100 chars)",
  "description": "string (optional, text field)",
  "icon": "string (optional, max 50 chars, CSS class or icon name)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

### Skill
**Description:** Individual skills that can be taught or learned.

```json
{
  "id": "integer (auto-generated)",
  "name": "string (required, max 100 chars)",
  "description": "string (optional, text field)",
  "category": "integer (foreign key to SkillCategory, required)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

### UserSkill
**Description:** Skills that users can teach.

```json
{
  "id": "integer (auto-generated)",
  "user": "integer (foreign key to User, required)",
  "skill": "integer (foreign key to Skill, required)",
  "level": "string (required, choices: beginner|intermediate|advanced|expert)",
  "description": "string (optional, text field)",
  "years_experience": "integer (default: 0, min: 0)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

**Constraints:**
- Unique together: user + skill (user cannot have duplicate teaching skills)

### UserLearningSkill
**Description:** Skills that users want to learn.

```json
{
  "id": "integer (auto-generated)",
  "user": "integer (foreign key to User, required)",
  "skill": "integer (foreign key to Skill, required)",
  "current_level": "string (required, choices: beginner|intermediate|advanced)",
  "goal": "string (optional, text field)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

**Constraints:**
- Unique together: user + skill (user cannot have duplicate learning skills)

## Session Models

### SessionRequest
**Description:** Requests for skill exchange sessions.

```json
{
  "id": "integer (auto-generated)",
  "requester": "integer (foreign key to User, required)",
  "provider": "integer (foreign key to User, required)",
  "skill": "integer (foreign key to Skill, required)",
  "message": "string (required, text field)",
  "proposed_date": "date (optional, YYYY-MM-DD)",
  "proposed_time": "time (optional, HH:MM:SS)",
  "session_type": "string (choices: virtual|in_person, default: virtual)",
  "location": "string (optional, max 200 chars)",
  "status": "string (choices: pending|accepted|declined, default: pending)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

### Session
**Description:** Confirmed skill exchange sessions.

```json
{
  "id": "integer (auto-generated)",
  "requester": "integer (foreign key to User, required)",
  "provider": "integer (foreign key to User, required)",
  "skill": "integer (foreign key to Skill, required)",
  "title": "string (required, max 200 chars)",
  "description": "string (optional, text field)",
  "date": "date (optional, YYYY-MM-DD)",
  "start_time": "time (optional, HH:MM:SS)",
  "end_time": "time (optional, HH:MM:SS)",
  "duration_minutes": "integer (default: 60, min: 1)",
  "session_type": "string (choices: virtual|in_person, default: virtual)",
  "location": "string (optional, max 200 chars)",
  "meeting_link": "string (optional, URL)",
  "status": "string (choices: pending|confirmed|completed|cancelled, default: pending)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

### SessionFeedback
**Description:** Feedback for completed sessions.

```json
{
  "id": "integer (auto-generated)",
  "session": "integer (foreign key to Session, required)",
  "user": "integer (foreign key to User, required, feedback giver)",
  "recipient": "integer (foreign key to User, required, feedback receiver)",
  "rating": "integer (required, choices: 1|2|3|4|5)",
  "comment": "string (optional, text field)",
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

**Constraints:**
- Unique together: session + user (user can only give one feedback per session)

## Messaging Models

### Conversation
**Description:** Conversations between users.

```json
{
  "id": "integer (auto-generated)",
  "participants": ["integer"] // Array of User IDs (many-to-many),
  "created_at": "datetime (auto-generated)",
  "updated_at": "datetime (auto-updated)"
}
```

**Computed Properties:**
- `last_message`: Returns the most recent message in the conversation
- `unread_count`: Number of unread messages for current user

### Message
**Description:** Messages within conversations.

```json
{
  "id": "integer (auto-generated)",
  "conversation": "integer (foreign key to Conversation, required)",
  "sender": "integer (foreign key to User, required)",
  "content": "string (required, text field)",
  "is_read": "boolean (default: false)",
  "created_at": "datetime (auto-generated)"
}
```

### Attachment
**Description:** File attachments for messages.

```json
{
  "id": "integer (auto-generated)",
  "message": "integer (foreign key to Message, required)",
  "file": "string (file path, required)",
  "file_name": "string (max 255 chars, auto-populated)",
  "file_type": "string (max 100 chars, auto-populated)",
  "created_at": "datetime (auto-generated)"
}
```

## Relationship Diagrams

### User Relationships
```
User (1) ←→ (1) Profile
User (1) ←→ (N) UserSkill
User (1) ←→ (N) UserLearningSkill
User (1) ←→ (N) SessionRequest (as requester)
User (1) ←→ (N) SessionRequest (as provider)
User (1) ←→ (N) Session (as requester)
User (1) ←→ (N) Session (as provider)
User (1) ←→ (N) SessionFeedback (as user)
User (1) ←→ (N) SessionFeedback (as recipient)
User (N) ←→ (N) Conversation (participants)
User (1) ←→ (N) Message (as sender)
```

### Skills Relationships
```
SkillCategory (1) ←→ (N) Skill
Skill (1) ←→ (N) UserSkill
Skill (1) ←→ (N) UserLearningSkill
Skill (1) ←→ (N) SessionRequest
Skill (1) ←→ (N) Session
```

### Sessions Relationships
```
SessionRequest (1) → (0..1) Session (created when accepted)
Session (1) ←→ (N) SessionFeedback
```

### Messaging Relationships
```
Conversation (1) ←→ (N) Message
Message (1) ←→ (N) Attachment
```

## Field Types Reference

### String Fields
- **CharField**: Fixed maximum length string
- **TextField**: Unlimited length text
- **EmailField**: Email validation
- **URLField**: URL validation

### Numeric Fields
- **IntegerField**: 32-bit integer
- **PositiveIntegerField**: Positive integer only
- **DecimalField**: Fixed precision decimal

### Date/Time Fields
- **DateTimeField**: Date and time
- **DateField**: Date only
- **TimeField**: Time only

### Boolean Fields
- **BooleanField**: True/False values

### File Fields
- **ImageField**: Image files with validation
- **FileField**: Any file type

### Relationship Fields
- **ForeignKey**: One-to-many relationship
- **ManyToManyField**: Many-to-many relationship
- **OneToOneField**: One-to-one relationship

## Validation Rules Summary

1. **Email uniqueness**: User emails must be unique across the system
2. **Skill uniqueness**: Users cannot have duplicate teaching or learning skills
3. **Session feedback**: Users can only provide one feedback per session
4. **File size limits**: Avatar (5MB), Attachments (10MB)
5. **Choice fields**: Must select from predefined options
6. **Required fields**: Cannot be null or empty
7. **Positive integers**: Must be >= 0 where specified
