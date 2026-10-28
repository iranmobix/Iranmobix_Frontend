# Navigation API Contract

## Get Navigation Menus

### Endpoint

GET `/api/menus/`

---

## Response

```json
[
  {
    "id": 1,
    "name": "Products",
    "url": "/products",
    "status": 1,
    "parent": null
  },
  {
    "id": 2,
    "name": "Phones",
    "url": "/products/phones",
    "status": 1,
    "parent": 1
  }
]
```

---

## API Response Model

Backend Response:

```ts
interface NavigationApiResponse {
  id: number;
  name: string;
  url: string;
  status: number;
  parent: number | null;
}
```

---

## Domain Model

Frontend Domain Model:

```ts
interface NavigationItem {
  id: number;
  title: string;
  href: string;
  children: NavigationItem[];
}
```

---

## Data Transformation

Backend fields are transformed into Frontend Domain Model fields using `navigation.mapper.ts`.

Mapping example:

| Backend Field       | Frontend Field        |
| ------------------- | --------------------- |
| `name`              | `title`               |
| `url`               | `href`                |
| Flat List Structure | Nested Tree Structure |

---

## Tree Structure Transformation

The Backend provides navigation items as a flat array.

The Frontend Mapper converts this structure into a hierarchical tree by:

1. Creating a map of all navigation items.
2. Finding parent-child relationships using the `parent` field.
3. Assigning child items to their parent node.
4. Returning root navigation items.

---

## API Layer Responsibility

The API layer only handles HTTP communication.

It does not:

- Transform response data
- Build navigation trees
- Handle UI logic
- Manage application state
