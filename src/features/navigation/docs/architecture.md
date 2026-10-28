# Navigation Architecture

## Folder Structure

navigation
│
├── api
│ └── navigation.api.ts
│
├── services
│ └── navigation.service.ts
│
├── hooks
│ └── useNavigation.ts
│
├── mappers
│ └── navigation.mapper.ts
│
├── constants
│ └── navigation.keys.ts
│
├── types
│ ├── navigation.api.types.ts
│ └── navigation.types.ts
│
└── components
│ │
│ ├── navigation-item.tsx
│ │
│ ├── desktop
│ │ ├── desktop-navigation.tsx
│ │ └── desktop-navigation-item.tsx
│ │
│ └── mobile
│ │ ├── mobile-navigation.tsx
│ │ └── mobile-navigation-item.tsx

---

## Layer Responsibilities

### API Layer

Responsible for:

- Sending HTTP requests
- Receiving Backend responses
- Direct communication with Navigation API

Should not contain:

- Business Logic
- Data Transformation
- UI-related logic
- State Management

---

### Service Layer

Responsible for:

- Coordinating API calls
- Using Mapper functions
- Preparing navigation data for application usage

The Service layer acts as a bridge between the API layer and React Hooks.

---

### Mapper Layer

Responsible for:

- Transforming Backend Response into Frontend Domain Model
- Converting flat navigation data into a nested tree structure

Example:

Backend Model:

```ts
{
  id: 2,
  name: "Phones",
  url: "/phones",
  parent: 1
}

↓

Frontend Model:

{
  id: 2,
  title: "Phones",
  href: "/phones",
  children: []
}


## Tree Building Strategy

Backend provides navigation items as a flat array.

The Mapper performs two steps:

Step 1: Create Domain Models

Each Backend item is converted into a NavigationItem.

Step 2: Build Parent-Child Relations

Items with a parent value are attached to their parent node.

Items without a parent become root navigation items.

### Hook Layer

Responsible for:

Connecting React Query
Managing Navigation cache
Providing navigation data to Components
Component Layer

Responsible for:

Rendering navigation UI
Handling Desktop and Mobile layouts
Rendering nested navigation recursively

Components consume the Domain Model and do not depend on Backend API structure.

## Domain Model

The Feature uses `NavigationItem` as the main Domain Model.

The UI layer only consumes this model and does not know about Backend response structure.
```
