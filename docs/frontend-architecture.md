# IranMobix Frontend Architecture

## 1. Overview

## 1. Overview

IranMobix Frontend is built as a scalable feature-based application using Next.js App Router and TypeScript.

The main goal of this architecture is to keep business domains isolated, maintainable, and easy to scale as the application grows.

Each feature represents an independent business domain and contains the required logic and resources related to that domain.

This approach reduces coupling, improves maintainability, and keeps the project structure aligned with business requirements.

---

## 2. Core Principles

The frontend architecture is based on the following principles:

### Separation of Concerns

Each layer has a clear responsibility to keep UI, business logic, data handling, and backend communication separated.

### Feature Isolation

Each feature represents an independent business domain.

Features should own their related components, logic, hooks, and types instead of spreading domain code across global folders.

Example:

features/
├── auth/
├── product/
├── blog/
└── navigation/

### Backend Contract Separation

Backend response structures should not directly leak into UI components.

The application separates backend contracts from frontend domain models through dedicated types and mapping layers.

This allows backend changes with minimal impact on UI code.

## 3. Technology Stack

| Technology                   | Purpose                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------- |
| Next.js 16 App Router        | Application framework, routing, and server-side capabilities                 |
| TypeScript                   | Static typing and contract safety across the application                     |
| React Query (TanStack Query) | Server state management, caching, synchronization, and API request lifecycle |
| Zustand                      | Client-side global state management                                          |
| React Hook Form              | Form state management and optimized form rendering                           |
| Zod                          | Runtime schema validation and type-safe form validation                      |
| Tailwind CSS 4               | Utility-first styling system                                                 |
| ShadCN UI                    | Reusable and accessible UI component system                                  |
| Axios / API Client Layer     | Centralized HTTP communication with backend services                         |
| Docker                       | Development and deployment environment consistency                           |
| next-themes                  | Theme management                                                             |
| Lucide React + Remixicon     | Icon system                                                                  |
| anime.js v4                  | Animation and interaction effects                                            |

## 4. Project Structure

The project follows a feature-based architecture combined with a shared infrastructure layer.

The main goal of this structure is to keep business domains isolated and make the application scalable as new features are added.

```text
src/
│
├── app/
├── features/
├── shared/
├── components/
├── hooks/
├── store/
└── types/
```

### Application Layer

#### app/

The app directory is responsible only for Next.js routing and application-level configuration.

Responsibilities:

Route definitions
Layouts
Metadata
Route groups

Example:

```text

app/
├── (auth)/
│   └── login/
│
└── (main)/
    ├── blog/
    ├── products/
    ├── faq/
    └── contact-us/
```

The app directory should not contain:

Business logic
API calls
Feature-specific components
Complex state management

All business logic belongs inside the related feature.

### Feature Layer

features/

The features directory contains business domains of the application.

Each feature is an independent module that owns its own logic.

Current features:

```text
features/
├── auth/
├── product/
├── blog/
├── comment/
├── contact-us/
├── faq/
├── header/
├── importer/
├── search/
└── site/
```

A feature can contain:

```text
feature/
├── api/
├── components/
├── hooks/
├── services/
├── types/
├── mappers/
└── schemas/
```

Each feature is responsible for:

API communication
Business logic
Data transformation
Feature components
Type definitions

### Shared Layer

shared/

Contains reusable infrastructure that can be used across multiple features.

Current usage:

shared/
└── api/

Examples:

```text
HTTP client
API configuration
Shared request utilities
```

Shared code must remain independent from business domains.

### Components Layer

components/

Contains reusable UI components that are not tied to a specific business feature.

Structure:

```text
components/
├── layout/
├── shared/
└── ui/
```

Responsibilities:

Global UI components
Layout components
Reusable visual elements

Feature-specific components should remain inside their own feature folder.

### Providers

providers/

Contains application-level providers.

Examples:

React Query Provider
Theme Provider
Global Context Providers

### Store

store/

Contains global client-side state management.

The project uses Zustand for managing application-wide client state.

Only shared states should exist here.

Feature-specific states should stay inside their feature whenever possible.

### Lib

lib/

Contains shared utilities and application-level helpers.

## 5. Architecture Layers

The application follows a layered architecture where each layer has a specific responsibility.

The main goal is to separate UI, business logic, backend communication, and data transformation.

### Layer Flow

Components
|
↓
Hooks
|
↓
Services
|
↓
API Layer
|
↓
Backend

### Response flow:

Backend Response
|
↓
API Layer
|
↓
Service Layer
|
↓
Mapper
|
↓
Domain Model
|
↓
Components

### Component Layer

Components are responsible for UI rendering and user interaction.

Responsibilities:

Display UI
Receive user input
Trigger actions through hooks
Handle presentation state

Components should not:

Call APIs directly
Contain business logic
Handle backend response structures
Manage authentication/session logic

Example:

```text
Component
↓
Feature Hook
```

### Hook Layer

Hooks connect React components with application logic.

