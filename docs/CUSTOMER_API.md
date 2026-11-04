# Customer contracts

POST /api/auth/register/CUSTOMER creates a Customer with immediate access; POST /api/auth/login accepts email/password and establishes a session. GET /api/account restores it. Unsafe requests use /api/csrf. No JWT was introduced.

Catalogue joins use database restaurantId/menuItemId, never product names. POST /api/guest/orders/quote validates without saving an order/payment. Checkout fields: restaurantId, type DELIVERY/PICKUP, deliveryAddress, paymentMethod CASH/CARD, offerCode, redeemPoints, items [{menuItemId,quantity,size,specialInstructions}], optional contact {name,phone,email}. Server prices/policies/availability/totals are authoritative.

POST /api/orders saves a registered Customer order. POST /api/guest/orders accepts {order:CHECKOUT_FIELDS,name,phone,email} without registration. Use Idempotency-Key for the attempt and reuse it on retries. Guest response includes a private access token; only its hash is persisted. Tracking requires X-Guest-Token. Browser storage retains private access references, not authoritative orders.

GET /api/orders, /api/orders/{id}/items and /api/orders/{id}/tracking are scoped. Driver pickup/completion changes fulfilment; cash collection is separate. Card success is unavailable. Favourites and owned completed-order reviews persist in the database. See the complete inventory and request records for all routes.
