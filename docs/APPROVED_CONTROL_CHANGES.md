# Approved minimal API controls

User explicitly authorized both additional controls. No CSS/assets/layout system changed. Admin policy editor is an expandable existing-style panel on Dashboard, not a new portal. Customer consent appears only for a real outstanding proposal in an eligible order state. All saved values are reloaded from the backend. Guest consent uses a private per-order token; registered consent requires the owning Customer.

| File | Line | Entry point |
|---|---|---|
| `frontend/customer/src/OrderTracking.jsx` | 130 | `async function acceptCharge` |
| `frontend/customer/src/OrderTracking.jsx` | 177 | `Proposed additional charge` |
| `frontend/customer/src/customerApi.js` | 34 | `export async function acceptAdditionalCharge` |
| `frontend/admin/src/App.jsx` | 680 | `function BusinessPolicyEditor` |
| `frontend/admin/src/App.jsx` | 827 | `<BusinessPolicyEditor` |
| `backend/src/main/java/com/foodie/order/GuestOrderController.java` | 30 | `additional-charge/consent` |
| `backend/src/main/java/com/foodie/order/OrderService.java` | 427 | `public void guestConsent` |
| `backend/src/main/java/com/foodie/order/OrderService.java` | 432 | `private void acceptCharge` |
| `backend/src/main/java/com/foodie/settings/BusinessPolicyService.java` | 64 | `Points must be whole numbers` |
