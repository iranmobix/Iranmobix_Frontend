# Architecture Decisions

## Separation of UI and Logic

Decision:

Header interaction logic is separated from UI components and implemented through custom hooks.

Reason:

- Keep components focused on rendering
- Improve code readability
- Make logic reusable
- Simplify future maintenance

---

## Component Composition

Decision:

The Header is divided into smaller components instead of implementing everything in a single component.

Reason:

- Reduce component complexity
- Improve maintainability
- Allow independent changes to each section

---

## Local State Management

Decision:

Header UI states are managed locally through custom hooks.

Examples:

- Mobile menu state
- Theme toggle state
- Scroll state

Reason:

- These states are only related to Header behavior
- No global state management is required
- Avoid unnecessary application complexity

---

## No API Layer

Decision:

The Header Feature does not contain API, Service, or Mapper layers.

Reason:

- Header does not communicate directly with Backend
- Data fetching responsibility belongs to other Features
- The Feature only manages UI composition and client interactions

---

## Reusable Hooks

Decision:

Reusable Header behaviors are extracted into custom hooks.

Reason:

- Keep components clean
- Separate behavior from presentation
- Improve testing and future extension
