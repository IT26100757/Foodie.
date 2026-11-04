# Backend endpoint inventory
Generated from the new controllers. Services enforce role, approval, ownership and record-state restrictions. Session cookie authentication; GET /api/csrf before unsafe API requests lacking a same-origin Origin header. No JWT.

## CustomerController
Base: `/api/customer`
```java
@GetMapping("/favorites")
@PutMapping("/favorites/{restaurantId}")
@DeleteMapping("/favorites/{restaurantId}")
@GetMapping("/rewards")
```
Source: `backend/src/main/java/com/foodie/customer/CustomerController.java`

## DeliveryController
Base: `/api/deliveries`
```java
@GetMapping
@GetMapping("/available")
@GetMapping("/earnings")
@PostMapping("/accept/{orderId}")
@PatchMapping("/{id}")
```
Source: `backend/src/main/java/com/foodie/delivery/DeliveryController.java`

## DriverController
Base: `/api/driver`
```java
@GetMapping("/profile")
@PutMapping("/availability")
@GetMapping("/orders/offer")
@PostMapping("/orders/{id}/accept")
@PostMapping("/orders/{id}/reject")
@PostMapping("/orders/{id}/pickup")
@PostMapping("/orders/{id}/complete")
@GetMapping("/earnings")
@GetMapping("/bank-accounts")
@PostMapping("/bank-accounts")
@PostMapping("/payouts")
@PostMapping("/profile/vehicle-change-requests")
```
Source: `backend/src/main/java/com/foodie/driver/DriverController.java`

## OperationsController
Base: ``
```java
@GetMapping("/api/customer/offers")
@GetMapping("/api/offers")
@PostMapping("/api/offers")
@PutMapping("/api/offers/{id}")
@DeleteMapping("/api/offers/{id}")
@GetMapping({"/api/complaints", "/api/driver/complaints"})
@PostMapping({"/api/complaints", "/api/driver/complaints"})
@PostMapping("/api/admin/complaints/{id}/reply")
@GetMapping({"/api/notifications", "/api/driver/notifications"})
@PostMapping({"/api/notifications/read-all", "/api/driver/notifications/read-all"})
@PostMapping({"/api/notifications/{id}/read", "/api/driver/notifications/{id}/read"})
@GetMapping({"/api/merchant/dashboard", "/api/admin/dashboard"})
@GetMapping(value = "/api/reports/sales", produces = "text/csv")
```
Source: `backend/src/main/java/com/foodie/operations/OperationsController.java`

## GuestOrderController
Base: `/api/guest/orders`
```java
@PostMapping
@GetMapping("/{id}")
```
Source: `backend/src/main/java/com/foodie/order/GuestOrderController.java`

## OrderController
Base: `/api/orders`
```java
@GetMapping
@GetMapping("/{id}")
@GetMapping("/{id}/items")
@PostMapping
@PatchMapping("/{id}/status")
@PutMapping("/{id}/additional-charge")
@PostMapping("/{id}/additional-charge/consent")
```
Source: `backend/src/main/java/com/foodie/order/OrderController.java`

## WalletController
Base: ``
```java
@GetMapping("/api/payments")
@PostMapping("/api/payments/collect/{orderId}")
@GetMapping("/api/wallet")
@GetMapping("/api/wallet/bank-accounts")
@PostMapping("/api/wallet/bank-accounts")
@PutMapping("/api/wallet/bank-accounts/{id}")
@DeleteMapping("/api/wallet/bank-accounts/{id}")
@GetMapping("/api/wallet/transfers")
@GetMapping("/api/wallet/transfers/{id}")
@PostMapping("/api/wallet/transfers")
@PatchMapping("/api/admin/payouts/{id}")
@GetMapping({"/api/refunds", "/api/admin/refunds"})
@PostMapping("/api/refunds/{orderId}")
@PostMapping("/api/admin/refunds/{id}")
@PostMapping("/api/admin/payments/{id}/cancel")
```
Source: `backend/src/main/java/com/foodie/payment/WalletController.java`

## RestaurantController
Base: ``
```java
@GetMapping("/api/restaurants")
@GetMapping("/api/restaurants/mine")
@GetMapping("/api/restaurants/{id}")
@PostMapping("/api/restaurants")
@PutMapping("/api/restaurants/{id}")
@DeleteMapping("/api/restaurants/{id}")
@GetMapping("/api/menu-items")
@PostMapping("/api/menu-items")
@PutMapping("/api/menu-items/{id}")
@DeleteMapping("/api/menu-items/{id}")
@PostMapping("/api/menu-items/{id}")
```
Source: `backend/src/main/java/com/foodie/restaurant/RestaurantController.java`

## ReviewController
Base: `/api/reviews`
```java
@GetMapping("/restaurant/{id}")
@PostMapping
@PutMapping("/{id}")
@DeleteMapping("/{id}")
```
Source: `backend/src/main/java/com/foodie/review/ReviewController.java`

## AdminController
Base: `/api/admin`
```java
@GetMapping("/test")
@GetMapping("/csrf")
@GetMapping("/users")
@PatchMapping("/users/{id}")
@GetMapping("/merchants/pending")
@GetMapping("/restaurants")
@GetMapping("/riders")
@PostMapping("/merchants/{id}/approve")
@PostMapping("/merchants/{id}/reject")
@PostMapping("/riders/{id}/approve")
@PostMapping("/riders/{id}/reject")
@GetMapping("/orders")
@GetMapping("/payments")
@GetMapping("/notifications")
@GetMapping("/complaints")
@GetMapping("/coupons")
@PostMapping("/vehicle-changes/{id}/{action}")
@PostMapping("/riders/{id}/suspend")
@PostMapping("/riders/{id}/reactivate")
@PostMapping("/riders/{id}/cancel")
```
Source: `backend/src/main/java/com/foodie/user/controller/AdminController.java`

## ApplicationController
Base: `/api/applications`
```java
@GetMapping
@PostMapping("/verification")
@PostMapping("/verify")
@PutMapping
@PostMapping("/submit")
@PostMapping("/documents/{kind}")
@GetMapping("/documents/{id}")
```
Source: `backend/src/main/java/com/foodie/user/controller/ApplicationController.java`

## AuthController
Base: ``
```java
@GetMapping("/api/csrf")
@PostMapping("/api/auth/register/{role}")
@PostMapping("/api/merchants/register")
@PostMapping("/api/auth/login")
@GetMapping("/api/account")
@PutMapping("/api/account")
@PostMapping("/api/driver/auth/login")
@PostMapping("/api/driver/applications")
@PostMapping("/api/auth/setup-password")
@PatchMapping("/api/driver/profile")
@PostMapping("/api/driver/profile/password")
@PostMapping("/api/driver/profile/email/verify")
@PostMapping("/api/auth/recovery")
```
Source: `backend/src/main/java/com/foodie/user/controller/AuthController.java`
