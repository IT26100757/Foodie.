package com.foodie.payment;

import org.springframework.web.bind.annotation.*;

@RestController
public class WalletController {
  private final PaymentService service;

  public WalletController(PaymentService service) {
    this.service = service;
  }

  @GetMapping("/api/payments")
  public Object payments() {
    return service.list();
  }

  @PostMapping("/api/payments/collect/{orderId}")
  public Object collect(@PathVariable Long orderId) {
    return service.collect(orderId);
  }

  @GetMapping("/api/wallet")
  public Object wallet() {
    return service.wallet();
  }

  @GetMapping("/api/wallet/bank-accounts")
  public Object banks() {
    return service.banks();
  }

  @PostMapping("/api/wallet/bank-accounts")
  public Object add(@RequestBody PaymentService.Bank p) {
    return service.bank(null, p);
  }

  @PutMapping("/api/wallet/bank-accounts/{id}")
  public Object edit(@PathVariable Long id, @RequestBody PaymentService.Bank p) {
    return service.bank(id, p);
  }

  @DeleteMapping("/api/wallet/bank-accounts/{id}")
  public void remove(@PathVariable Long id) {
    service.removeBank(id);
  }

  @GetMapping("/api/wallet/transfers")
  public Object transfers() {
    return service.payouts().stream().map(service::transferView).toList();
  }

  @GetMapping("/api/wallet/transfers/{id}")
  public Object transfer(@PathVariable Long id) {
    return service.transfer(id);
  }

  @PostMapping("/api/wallet/transfers")
  public Object request(
      @RequestBody PaymentService.Transfer p,
      @RequestHeader(value = "Idempotency-Key", required = false) String key) {
    return service.request(p, key);
  }

  @PatchMapping("/api/admin/payouts/{id}")
  public Object settle(@PathVariable Long id, @RequestBody PaymentService.Settlement p) {
    return service.settle(id, p);
  }

  @GetMapping({"/api/refunds", "/api/admin/refunds"})
  public Object refunds() {
    return service.refunds();
  }

  @PostMapping("/api/refunds/{orderId}")
  public Object refund(@PathVariable Long orderId, @RequestBody java.util.Map<String, String> p) {
    return service.refund(orderId, p.get("reason"), p.get("message"));
  }

  public record RefundDecision(String status, String reference, boolean verified) {}

  @PostMapping("/api/admin/refunds/{id}")
  public Object refundDecision(@PathVariable Long id, @RequestBody RefundDecision p) {
    return service.refundDecision(id, p.status(), p.reference(), p.verified());
  }

  @PostMapping("/api/admin/payments/{id}/cancel")
  public void cancel(@PathVariable Long id) {
    service.cancelPending(id);
  }
}
