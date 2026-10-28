# Comment Architecture

## Folder Structure

comment
│
├── api
│ └── comments.api.ts
│
├── services
│ └── comment.service.ts
│
├── hooks
│ ├── use-comments.ts
│ ├── use-comment-replies.ts
│ ├── use-create-comment.ts
│ └── use-create-reply.ts
│
├── mappers
│ └── comment.mapper.ts
│
├── schemas
│ └── comment.schema.ts
│
├── constants
│ └── comment.keys.ts
│
├── types
│ ├── comment.api.types.ts
│ ├── comment.payload.types.ts
│ └── comment.types.ts
│
└── components
│ ├── comment-form.tsx
│ ├── comment-item.tsx
│ ├── comment-list.tsx
│ └── reply-list.tsx

---

## Layer Responsibilities

### API Layer

Responsible for:

- Sending HTTP requests
- Receiving Backend responses
- Direct communication with Comment API endpoints

Endpoints handled by this layer:

- Get article comments
- Create comment
- Get comment replies

Should not contain:

- Business Logic
- Data Transformation
- React Query Logic
- UI Logic

---

### Service Layer

Responsible for:

- Coordinating API calls
- Using Mapper functions
- Converting API responses into Domain Models
- Preparing data for Hooks

The Service layer acts as a bridge between API communication and Application usage.

---

### Mapper Layer

Responsible for:

- Transforming Backend Response Models into Frontend Domain Models
- Separating Backend contracts from UI models

Example:

Backend:

```ts
{
  author_name: "Ali",
  created_at: "2026-01-01",
  approved: 1
}


↓

Frontend:
{
authorName: "Ali",
createdAt: "2026-01-01",
approved: true
}
```

### Type Layer

The Feature separates different data models:

#### API Types

Represents Backend response structure.

Example:

CommentApiResponse

#### Payload Types

Represents data sent to Backend.

Example:

CreateCommentPayload

#### Domain Types

Represents the model consumed by Frontend Components.

Example:

Comment

### Hook Layer

Responsible for:

Connecting React Query
Managing server state
Managing Queries and Mutations
Handling Cache invalidation
Providing data and actions to Components

Queries:

Fetch comments
Fetch replies

Mutations:

Create comment
Create reply

### Schema Layer

Responsible for:

Validating user input
Defining form rules using Zod
Providing validated form types

Example:

Comment body validation:

Minimum length: 3 characters
Maximum length: 1000 characters

### Component Layer

Responsible for:

Rendering comment UI
Displaying comment lists
Rendering replies
Handling user interactions

Components consume Domain Models and do not depend on Backend API structures.
