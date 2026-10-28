# Comment Flow

## Fetch Comments Flow

User opens article page

↓

Article Comment Component

↓

useComments Hook

↓

React Query

↓

comment.service

↓

comment.api

↓

GET `/api/articles/{slug}/comments/`

↓

Backend

↓

Comment API Response

↓

comment.service

↓

mapComment()

↓

Comment Domain Model

↓

React Query Cache

↓

Comment Components

---

## Fetch Replies Flow

User requests comment replies

↓

Reply List Component

↓

useCommentReplies Hook

↓

React Query

↓

comment.service

↓

comment.api

↓

GET `/api/comments/{commentId}/replies/`

↓

Backend

↓

Replies API Response

↓

comment.service

↓

mapComment()

↓

Comment Domain Models

↓

React Query Cache

↓

Reply Components

---

## Create Comment Flow

User writes comment

↓

Comment Form Component

↓

Zod Validation

↓

useCreateComment Hook

↓

React Query Mutation

↓

comment.service

↓

submitComment()

↓

comment.api

↓

POST `/api/comments/`

↓

Backend

↓

Create Comment Response

↓

comment.service

↓

mapComment()

↓

Mutation Success

↓

Invalidate Comment Query

↓

Refetch Comments

↓

Updated Comment List

---

## Create Reply Flow

User writes reply

↓

Reply Form Component

↓

Zod Validation

↓

useCreateReply Hook

↓

React Query Mutation

↓

comment.service

↓

submitComment()

↓

comment.api

↓

POST `/api/comments/`

↓

Backend

↓

Create Reply Response

↓

comment.service

↓

mapComment()

↓

Mutation Success

↓

Invalidate Reply Query

↓

Refetch Replies

↓

Updated Reply List

---

## Data Transformation Flow

Backend Comment Response:

```ts
{
  author_name: "Ali",
  created_at: "2026-01-01",
  approved: 1
}
```

↓

comment.mapper.ts

↓

Frontend Domain Model:

```ts
{
  authorName: "Ali",
  createdAt: "2026-01-01",
  approved: true
}
```

## Cache Strategy

Comments and replies are managed by React Query.

Query keys:

```ts
COMMENT_QUERY_KEYS.article(slug);

COMMENT_QUERY_KEYS.replies(commentId);
```

After successful mutations:

Creating a comment invalidates the article comments cache.
Creating a reply invalidates the comment replies cache.

This keeps the UI synchronized with the latest Backend data.
