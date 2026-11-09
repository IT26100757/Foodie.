package com.foodie.order;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guest/orders")
public class GuestOrderController {
    private final OrderService service;

    public GuestOrderController(OrderService service) {
        this.service = service;
    }

    @PostMapping("/quote")
    public Object quote(@RequestBody OrderService.Checkout checkout) {
        return service.quote(checkout);
    }

    @PostMapping
    public Object create(
            @RequestBody OrderService.Guest p, @RequestHeader("Idempotency-Key") String key) {
        return service.guest(p, key);
    }

    @GetMapping("/{id}")
    public Object get(@PathVariable Long id, @RequestHeader("X-Guest-Token") String token) {
        return service.guestOrder(id, token);
    }

    @PostMapping("/{id}/additional-charge/consent")
    public void consent(
            @PathVariable Long id,
            @RequestHeader("X-Guest-Token") String token,
            @RequestBody java.util.Map<String, java.math.BigDecimal> body) {
        service.guestConsent(id, token, body.get("amount"));
    }
}
