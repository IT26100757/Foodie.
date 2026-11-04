# Current integration status and limits

Wired does not mean live-service verified. All four editable source projects are available and independently buildable. Original dist/ remains reference-only. Local storage holds draft cart/preferences and private guest access references, not authoritative business records.

| Portal | Connected functionality | Browser evidence and limits |
|---|---|---|
| Customer | Session auth/register/recovery; restaurant/menu; ID-scoped catalogue; cart draft/server quote/cash and guest APIs; orders/tracking; favourites; profile; completed-order reviews | Login, menu, cart, quote, cash order, tracking, favourites, saved review and refresh exercised. Guest checkout/negative auth covered by backend tests; email-linked browser onboarding unverified. |
| Merchant | Registration/documents/status; own restaurant/menu/settings; permanent DB IDs; order transitions/delivery list; notifications; encrypted banks/wallet/payout requests/reports | Login, price save, availability, order reception/Preparing/Ready/Completed, wallet and report controls inspected. Full onboarding/email and real settlement not browser-certified. |
| Driver | Registration draft/documents/pending onboarding; session login; availability/offers/acceptance; pickup/completion; profile/vehicle review; earnings/banks/payout requests; notifications/complaints | Login, offer, acceptance, pickup, completion, earnings and production refresh exercised. Full 13-document registration/setup email/device GPS unverified. Fixture coordinates are explicitly synthetic. |
| Admin | Auth; DB dashboard/orders/restaurant/rider oversight; approval/rejection/state changes; menu/documents; Customers; coupons/payments/refunds/complaints/notifications/report handlers | Matching order/restaurant/menu/customer records and suspend/reactivate exercised. Backend tests cover approval/rejection, authorization and SMTP outcomes. Every popup/date/export combination has not been manually certified. |

## Unverified external services

* Live Aiven connection/CA and V1–V13 migration compatibility require private setup and explicit approval before writes.
* Real Cloudinary upload is disabled pending permission; provider tests are mocked; existing images were preserved.
* SMTP approval/rejection/setup/recovery inbox delivery is mocked only. Configure provider and public URLs, then authorize a real email test.
* Card gateway/tokenization is not configured. Original card UI remains visible with unavailable messages; no fake payments/raw card storage.
* Payout request/verified manual settlement APIs exist; automatic bank execution does not. Delivery completion leaves cash PENDING until separately confirmed by an authorized collection operation. No real money moved.
* Device GPS, ETA/routing, physical delivery and phone/SMS actions are not verified. Customer map is the unchanged illustration and says GPS unavailable. Fixture driver coordinates are not live GPS.
* Production HTTPS/proxy deployment is unverified. Single-origin sessions hold one account; concurrent roles need separate browser profiles. Dev ports isolate cookies.

## API-only controls requiring further UI authorization

1. Approved Customer extra-charge consent is NOW connected in OrderTracking.jsx, with exact-amount/stale/replay/ownership validation. Registered Customers use POST /api/orders/{id}/additional-charge/consent; guests use POST /api/guest/orders/{id}/additional-charge/consent and their private X-Guest-Token. Registered UI acceptance/refresh was browser-tested; guest consent was backend-tested.
2. Approved Admin policy editing is NOW connected on the Dashboard through GET/PUT /api/admin/policies. It loads persisted values, validates rates/whole points and saves to the database. No production values are seeded. Browser change150→200 persisted and affected a new checkout, preserving the existing order snapshot.
3. Final financial collection/verified settlement has no complete original control. Payout buttons create requests; they do not execute transfers. A reviewed operational process/provider is needed.
4. Merchant's original chart/insight areas now render real numeric summaries: selected Sales/Orders/Average Order Value, new/repeat customers, ranked completed item quantities and persisted Customer reviews. These are readouts within the existing frames; a new graphical time-series/chart design was not invented. Date/export/device/registration combinations not individually exercised remain unverified rather than assumed successful.

Approved controls use existing styles: Admin Customer Management, Customer review write/edit/delete, inline Customer extra-charge consent and the expandable Admin Dashboard policy editor. No replacement design was invented. The core cross-portal order workflow is integrated and browser-tested, but not every feature or external service is fully integrated/verified.
