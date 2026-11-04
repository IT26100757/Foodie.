package com.foodie.customer;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer")
public class CustomerController {
  private final CustomerService service;
  private final com.foodie.settings.BusinessPolicyService policies;

  public CustomerController(
      CustomerService service, com.foodie.settings.BusinessPolicyService policies) {
    this.policies = policies;
    this.service = service;
  }

  @GetMapping("/policies")
  public Object policies() {
    return policies.list();
  }

  @GetMapping("/favorites")
  public Object favorites() {
    return service.favorites();
  }

  @PutMapping("/favorites/{restaurantId}")
  public void add(@PathVariable Long restaurantId) {
    service.favorite(restaurantId, true);
  }

  @DeleteMapping("/favorites/{restaurantId}")
  public void remove(@PathVariable Long restaurantId) {
    service.favorite(restaurantId, false);
  }

  @GetMapping("/rewards")
  public Object rewards() {
    return service.rewards();
  }
}
