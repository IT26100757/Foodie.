# Customer order tracking integration

The tracking page is demo-only until the application receives an implementation of `window.FOODIE_TRACKING_PROVIDER`. The demo route, driver, vehicle, location, step changes, and arrival confirmation are not real GPS data or server-side order updates. They are saved to this browser's local order record.

## Provider contract

Install the provider during customer app startup, before rendering React:

```js
window.FOODIE_TRACKING_PROVIDER = {
  subscribeToOrder(orderId, onUpdate) {
    // Connect to the authenticated order event stream (for example SSE or WebSocket).
    // Call onUpdate({ status, latitude, longitude, eta }) as verified events arrive.
    // Return a function that closes the stream.
  },
  mountMap(element, { order, onLocation }) {
    // Mount the configured map SDK and draw its route and driver marker in element.
    // Call onLocation({ latitude, longitude, eta }) when driver updates arrive.
    // Return a function that removes the map and its event listeners.
  },
  async updateOrder(order) {
    // Persist a customer/demo status change through the authenticated order API.
  },
  async confirmDelivery(order) {
    // Persist customer receipt confirmation; the server must notify the merchant and driver.
  },
}
```

The backend needs authenticated order lookup and status updates, an event stream that publishes driver coordinates and ETA, and a delivery confirmation endpoint that marks the order delivered and queues merchant and driver notifications. Store driver contact and vehicle fields on the order/assignment record. Configure a map SDK and its credentials in the frontend host, and implement `mountMap` to use that SDK. The current backend has no delivery tracking, driver location, or completion notification endpoints, and the project has no map SDK/configuration. Until those pieces exist, the UI displays the illustrated sample route and reports local demo confirmation instead of claiming that notifications were sent.

Checkout orders include both `address` and `deliveryAddress` objects with `address1`, `address2`, `address3`, `city`, and `postalCode`, plus customer name and phone. Persist and return these fields with the order so the tracking page, merchant Delivery page, and any future driver app use the same destination.
