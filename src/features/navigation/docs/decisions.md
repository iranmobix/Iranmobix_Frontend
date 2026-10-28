# Architecture Decisions

## Backend Flat Structure

Decision:

Backend navigation data is received as a flat list and converted into a tree structure on the Frontend.

Reason:

- Keep Backend response simple
- Move UI-specific structure handling to Frontend
- Support recursive rendering easily
- Separate API contract from UI requirements

---

## Mapper Responsibility

Decision:

Navigation tree generation is handled inside the Mapper layer.

Reason:

- Keep API layer focused only on HTTP communication
- Keep Service layer focused on coordination
- Prevent transformation logic from spreading into Components
- Maintain a clean Domain Model

---

## Shared Navigation Model

Decision:

Desktop and Mobile navigation use the same `NavigationItem` Domain Model.

Reason:

- Avoid duplicated data structures
- Keep business data separated from UI rendering
- Allow different UI implementations with the same data source

---

## Recursive Navigation Rendering

Decision:

Nested navigation items are rendered recursively through the `NavigationItem` Component.

Reason:

- Support unlimited navigation depth
- Simplify nested menu rendering
- Avoid hardcoded menu levels

---

## React Query Cache Strategy

Decision:

Navigation data is managed through React Query.

Reason:

- Avoid repeated API requests
- Provide centralized server state management
- Improve performance by using cached data

---

## API and Domain Separation

Decision:

Backend API models and Frontend Domain Models are separated.

Reason:

- Prevent Backend contract changes from affecting UI components
- Keep Frontend models optimized for application needs
- Make future API changes easier to handle
