# Header Feature

## Overview

This Feature is responsible for rendering and managing the application header.

The Header provides the main navigation area, branding section, user actions, theme control, and responsive behavior for desktop and mobile layouts.

The Feature focuses on UI composition and client-side interactions.

---

## Responsibilities

This Feature is responsible for:

- Rendering application header layout
- Displaying application logo
- Managing header actions
- Handling mobile menu state
- Managing theme toggle interaction
- Handling header scroll behavior
- Supporting responsive layouts

---

## Public API

This Feature exposes required components and functionality through the `index.ts` file.

---

## Data Flow

User Interaction

↓

Header Components

↓

Custom Hooks

↓

Local UI State

↓

Component Updates

---

## Components

Main Components:

- `Header`
- `HeaderTop`
- `HeaderLogo`
- `HeaderActions`

---

## Hooks

Custom hooks used by this Feature:

- `useHeaderScroll`
- `useMobileMenu`
- `useThemeToggle`

---

## Tech Stack

- React
- TypeScript
- Next.js
- React Hooks
- Feature-Based Architecture

---

## Feature Strategy

Header logic is separated from UI components using custom hooks.

Components are responsible for rendering UI, while hooks manage client-side interactions and state.

## Compact mobile header

Below 1024px, `header-mobile.tsx` displays the menu trigger, compact shared import/search input and cart link. The Radix drawer traps/restores focus, closes on navigation/Escape/backdrop and closes when resizing to desktop. Cart count observes cached cart data without a new header request. `ImportHeaderInput` defaults to its existing desktop styling; compact styling is opt-in. The desktop header composition, padding and child styles remain unchanged.
