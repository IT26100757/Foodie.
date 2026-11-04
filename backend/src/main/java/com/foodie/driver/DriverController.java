package com.foodie.driver;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/driver")
public class DriverController {
  private final DriverService service;

  public DriverController(DriverService service) {
    this.service = service;
  }

  public record Availability(boolean available, Double latitude, Double longitude) {}

  public record Bank(String bank, String accountHolder, String accountNumber) {}

  public record Payout(Long bankAccountId, BigDecimal amount) {}

  @GetMapping("/orders/active")
  public ResponseEntity<Object> active() {
    var order = service.activeOrder();
    return order == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(order);
  }

  @GetMapping("/orders/history")
  public Object history() {
    return service.history();
  }

  @GetMapping("/profile")
  public Object profile() {
    return service.profile();
  }

  @PutMapping("/availability")
  public void availability(@RequestBody Availability p) {
    service.availability(p.available(), p.latitude(), p.longitude());
  }

  @GetMapping("/orders/offer")
  public ResponseEntity<Object> offer() {
    var o = service.offer();
    return o == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(o);
  }

  @PostMapping("/orders/{id}/accept")
  public Object accept(@PathVariable Long id) {
    return service.accept(id);
  }

  @PostMapping("/orders/{id}/reject")
  public void reject(@PathVariable Long id) {
    service.decline(id);
  }

  @PostMapping("/orders/{id}/pickup")
  public void pickup(@PathVariable Long id) {
    service.progress(id, "ON_DELIVERY");
  }

  @PostMapping("/orders/{id}/complete")
  public void complete(@PathVariable Long id) {
    service.progress(id, "DELIVERED");
  }

  @GetMapping("/earnings")
  public Object earnings(@RequestParam LocalDate from, @RequestParam LocalDate to) {
    return service.earnings(from, to);
  }

  @GetMapping("/bank-accounts")
  public Object banks() {
    return service.banks();
  }

  @PostMapping("/bank-accounts")
  public void bank(@RequestBody Bank p) {
    service.bank(p.bank(), p.accountHolder(), p.accountNumber());
  }

  @PostMapping("/payouts")
  public Object payout(@RequestBody Payout p) {
    return service.payout(p.bankAccountId(), p.amount());
  }

  @PostMapping("/profile/vehicle-change-requests")
  public Object vehicle(
      @RequestParam String registration, @RequestParam Map<String, MultipartFile> files)
      throws Exception {
    return service.vehicle(registration, files);
  }
}
