package com.foodie.delivery;

import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {
  private final DeliveryService service;

  public DeliveryController(DeliveryService service) {
    this.service = service;
  }

  @GetMapping
  public Object mine() {
    return service.mine();
  }

  @GetMapping("/available")
  public Object available() {
    return service.available();
  }

  @GetMapping("/earnings")
  public Object earnings() {
    return service.earnings();
  }

  @PostMapping("/accept/{orderId}")
  public Object accept(@PathVariable Long orderId) {
    return service.accept(orderId);
  }

  @PatchMapping("/{id}")
  public Object status(@PathVariable Long id, @RequestBody Map<String, String> p) {
    return service.status(id, p.get("status"));
  }
}
