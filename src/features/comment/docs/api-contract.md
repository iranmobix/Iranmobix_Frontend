# Comment API Contract

## Get Article Comments

### Endpoint

GET `/api/articles/{slug}/comments/`

---

## Request

Path Parameter:

```text
slug: string
```

Example:

```text
/api/articles/react-guide/comments/
```

---

## Response

```json
[
  {
    "id": 1,
    "body": "Great article",
    "parent": null,
    "author": 10,
    "author_name": "Ali",
    "commentable_type": "article",
    "commentable_id": 5,
    "status": 1,
    "seen": 1,
    "approved": 1,
    "created_at": "2026-01-01",
    "replies": []
  }
]
```

---

## Create Comment

### Endpoint

POST `/api/comments/`

---

## Payload

```json
{
  "body": "My comment text",
  "commentable_type": "article",
  "object_id": 5
}
```

---

## Create Reply Payload

Replies use the same endpoint with `parent_id`.

```json
{
  "body": "Reply text",
  "commentable_type": "article",
  "object_id": 5,
  "parent_id": 1
}
```

---

## Response

```json
{
  "id": 2,
  "body": "Reply text",
  "parent": 1,
  "author": 10,
  "author_name": "Ali",
  "commentable_type": "article",
  "commentable_id": 5,
  "status": 1,
  "seen": 0,
  "approved": 1,
  "created_at": "2026-01-01",
  "replies": []
}
```

---

## Get Comment Replies

### Endpoint

GET `/api/comments/{commentId}/replies/`

---

## Request

Path Parameter:

```text
commentId: number
```

Example:

```text
/api/comments/1/replies/
```

---

## Response

```json
[
  {
    "id": 2,
    "body": "Reply text",
    "parent": 1,
    "author": 10,
    "author_name": "Ali",
    "commentable_type": "article",
    "commentable_id": 5,
    "status": 1,
    "seen": 0,
    "approved": 1,
    "created_at": "2026-01-01",
    "replies": []
  }
]
```

---

## API Response Model

Backend Response:

```ts
interface CommentApiResponse {
  id: number;
  body: string;
  parent: number | null;
  author: number;
  author_name: string;
  commentable_type: string;
  commentable_id: number;
  status: number;
  seen: number;
  approved: number;
  created_at: string;
  replies: CommentApiResponse[] | string;
}
```

---

## Payload Model

Data sent to Backend:

```ts
interface CreateCommentPayload {
  body: string;
  commentable_type: "article";
  object_id: number;
  parent_id?: number;
}
```

---

## Domain Model Transformation

Backend responses are transformed using `comment.mapper.ts`.

Mapping examples:

| Backend Field | Frontend Field   |
| ------------- | ---------------- |
| `author_name` | `authorName`     |
| `created_at`  | `createdAt`      |
| `parent: 0`   | `parentId: null` |
| `approved: 1` | `approved: true` |
| `replies`     | `Comment[]`      |

---

## API Layer Responsibility

The API layer only handles HTTP communication.

It does not:

- Transform response data
- Apply business logic
- Manage React Query state
- Handle UI logic
