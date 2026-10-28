# Architecture Decisions

## Client-side Search

Decision:

Search is performed on cached data.

Reason:

- Reduce the number of API requests
- Leverage React Query Cache
- Provide a better user experience
- Improve response speed

---

## Mapper Usage

Decision:

All transformations from Backend Response to Domain Model are handled inside the Mapper layer.

Reason:

- Separate Backend Contract from Frontend Model
- Prevent duplicated transformation logic
- Make future API changes easier to manage

---

## Service Separation

Decision:

The API layer is only responsible for HTTP communication.

The Service layer is responsible for coordinating API calls and Mapper usage.

The Hook layer is responsible for managing React Query operations and Feature-related state.

---

## Debounced Search

Decision:

Search uses Debounce with a delay of 300 milliseconds.

Reason:

- Prevent unnecessary calculations on every key stroke
- Improve Performance
- Provide a smoother user experience

---

## Cached Data Filtering

Decision:

Filtering is performed only on data available in the React Query Cache.

Reason:

- Remove unnecessary API requests
- Reduce dependency on Backend availability
- Provide instant search results
