# FAQ Architecture

## Folder Structure

faq
│
├── api
│ └── faq.api.ts
│
├── services
│ └── faq.service.ts
│
├── hooks
│ ├── useFaq.ts
│ ├── useFaqs.ts
│ ├── useFaqController.ts
│ └── useDebounce.ts
│
├── mappers
│ └── faq.mapper.ts
│
├── types
│ ├── faq.api.types.ts
│ └── faq.types.ts
│
├── constants
│ └── faq-query-keys.ts
│
└── components
├── faq-list.tsx
├── faq-item.tsx
├── faq-search.tsx
└── faq-search-input.tsx

---

## Layer Responsibilities

### API Layer

Responsible for:

- Sending Requests
- Receiving Responses
- Direct communication with Backend

Should not contain:

- Business Logic
- Data Mapping
- State Management

---

### Service Layer

Responsible for:

- Coordinating between API and Application layers
- Using Mappers
- Preparing data for Hooks

---

### Mapper Layer

Responsible for:

- Transforming Backend Responses into Domain Models

Example transformation:

Backend:

```text
created_at
```
