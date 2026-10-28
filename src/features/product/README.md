# Product page responsibilities and SSR

`components/product-page.tsx` remains the client entry point used by both `/products` and the importer. It connects `useProductPage` to `ProductPageView`; it does not implement filtering, fetching, pagination or layout itself.

| File | Responsibility |
| --- | --- |
| `hooks/use-product-page.ts` | Compose URL draft state, catalog/discovery source, pagination and local currency/mobile-filter controls. |
| `utils/product-page-data.ts` | Pure product selection, local discovery filters, counts, available filters, price bounds and breadcrumbs. |
| `utils/product-query.ts` | Shared URL parser with no React, browser or Next dependencies. |
| `components/product-page-view.tsx` | Preserve catalog/discovery layout and connect the existing cards and sort controls. |
| `components/product-page-filters.tsx` | Bind draft filter values and callbacks to the shared ProductFilter. |
| `components/product-page-results.tsx` | Loading/empty/cards, scroll sentinel and pagination feedback. |
| `components/product-mobile-filters.tsx` | Mobile filter dialog shell and accessibility labels. |

Catalog filtering still happens on the backend. Discovery recommendations are filtered locally; the requested card remains outside that filtering. Passing discovery results disables the catalog query. A discovery pagination error still stops automatic scrolling and retains the explicit retry action. Page decomposition preserves endpoints, card callbacks, responsive breakpoints and styles. Cache identity and freshness are configured below.

## Shared product cache

`services/product-query-options.ts` owns key factories, normalized list identity, infinite/detail query options and targeted invalidation. Both product hooks consume these options; future server prefetching must use the same factories.

- Keys share the `products` root and distinguish API/mock, list/detail, filters/slug and the fixed public scope. Filter selections are copied, deduplicated and sorted; omitted/empty filters and the default sort share an identity. Cursor is a page parameter inside one infinite cache, not a separate filter key. False inventory values and zero price filters are retained.
- Catalog lists stay fresh for 5 minutes and unused list entries are collected after 30 minutes, preserving every loaded cursor page during a detail-page round trip. Detail data stays fresh for 30 seconds and unused detail entries are collected after 5 minutes. Stale data can refresh on focus/reconnection. Detail requests retry transient network, timeout and server errors up to twice with bounded backoff; invalid payloads and permanent errors still use the existing manual retry. SSR prefetch stays bounded without retries. No disk persistence or global provider defaults were added.
- Product links, API requests and detail cache keys normalize raw and previously escaped slugs to one identity. Browser catalog/detail reads explicitly omit Authorization and cross-origin cookies; private actions keep the existing authentication flow. Browser detail requests wait up to 30 seconds, while server prefetch retains its 10-second deadline and can hand off recovery to the browser. A failed background detail refresh retains the last validated product.
- Product reads are public for both guests and signed-in visitors. Keys use the fixed public scope; no auth token, session ID or browser storage is read to choose a product key. API and mock previews remain separate. The previous auth-scope hook is removed.
- Switching from a mock preview to the API marks that exact API query stale before changing source, preserving the explicit “fetch again” action even when an older API snapshot is fresh.
- On successful selected-card import, `invalidateProductCache` cancels/discards older in-flight cache writes and marks API lists plus that product's detail snapshots stale. It performs no immediate extra GET, leaves other detail/mock/import-job entries intact, and lets the destination page fetch fresh data.
- The query-owned AbortSignal passes through options → productService → productApi → shared HTTP/Axios. Leaving the last consumer or replacing the applied filter query aborts the obsolete read. Shared consumers keep their common request active. Explicit cache cancellation preserves the previous snapshot instead of replacing it with cancellation feedback. Services check cancellation before transport and before mapping, so late responses cannot be mapped. Mock preview delays accept the same signal. UI, query keys, loading messages, retries and normal request timeouts are unchanged by this cancellation wiring.

Tests cover request deduplication, expiration, pagination, targeted invalidation, cancellation, public SSR hydration and actual initial card/detail HTML with controlled API responses.

## Public SSR

Both products routes are dynamic Server Components. The list route parses searchParams with parseProductRouteQuery, which preserves the same first-value behavior as the browser parser. The detail route uses the decoded slug from params. Each route awaits a server loader and wraps its existing client page in HydrationBoundary. No layout, card, filter, sort or purchase component is replaced.

The flow is route ? request-scoped QueryClient ? shared query options with productServerService injected ? productServerApi ? response schemas/mappers ? dehydrate ? HydrationBoundary ? existing client hooks. Both sides use the same public keys, first-page structure and matching freshness policies (5 minutes for lists, 30 seconds for details), so a fresh successful server snapshot does not cause a duplicate initial client GET. The default browser service is not executed by server prefetching.

Server HTTP uses native fetch, a 10-second abortable deadline, cache: no-store, credentials: omit and only an Accept header. It never forwards request cookies, Authorization or incoming headers. Real data is validated by the same mappers used in the browser. Server-side mock previews are rejected. The backend URL is NEXT_PUBLIC_API_URL; the Next server must be able to reach it.

Server loaders keep only successful queries in dehydrated data, then clear their request-local QueryClient. Failed HTTP, timeout or schema validation returns an empty successful-data snapshot; the existing client loading/error/retry flow remains available. There is no shared server QueryClient, persistent cache or personalized data in the snapshot. Server requests do not create import jobs.

Interactive filters, subsequent cursor pages, mock preview controls, favorites and cart actions remain client workflows. Favorites/cart authentication is unchanged. Public SSR does not implement authentication or make those protected mutations public.

References: [Next Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components), [TanStack Advanced SSR](https://tanstack.com/query/latest/docs/framework/react/guides/advanced-ssr).
