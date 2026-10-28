# Navigation Flow

## Fetch Navigation Flow

User

↓

Navigation Component

↓

useNavigation Hook

↓

React Query

↓

navigation.service

↓

navigation.api

↓

GET /api/menus/

↓

Backend

↓

Navigation API Response

↓

navigation.service

↓

navigation.mapper

↓

mapNavigationTree()

↓

Navigation Domain Model

↓

React Query Cache

↓

Desktop / Mobile Navigation Components

---

## Data Transformation Flow

Backend provides navigation data as a flat list:

Products
Phones (parent: Products)
Laptops (parent: Products)

↓

Mapper converts flat data into tree structure:

Products
├── Phones
└── Laptops

↓

Navigation Components recursively render the tree.

---

## Desktop Navigation Flow

User visits application

↓

DesktopNavigation Component

↓

useNavigation Hook

↓

Get Navigation Data

↓

Render NavigationItem Components

↓

Recursive Rendering of Children

---

## Mobile Navigation Flow

User opens mobile navigation

↓

MobileNavigation Component

↓

useNavigation Hook

↓

Get Navigation Data

↓

Render NavigationItem Components

↓

Recursive Rendering of Nested Items

---

## Component Rendering Flow

NavigationItem receives:

```ts
{
  id,
  title,
  href,
  children
}

↓

Render Link

↓

Check children length

↓

If children exist:

Render nested NavigationItem components recursively.

Error Handling Flow

Loading State:

isLoading === true

↓

Display loading state

Error State:

isError === true

↓

Display failure message

Empty State:

data.length === 0

↓

Do not render navigation
```
