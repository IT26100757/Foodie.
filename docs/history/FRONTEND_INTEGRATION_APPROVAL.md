# Frontend integration requires approval
No frontend file or compiled bundle was edited. These are exact existing source locations and matching line anchors, not implemented frontend integration. Preserve JSX, CSS, images and layouts; change only event handlers, data loading, ID mapping and error/status handling after approval.

Customer: connect login/register to /api/auth/*; guest checkout to POST /api/guest/orders and retain returned accessToken for GET /api/guest/orders/{id} with X-Guest-Token. Send UUID Idempotency-Key. Map existing cart IDs to database menu IDs and quantities/sizes; use server-returned prices/totals. Existing frontend order payload is not automatically interchangeable with the documented API envelope. Card UI stays visible; show gateway-unavailable response, never success.
Favourites: GET /api/customer/favorites returns restaurant records; map their database IDs to the existing saved-ID UI state. PUT and DELETE /api/customer/favorites/{restaurantId} add/remove. Backend records are user-scoped; anonymous saved browser preferences require explicit migration on login if desired. Rewards GET /api/customer/rewards.
Merchant: connect restaurant/menu CRUD, orders and additional-charge consent, wallet/bank/payouts and scoped reports. Adopt database-generated menu IDs from save responses; browser IDs are submission aliases only. Do not display payout success before verified settlement.
Driver: existing session-cookie login is supported. Registration must retain all step fields/files and call applications/documents/submit endpoints. Credential setup and email verification need UI approval because the original form is disconnected. Pickup workflow lacks a connected control; complete only after actual pickup. Profile email requires confirmation rather than immediate local replacement.
Admin: replace empty arrays/local storage handlers with actual dashboard, applications, users, restaurants, offers, complaints, refunds, payouts and notifications APIs. Existing session login contract is supported. No claim that dashboard actions are already connected.

## frontend/customer/src/App.jsx
Editable source available. Matching lines:
- `submit`: 92, 117, 144, 146, 193, 211
- `localStorage`: 75, 155, 160
- `register`: 82, 85, 109, 110, 125, 147, 163, 165
- `login`: 82, 110, 189, 209, 213
## frontend/customer/src/HomePage.jsx
Editable source available. Matching lines:
- `toggleFavorite`: 215, 224
- `completeCheckout`: 255, 324
- `updateProfile`: 238, 324, 338
- `localStorage`: 75, 85, 87, 90, 97, 150, 166, 167
## frontend/customer/src/CheckoutPage.jsx
Editable source available. Matching lines:
- `completeOrder`: 97, 149
- `payment`: 20, 50, 93, 98, 102, 110, 111, 112
- `onPlaceOrder`: no matching anchor; inspect component handler
## frontend/customer/src/AccountCenter.jsx
Editable source available. Matching lines:
- `localStorage`: 76, 117, 124
- `profile`: 69, 71, 82, 89, 90, 144, 145, 146
- `card`: 74, 75, 76, 108, 110, 111, 112, 115
## frontend/customer/src/orderTrackingService.js
Editable source available. Matching lines:
- `FOODIE_TRACKING_PROVIDER`: 1, 5
## frontend/merchant/src/App.jsx
Editable source available. Matching lines:
- `handleSubmit`: 349, 468
- `localStorage`: 142, 217, 225, 226, 231, 232, 240, 241
- `LoginPortal`: 51, 88
- `RegistrationPortal`: 48, 288
## frontend/merchant/src/MenuPage.jsx
Editable source available. Matching lines:
- `save`: 128, 136, 137, 149, 155
- `localStorage`: no matching anchor; inspect component handler
- `randomUUID`: 136
## frontend/merchant/src/OrdersPage.jsx
Editable source available. Matching lines:
- `localStorage`: no matching anchor; inspect component handler
- `additionalCharge`: 22, 69, 91, 93, 95, 96, 100
## frontend/merchant/src/WalletPage.jsx
Editable source available. Matching lines:
- `addAccount`: 62, 175
- `transfer`: 29, 30, 32, 46, 51, 53, 76, 78
- `localStorage`: 23, 40, 69
## frontend/merchant/src/WalletReports.jsx
Editable source available. Matching lines:
- `Generate`: 102
- `report`: 1, 49, 71, 87, 102, 108, 109, 110
## frontend/driver/src/App.jsx
Editable source available. Matching lines:
- `unavailable`: 30, 32, 176, 179, 211, 214, 217, 218
- `register`: 366, 387, 388
- `onProfileChange`: 230, 244, 335
- `pickup`: no matching anchor; inspect component handler
- `fetch(`: 171, 208, 214, 217, 218, 241, 252, 303
## frontend/admin/src/App.jsx
Editable source available. Matching lines:
- `localStorage`: 454, 471, 682, 715
- `useState([])`: 696, 705, 707, 709
- `approve`: 383, 424, 562, 565, 598, 599, 609, 672
- `reject`: 383, 422, 424, 563, 566, 598, 599, 609
- `refund`: 15, 47, 373, 380, 382, 384, 385, 386
- `coupon`: 47, 369, 442, 443, 445, 446, 450, 453

All four selected snapshots contain editable src and package.json. Customer/Driver editable files were missing in the Downloads active checkout; Driver was recovered from its feature/driver Git branch. Customer/Merchant editable sources come from Foodie-friend-copy. Merchant active Downloads src is a Vite starter and was excluded. Original compiled builds and selected editable snapshots may represent different commits; exact source-to-dist reproducibility has not been established. No replacement source or design was created.