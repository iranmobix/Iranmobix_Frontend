# Header Architecture

## Folder Structure

header
│
├── components
│ ├── header.tsx
│ ├── header-top.tsx
│ ├── header-logo.tsx
│ └── header-actions.tsx
│
├── hooks
│ ├── use-header-scroll.ts
│ ├── use-mobile-menu.ts
│ └── use-theme-toggle.ts
│
├── types
│ └── header.type.ts
│
└── index.ts

---

## Layer Responsibilities

### Component Layer

Responsible for:

- Rendering Header UI
- Composing Header sections
- Displaying logo and actions
- Handling component structure

Components should not contain complex state management logic.

---

### Hook Layer

Responsible for:

- Managing client-side interactions
- Managing UI state
- Providing reusable Header behaviors

Hooks include:

`useHeaderScroll`

Responsible for:

- Detecting scroll position
- Managing Header scroll behavior

---

`useMobileMenu`

Responsible for:

- Managing mobile menu open/close state
- Controlling mobile navigation visibility

---

`useThemeToggle`

Responsible for:

- Managing theme switching behavior
- Handling theme-related client interactions

---

## Type Layer

Responsible for:

- Defining Header related TypeScript models
- Providing shared types between components

---

## Component Composition

The Header is composed of smaller UI components:
Header

├── HeaderTop
├── HeaderLogo
└── HeaderActions

Each component has a specific responsibility and can be maintained independently.

---

## Architecture Approach

The Header Feature follows a UI-focused Feature Architecture.

Business logic is separated from presentation logic by moving reusable behaviors into custom hooks.
