# FAQ API Contract

## Get FAQ List

### Endpoint

GET `/api/faqs/`

### Response

```json
[
  {
    "id": 1,
    "question": "...",
    "answer": "...",
    "slug": "shipping",
    "tags": "shipping,order",
    "status": 1,
    "created_at": "2026-07-13T10:00:00Z"
  }
]
```

---

## Get FAQ By Slug

### Endpoint

GET `/api/faqs/{slug}`

### Response

```json
{
  "id": 1,
  "question": "...",
  "answer": "...",
  "slug": "shipping",
  "tags": "shipping,order",
  "status": 1,
  "created_at": "2026-07-13T10:00:00Z"
}
```

---

## Domain Mapping

Backend Model

```text
created_at
status
tags(string)
```

Frontend Model

```text
createdAt
status(boolean)
tags(string[])
```

تمام تبدیل‌ها در `faq.mapper.ts` انجام می‌شوند و API Layer هیچ تغییری روی Response اعمال نمی‌کند.
