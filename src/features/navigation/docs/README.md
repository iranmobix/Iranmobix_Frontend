# Navigation Feature

## Overview

This Feature is responsible for fetching, transforming, and rendering the application navigation menu.

Navigation data is received from the Backend as a flat list structure, transformed into a hierarchical tree structure using a Mapper, and then consumed by UI Components through React Query.

The same navigation data model is shared between Desktop and Mobile navigation renderers.

---

## Responsibilities

This Feature is responsible for:

- Fetching navigation menu items from Backend
- Transforming Backend navigation response into Frontend Domain Model
- Building nested parent-child navigation tree
- Managing navigation data fetching through React Query
- Providing navigation data for Desktop and Mobile UI
- Rendering recursive navigation items

---

## Public API

This Feature exposes required functionality for other parts of the application through the `index.ts` file.

---

## Data Flow

Backend

↓

API Layer

↓

Service Layer

↓

Mapper Layer

↓

Navigation Domain Model

↓

React Query

↓

Navigation Components

---

## Tech Stack

- React Query
- TypeScript
- Axios HTTP Client
- Feature-Based Architecture
- TanStack Query
- Next.js Link
- React Hooks

---

## Navigation Strategy

The Backend provides navigation items as a flat list.

The Frontend is responsible for converting this structure into a tree-based navigation model using the Mapper layer.

Example:

Backend Response:

```text
Products
Phones (parent: Products)
Laptops (parent: Products)
```

↓

Frontend Domain Model:

Products
├── Phones
└── Laptops

This allows the UI layer to render nested navigation recursively.
