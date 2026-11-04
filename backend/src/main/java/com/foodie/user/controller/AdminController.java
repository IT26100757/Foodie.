package com.foodie.user.controller;

import com.foodie.operations.OperationsService;
import com.foodie.order.OrderService;
import com.foodie.payment.PaymentService;
import com.foodie.restaurant.repository.RestaurantRepository;
import com.foodie.user.AppUserRepository;
import com.foodie.user.UserService;
import java.util.*;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
  private final com.foodie.driver.DriverService vehicleService;
  private final UserService users;
  private final com.foodie.settings.BusinessPolicyService policies;
  private final RestaurantRepository restaurants;
  private final AppUserRepository accounts;
  private final OrderService orders;
  private final PaymentService payments;
  private final OperationsService operations;

  public AdminController(
      UserService u,
      RestaurantRepository r,
      AppUserRepository a,
      OrderService o,
      PaymentService p,
      OperationsService s,
      com.foodie.driver.DriverService vehicleService,
      com.foodie.settings.BusinessPolicyService policies) {
    this.policies = policies;
    this.vehicleService = vehicleService;
    users = u;
    restaurants = r;
    accounts = a;
    orders = o;
    payments = p;
    operations = s;
  }

  @GetMapping("/policies")
  public Object policies() {
    users.operational("ADMIN");
    return policies.list();
  }

  @PutMapping("/policies")
  public void policies(@RequestBody Map<String, java.math.BigDecimal> values) {
    users.operational("ADMIN");
    policies.save(values);
  }

  @GetMapping("/test")
  public Object test() {
    users.operational("ADMIN");
    return Map.of("message", "Platform Admin authentication successful");
  }

  @GetMapping("/csrf")
  public Object csrf(CsrfToken t) {
    users.operational("ADMIN");
    return Map.of(
        "token",
        t.getToken(),
        "headerName",
        t.getHeaderName(),
        "parameterName",
        t.getParameterName());
  }

  @GetMapping("/users")
  public Object users() {
    return users.accounts();
  }

  @PatchMapping("/users/{id}")
  public void active(@PathVariable Long id, @RequestBody Map<String, Boolean> p) {
    if (!p.containsKey("active") || p.get("active") == null)
      throw new IllegalArgumentException("active required");
    users.active(id, p.get("active"));
  }

  @GetMapping("/merchants/pending")
  public Object pending() {
    users.operational("ADMIN");
    return accounts.findAll().stream()
        .filter(
            u ->
                u.getRole().equals("MERCHANT")
                    && u.getSubmitted()
                    && u.getApprovalStatus().equals("PENDING"))
        .toList();
  }

  @GetMapping("/restaurants")
  public Object restaurants() {
    users.operational("ADMIN");
    return restaurants.findAll().stream()
        .map(
            r -> {
              var u = accounts.findById(r.getOwnerId()).orElseThrow();
              Map<String, Object> p = new LinkedHashMap<>();
              p.put("restaurantId", r.getId());
              p.put("merchantId", u.getId());
              p.put("restaurantName", r.getName());
              p.put("restaurantAddress", r.getAddress());
              p.put("restaurantPhone", r.getPhone());
              p.put("ownerFirstName", u.getFirstName());
              p.put("ownerLastName", u.getLastName());
              p.put("ownerEmail", u.getEmail());
              p.put("registeredAt", u.getCreatedAt());
              p.put("verificationStatus", u.getApprovalStatus());
              p.put("submitted", u.getSubmitted());
              p.put("active", u.getActive());
              p.put("documents", users.documents(u.getId()));
              return p;
            })
        .toList();
  }

  @GetMapping("/riders")
  public Object riders() {
    users.operational("ADMIN");
    return accounts.findAll().stream()
        .filter(u -> u.getRole().equals("RIDER"))
        .map(
            u -> {
              Map<String, Object> p = new LinkedHashMap<>();
              p.put("riderId", u.getId());
              p.put("firstName", u.getFirstName());
              p.put("lastName", u.getLastName());
              p.put("email", u.getEmail());
              p.put("phone", u.getPhone());
              p.put("nationalId", u.getNationalId());
              p.put("vehicleType", u.getVehicle());
              p.put("vehicleNumber", u.getPlate());
              p.put("registeredAt", u.getCreatedAt());
              p.put("documents", users.documents(u.getId()));
              p.put("submitted", u.getSubmitted());
              p.put("dateOfBirth", ((com.foodie.user.model.RiderUser) u).getBirthDate());
              p.put("licenseNumber", ((com.foodie.user.model.RiderUser) u).getLicenseNumber());
              p.put("addressLine1", u.getAddress1());
              p.put("addressLine2", u.getAddress2());
              p.put("addressLine3", u.getAddress3());
              p.put("vehicleChanges", vehicleService.vehicleRequests(u.getId()));
              p.put(
                  "status",
                  !u.getActive()
                      ? "SUSPENDED"
                      : u.getApprovalStatus().equals("APPROVED")
                          ? "ACTIVE"
                          : u.getApprovalStatus().equals("REJECTED") ? "CANCELLED" : "PENDING");
              return p;
            })
        .toList();
  }

  @PostMapping("/merchants/{id}/approve")
  public void approve(@PathVariable Long id) {
    users.decision(id, true, null);
  }

  @PostMapping("/merchants/{id}/reject")
  public void reject(@PathVariable Long id, @RequestBody(required = false) Map<String, String> p) {
    users.decision(id, false, p == null ? null : p.get("reason"));
  }

  @PostMapping("/riders/{id}/approve")
  public void riderApprove(@PathVariable Long id) {
    users.decision(id, true, null);
  }

  @PostMapping("/riders/{id}/reject")
  public void riderReject(
      @PathVariable Long id, @RequestBody(required = false) Map<String, String> p) {
    users.decision(id, false, p == null ? null : p.get("reason"));
  }

  @GetMapping("/orders")
  public Object orders() {
    users.operational("ADMIN");
    return orders.list();
  }

  @GetMapping("/payments")
  public Object payments() {
    users.operational("ADMIN");
    return payments.list();
  }

  @GetMapping("/notifications")
  public Object notifications() {
    users.operational("ADMIN");
    return operations.notifications();
  }

  @GetMapping("/complaints")
  public Object complaints() {
    users.operational("ADMIN");
    return operations.complaints();
  }

  @GetMapping("/coupons")
  public Object offers() {
    users.operational("ADMIN");
    return operations.allOffers();
  }

  @PostMapping("/vehicle-changes/{id}/{action}")
  public void vehicle(@PathVariable Long id, @PathVariable String action) {
    if (!java.util.List.of("approve", "reject").contains(action))
      throw new IllegalArgumentException("Invalid action");
    vehicleService.reviewVehicle(id, action.equals("approve"));
  }

  @PostMapping("/riders/{id}/suspend")
  public void suspend(@PathVariable Long id) {
    users.active(id, false);
  }

  @PostMapping("/riders/{id}/reactivate")
  public void reactivate(@PathVariable Long id) {
    users.active(id, true);
  }

  @PostMapping("/riders/{id}/cancel")
  public void cancelRider(@PathVariable Long id) {
    users.decision(id, false, null);
  }
}
