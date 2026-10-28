# Comment Architecture Decisions

## API and Domain Model Separation

Decision:

Backend response models are separated from Frontend domain models.

Reason:

- Prevent direct dependency on Backend response structure
- Keep Components independent from API contracts
- Make future API changes easier to handle

Example:

Backend:

```ts
{
  author_name: "Ali",
  created_at: "2026-01-01",
  approved: 1
}
```

↓

Frontend:

```ts
{
  authorName: "Ali",
  createdAt: "2026-01-01",
  approved: true
}
```

## Mapper Usage

Decision:

All data transformations are handled inside Mapper functions.

Reason:

Centralize transformation logic
Avoid duplicate conversion logic in Components
Keep UI Components focused on rendering

## Service Layer Separation

Decision:

API Layer only handles HTTP communication.

Service Layer is responsible for:

Calling API methods
Applying Mapper functions
Preparing data for Hooks

Reason:

Clear separation of responsibilities
Easier testing
Better maintainability

## React Query for Server State

Decision:

React Query is used for managing comments and replies server state.

Reason:

Built-in caching
Automatic refetching
Query invalidation after mutations
Better synchronization with Backend data

## Query Invalidation Strategy

Decision:

After creating a comment or reply, related queries are invalidated.

Rules:

Creating a comment invalidates article comments query.
Creating a reply invalidates replies query.

Reason:

Keep UI data synchronized
Avoid manual state updates
Ensure latest Backend data is displayed

## Payload Separation

Decision:

Request Payloads are separated from API Response Types.

Example:

Response Type:

```ts
CommentApiResponse;
```

Request Payload:

```ts
CreateCommentPayload;
```

Reason:

- Request and Response structures may be different
- Prevent incorrect data usage
- Improve TypeScript type safety

## Form Validation

Decision:

Comment input validation is handled using Zod schemas.

Rules:

Comment text minimum length: 3 characters
Comment text maximum length: 1000 characters

Reason:

Validate user input before sending requests
Keep validation rules centralized
Improve user experience

## Recursive Reply Structure

Decision:

Comments support nested replies through parent-child relationships.

Reason:

Backend provides parent information
Mapper converts replies into nested Comment models
Components can recursively render reply structures
