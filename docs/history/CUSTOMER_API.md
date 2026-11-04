# Customer backend contracts

Guest registration is not required. POST /api/guest/orders accepts the following envelope (IDs must be actual database IDs; illustrative field names below are a schema, not seeded data):

```json
{"name":"<customer name>","email":"<email>","phone":"<Sri Lankan phone>","order":{"restaurantId":0,"type":"DELIVERY","deliveryAddress":"<address>","paymentMethod":"CASH","items":[{"menuItemId":0,"quantity":1,"size":"<saved size or omit>"}],"offerCode":null,"redeemPoints":false}}
```

Replace zero IDs with real IDs returned by restaurant/menu APIs. Send Content-Type application/json and Idempotency-Key containing a newly generated UUID. Use session/CSRF rules described in setup even for unauthenticated writes. Response contains `order` and a one-time `accessToken`. Keep the token private; GET /api/guest/orders/{id} needs X-Guest-Token. Only its hash is stored. Reusing the guest request key is rejected to prevent duplicate creation; retain the first response for tracking. A lost response requires support/reconciliation rather than silently submitting another order.

The server validates contact details, restaurant publication/open state and fulfilment mode, menu ownership/availability, saved size, quantity and price. It ignores client-calculated totals: the request does not accept a trusted price or total. Discounts, delivery fee and order total are calculated on the server using persisted catalog/offer records and configured policies. Guests cannot redeem registered-customer reward points. Card requests return 503 with no successful payment/order simulation. Cash orders are unpaid until authorized collection is recorded.

Registered customers use POST /api/orders (see OrderController) with the Checkout object directly. Guest access tokens cannot access account orders and another logged-in account cannot read the guest record through account order endpoints.

GET /api/customer/favorites returns saved restaurant records. PUT /api/customer/favorites/{restaurantId} saves a restaurant idempotently; DELETE removes it. Session must belong to an active Customer. Existing frontend saved ID arrays need an explicit mapping to these database IDs. No browser data is automatically imported. GET /api/customer/rewards returns earned, redeemedOrReserved and available values calculated from persisted order history.

Frontend integration remains pending approval. Current checkout callbacks/browser storage do not become server operations merely because these endpoints exist.
