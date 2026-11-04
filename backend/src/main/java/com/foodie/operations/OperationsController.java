package com.foodie.operations;

import java.time.LocalDate;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
public class OperationsController {
  private final OperationsService service;

  public OperationsController(OperationsService service) {
    this.service = service;
  }

  @GetMapping("/api/customer/offers")
  public Object published() {
    return service.customerOffers();
  }

  @GetMapping("/api/offers")
  public Object offers() {
    return service.allOffers();
  }

  @PostMapping("/api/offers")
  public Object create(@RequestBody OperationsService.Promotion p) {
    return service.offer(null, p);
  }

  @PutMapping("/api/offers/{id}")
  public Object edit(@PathVariable Long id, @RequestBody OperationsService.Promotion p) {
    return service.offer(id, p);
  }

  @DeleteMapping("/api/offers/{id}")
  public void cancel(@PathVariable Long id) {
    service.cancelOffer(id);
  }

  @GetMapping({"/api/complaints", "/api/driver/complaints"})
  public Object complaints() {
    return service.complaints();
  }

  @PostMapping({"/api/complaints", "/api/driver/complaints"})
  public Object complaint(@RequestBody OperationsService.Concern p) {
    return service.complaint(p);
  }

  @PostMapping("/api/admin/complaints/{id}/reply")
  public void reply(@PathVariable Long id, @RequestBody Map<String, String> p) {
    service.reply(id, p.get("response"));
  }

  @GetMapping({"/api/notifications", "/api/driver/notifications"})
  public Object notes() {
    return service.notifications();
  }

  @PostMapping({"/api/notifications/read-all", "/api/driver/notifications/read-all"})
  public void read() {
    service.read(null);
  }

  @PostMapping({"/api/notifications/{id}/read", "/api/driver/notifications/{id}/read"})
  public void read(@PathVariable Long id) {
    service.read(id);
  }

  @GetMapping({"/api/merchant/dashboard", "/api/admin/dashboard"})
  public Object dashboard() {
    return service.dashboard();
  }

  @GetMapping(value = "/api/reports/sales", produces = "text/csv")
  public ResponseEntity<String> report(@RequestParam LocalDate from, @RequestParam LocalDate to) {
    return ResponseEntity.ok()
        .header("Content-Disposition", "attachment; filename=foodie-sales.csv")
        .body(service.report(from, to));
  }
}