Responsibilities:

- Connect components with application logic
- Manage React Query queries and mutations
- Handle feature-level UI flows
- Manage local feature state when required

Examples:

```text
useRequestOtp
useVerifyOtp
useProducts
useCurrentUser
```

Hooks should not contain:

Direct HTTP requests
Complex data transformation
Backend-specific logic

### Service Layer

Services contain application business logic.
Services should hide backend implementation details from components.

Responsibilities:

Coordinate API calls
Prepare data
Execute frontend application logic
Use mappers
Return frontend-ready data

Example:

```text
Backend User Response

first_name

↓

User Domain Model

firstName
```

Services act as a bridge between API contracts and frontend models.

### API Layer

The API layer is responsible only for backend communication.

Responsibilities:

HTTP requests
Request configuration
Headers
Endpoint definitions
Response typing

The API layer should not contain:

Business logic
State management
Data transformation

Example:

```text
authApi.verifyOtp()
productApi.getProducts()
```

### Mapper Layer

Mappers transform backend data structures into frontend domain models.

Responsibilities:

Remove backend dependency from UI
Normalize API responses
Convert naming conventions

Example:

```text
Backend:

{
first_name: "Ali"
}

Frontend:

{
firstName: "Ali"
}
```

### Type Layer

Types define contracts between different layers.

The project separates:

Shared Types

Example:

```text
UserApiResponse

↓

mapUser()

↓

User
```

This allows backend changes with minimal impact on UI.

## 6. State Management Strategy

The application uses different state management solutions based on the type and lifecycle of data.

The main principle is to keep each type of state in the appropriate layer.

The project separates state into three categories:

- Server State
- Global Client State
- Local UI State

### Server State

Server state represents data that comes from the backend and requires synchronization with the API.

The project uses TanStack React Query for managing server state.

Examples:

```text
Products
Current User
Blog Posts
Categories
Navigation Data
```

Responsibilities handled by React Query:

Data fetching
Caching
Background synchronization
Loading states
Error handling
Query invalidation

Example:

```text
Component

↓

useProducts()

↓

React Query

↓

Service Layer

↓

API
```

Server data should not be duplicated inside Zustand.

### Global Client State

Global client state represents frontend-only data that needs to be shared across multiple parts of the application.

The project uses Zustand for global client state management.

Examples:

```text
Theme preferences
Global UI settings
Application-wide client states
```

Zustand should only contain data that:

Does not belong to the backend
Does not require API synchronization
Needs access from multiple components

### Local UI State

Local component state is managed using React state APIs.

Examples:

```text
Modal visibility
Form input state
Temporary UI interactions
Component-specific states
```

Example:

```text
const [open, setOpen] = useState(false);
```

Local state should remain inside the component unless it needs to be shared.

### Zustand

Use Zustand for:

✅ Global client state
✅ Shared frontend preferences

Do not use Zustand for:

❌ API responses
❌ Backend entities
❌ Server cache

### Component State

Use local React state for:

✅ Temporary states
✅ UI interactions
✅ Form states that do not need sharing

### Form State Management

Form state is managed using React Hook Form.

The responsibility of React Hook Form is:

- Managing form values
- Handling validation lifecycle
- Managing form errors
- Connecting forms with Zod schemas

Form state should remain close to the related feature and should not be stored globally unless it is shared across multiple application areas.

## 7. API Communication Strategy

The application follows a structured API communication pattern to separate backend communication from business logic and UI layers.

The main goal is to keep API interactions predictable, maintainable, and independent from UI components.

### API Layer

The API layer is responsible for direct communication with backend services.

Each feature owns its API layer.

Example:

```text
features/

product/
└── api/

auth/
└── api/

blog/
└── api/
```

Responsibilities:

Define API endpoints
Send HTTP requests
Configure request options
Handle request headers
Define API response types

The API layer should only handle communication details.

Example:

```text

productApi.getProducts()

authApi.verifyOtp()

blogApi.getArticles()

```

### Service Layer

TServices consume API results and prepare application-ready data.

### Data Transformation

Backend responses should not directly flow into UI components.

The application uses mappers to transform backend contracts into frontend domain models.

Example:

```text
Backend Model

{
product_name: "Laptop"
}

↓

Mapper

↓

Frontend Domain Model

{
productName: "Laptop"
}
```

This approach allows backend changes with minimal impact on the UI layer.

### API Client

Shared API utilities are centralized inside the shared layer.

Example:

shared/

└── api/

Responsibilities:

HTTP client configuration
Base URL management
Request handling
Common headers
Error processing

Feature APIs use the shared API client instead of creating independent HTTP implementations.

### Error Handling Strategy

API errors should be handled consistently across the application.

The responsibility is divided between layers:

API Layer:

Detect HTTP errors
Return typed responses/errors

Service Layer:

Handle business-related errors
Prepare application-friendly errors

Hooks:

Connect errors with UI states
Show user feedback

Components:

Display error messages
