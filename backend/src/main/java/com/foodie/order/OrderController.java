package com.foodie.order;

import java.math.BigDecimal;
import java.util.Map;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
public class OrderController {
    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    @GetMapping
    public Object list() {
        return service.list();
    }

    @GetMapping("/{id}")
    public Object get(@PathVariable Long id) {
        return service.visible(id);
    }

    @GetMapping("/{id}/tracking")
    public Object tracking(@PathVariable Long id) {
        return service.tracking(id);
    }

    @GetMapping("/{id}/items")
    public Object items(@PathVariable Long id) {
        return service.lines(id);
    }

    @PostMapping
    public Object create(
            @RequestBody OrderService.Checkout form, @RequestHeader("Idempotency-Key") String key) {
        return service.checkout(form, key);
    }

    @PatchMapping("/{id}/status")
    public Object status(@PathVariable Long id, @RequestBody Map<String, String> p) {
        return service.status(id, p.get("status"));
    }

    @PutMapping("/{id}/additional-charge")
    public void propose(@PathVariable Long id, @RequestBody Map<String, BigDecimal> p) {
        service.proposeCharge(id, p.get("amount"));
    }

    @PostMapping("/{id}/additional-charge/consent")
    public void consent(@PathVariable Long id, @RequestBody Map<String, BigDecimal> p) {
        service.consent(id, p.get("amount"));
    }
}
