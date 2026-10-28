# User panel

Route: `/panel`. This first screen implements the supplied account design.

## Responsibilities

- `types`: domain models and a provisional mock API shape; shared user fields reuse the auth model.
- `mock` and `api/user-panel.api.mock.ts`: sample account and isolated copies. No real endpoint is assumed.
- `mappers`: API names to domain names.
- `services`: account loading and immutable preview updates.
- `hooks`: React Query loading/error state and local cache updates.
- `components/user-panel-page.tsx`: page composition and active editor.
- `components/user-panel-sidebar.tsx`: panel navigation.
- `components/panel-orders.tsx`: order tabs, search control, and empty states.
- `components/account-info.tsx`: personal/contact information and avatar.
- `components/account-addresses.tsx`: address list and actions.
- `components/account-edit-dialog.tsx`: accessible editing and deletion confirmation.
- `components/account-personal-form.tsx`: identity form, account type, foreign-national option, and three-part birth date.
- `utils/panel-form.utils.ts`: digit normalization shared by the editing forms.

## Preview behavior

Personal details, phone, email, avatar, and addresses can be changed locally.
Account type and foreign-national status are part of the provisional mock contract. Foreign nationals save an empty national code. The individual and legal tabs use distinct forms. Legal company identity/contact fields are saved separately from the user’s personal contact details.
Changes are held in React Query's in-memory cache and reset on reload or leaving through the panel exit action.
The exit action returns to the homepage and clears only the panel preview; it does not log out an actual authenticated session.
Account, orders, payments, wallet, tickets, comments, and favorites navigation entries are enabled; the remaining entries are disabled until their screens are designed.
The orders screen supports populated and empty current, delivered, and canceled tabs. Counts and search results come from the mock dataset. The table opens the selected order timeline through “مشاهده” or “نمایش بیشتر”; “نمایش کمتر” collapses it. Completed/current steps are colored and future steps are gray.
`mock/panel-orders.mock.ts` provides provisional transport data, the mock adapter copies it, the service maps it, and `use-panel-orders.ts` loads it through React Query. `types/panel-order.types.ts` keeps the small order transport/domain models together until a real backend contract is agreed. No live order endpoint is invented.
`panel-orders.tsx` owns tab/search/loading states, `panel-orders-list.tsx` owns the table and selected expansion, and `panel-order-timeline.tsx` renders the step history and vector illustrations. To preview an entirely empty account, set `panelOrdersMock` to `[]`.
No real identity verification, OTP, address lookup, image upload, or backend writes occur.
The modal uses the existing Radix dependency; no new dependencies are needed.

Replace the mock adapter with an agreed backend API, update its API types and mapper, then connect real mutations in the hook.

## Payment-history preview

`panel-payments.tsx` implements the amount/method/date/detail table and a small read-only details dialog. Data comes from `mock/panel-payments.mock.ts` through the existing mock adapter, mapper, service, and `use-panel-payments.ts`. Types are provisional preview transport/domain models, not an invented live endpoint. Set the mock array to `[]` to preview the empty state. `panel-display.utils.ts` formats order/payment money without converting decimal strings to floating-point numbers and renders dates in the Tehran time zone. Navigation availability is centralized in `isAvailablePanelSection`.

## Wallet preview

`panel-wallet.tsx` renders the balance, charge/cash-out button appearance, and charge-history table. Cash-out is disabled for a zero or invalid balance; history is hidden when there are no entries. Both buttons intentionally have no financial action or form, as requested for this design-only phase.
`mock/panel-wallet.mock.ts` includes funded and empty fixtures. The default adapter uses `panelWalletMock`; use `emptyPanelWalletMock` instead to preview the zero-balance design. The existing mock adapter, service, mapper, and `use-panel-wallet.ts` keep provisional transport data out of components. No live wallet endpoint or transaction is assumed.

## Ticket preview

`panel-tickets.tsx` renders title search, five status styles, and an inline conversation detail screen. `panel-ticket-form.tsx` handles title/message validation, optional single JPG/JPEG/PNG/PDF attachment, and file picking or dropping up to 5 MB. `use-panel-tickets.ts` prepends created mock tickets to the in-memory list through the adapter/service/mapper layers. Only attachment metadata is retained; no file or support message is sent to a backend. Reload resets preview tickets. Replace provisional ticket types and the mock adapter when a real ticket API is provided.

Ticket details use customer/support message bubbles and the shared reply form. Closed tickets hide the form and reject mock replies in the service. Replies append to the in-memory conversation and mark the ticket as processing. Support messages are sample fixtures; no real replies or file uploads are sent.

## Submitted-comment preview

`panel-comments.tsx` renders product cards, comment text, and approved/pending/rejected badges. The comments menu replaces the previous unavailable recent-history placeholder to match the supplied sidebar. Data passes through `panel-comments.mock.ts`, the mock adapter, mapper, service, and `use-panel-comments.ts`. The watch thumbnail is a local SVG preview; real product images can replace it when the backend contract is provided. No live comment API or moderation action is assumed. Set the mock array to `[]` to preview an empty list.

## Favorites preview

`panel-favorites.tsx` renders a responsive product grid and a read-only sample-details dialog. `panel-favorite-card.tsx` displays the thumbnail, source link, color swatches, CNY price, optional toman equivalent, seller verification, and removal control. Six fixtures come through the mock adapter/service/mapper/query hook. Removal changes only the panel query cache and resets on reload or panel exit. The source link is the Alibaba homepage in this mock fixture; no product slug, real favorite endpoint, or backend removal is invented.

## Shared address modal

Panel address creation/editing uses `src/shared/components/address-modal`, extracted from the checkout modal on main. The shared component owns layout, validation, accessibility, submit locking, location selectors and error states; consumers supply location lists, initial values, and a save callback. `account-address-dialog.tsx` maps panel values and preview-only locations. House number/unit are saved separately and rendered in the address list. Checkout integration is deferred at the user’s request because checkout changes are not present on this branch. No backend location IDs or address writes are assumed by the panel preview.

The personal-information modal keeps separate individual/company drafts while switching tabs. Foreign individuals can attach an identity image (JPG/PNG/WEBP, max 5 MB), held only in the panel memory cache. `panel-personal.utils.ts` validates the active form; legal saves do not require individual national code or birth date. No identity document is uploaded or company identity verified by a backend.

## Mobile-change verification preview

Mobile editing changes the same dialog into a six-digit code form. Paste, Persian/Arabic digits, arrow navigation and backspace are supported. The number is saved only after verification. The mock adapter issues a two-minute, single-use challenge; the demo code is `123456`. Wrong/expired codes keep the current number unchanged. The login OTP API is not reused for account changes; no SMS is sent until a dedicated backend contract is provided.
