# FAQ Feature

## Overview

This Feature is responsible for displaying, fetching, and searching Frequently Asked Questions (FAQ).

Data is fetched from the Backend, transformed into a Domain Model, and then provided to Components through React Query.

Search is performed client-side on cached data. Debounce is used to prevent filtering execution on every key stroke.

---

## Responsibilities

This Feature is responsible for:

- Fetching FAQ list
- Fetching FAQ by slug
- Transforming Backend data into Domain Model
- Client-side search
- Managing search-related state
- Managing cache using React Query

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

Mapper

↓

React Query

↓

Controller

↓

Components

---

## Tech Stack

- React Query
- TypeScript
- Axios HTTP Client
- Feature-Based Architecture
- TanStack Query
- Zod
- React Hooks

---

## Search Strategy

All FAQ items are fetched from the Backend once.

After the data is stored in the React Query Cache, search operations are performed on the cached data.

No additional requests are sent to the Backend while the user is typing.
