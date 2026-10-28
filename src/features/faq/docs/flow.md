# FAQ Flow

## Load FAQ List

User

↓

useFaqs

↓

faq.service

↓

faq.api

↓

GET /api/faqs/

↓

Backend

↓

FAQ Response

↓

mapFaqList

↓

React Query Cache

↓

Components

---

## Load FAQ Detail

User

↓

useFaq

↓

faq.service

↓

faq.api

↓

GET /api/faqs/{slug}

↓

Backend

↓

mapFaq

↓

React Query Cache

↓

Component

---

## Search Flow

User Types

↓

useFaqController

↓

useDebounce (300ms)

↓

React Query Cache

↓

Filter

- question
- answer
- tags

↓

Filtered FAQ List

هیچ Request جدیدی هنگام جستجو به Backend ارسال نمی‌شود.
