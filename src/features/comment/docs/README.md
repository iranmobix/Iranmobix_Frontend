# Comment Feature

## Overview

This Feature is responsible for displaying, creating, and managing article comments and replies.

Comments data is received from Backend, transformed into Frontend Domain Models using Mapper functions, and consumed by UI Components through React Query.

The Feature supports loading comments, loading replies, creating new comments, and creating replies.

---

## Responsibilities

This Feature is responsible for:

- Fetching article comments
- Fetching comment replies
- Creating new comments
- Creating replies
- Validating comment input data
- Transforming Backend responses into Domain Models
- Managing server state with React Query
- Rendering comment and reply components

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

Comment Domain Model

↓

React Query

↓

Components

---

## Feature Structure

Main layers:

- API Layer
- Service Layer
- Mapper Layer
- Hook Layer
- Schema Layer
- Component Layer

---

## Tech Stack

- React Query
- TypeScript
- Axios HTTP Client
- Zod Validation
- React Hooks
- Feature-Based Architecture

---

## Comment Strategy

Backend responses are never consumed directly by Components.

The Service Layer receives Backend responses and transforms them into Frontend Domain Models through Mapper functions.

Components only work with prepared Domain Models and are independent from Backend response structure.
