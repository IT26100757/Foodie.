# Orders integration boundary

The uploaded Spring Boot backend currently has no order API or live event contract. The Orders page starts with an empty list and does not call an assumed endpoint.

When the backend adapter receives an authenticated order for the signed-in merchant, publish it through the browser event boundary:

```js
window.dispatchEvent(new CustomEvent('foodie:merchant-order', {
  detail: { order: authenticatedOrder },
}))
```

The order object should provide `id`, `date` (`YYYY-MM-DD`), `time`, `paymentType`, numeric `total`, `currency`, and `status`. To permit an additional charge, the order must also carry `customerAgreedToAdditionalCharges: true`. The editable amount is `additionalCharge`; the frontend derives `netTotal = total + additionalCharge`. Without strict customer agreement, the additional-charge input is disabled and the amount is excluded from net total. The current UI edit is held in frontend state only; wire it to a backend update contract once the team defines one.

The dashboard scopes data to events emitted by the authenticated backend adapter. New orders appear in the bell menu and open the Orders page when selected. Sound is off until enabled in Settings. Once enabled, each incoming order plays a repeating Web Audio chime for 30 seconds; switching it off stops playback. The UI requests no OS notification permission.