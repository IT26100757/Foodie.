package com.foodie.payment;

import com.foodie.common.Inputs;
import com.foodie.delivery.DeliveryRepository;
import com.foodie.order.data.FoodOrderRepository;
import com.foodie.payment.model.*;
import com.foodie.payment.repository.*;
import com.foodie.restaurant.repository.RestaurantRepository;
import com.foodie.user.AppUserRepository;
import com.foodie.user.UserService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PaymentService {
  private final com.foodie.settings.BusinessPolicyService policies;

  private final RefundRepository refunds;
  private final PaymentRepository payments;
  private final BankAccountRepository banks;
  private final PayoutRepository payouts;
  private final FoodOrderRepository orders;
  private final DeliveryRepository deliveries;
  private final RestaurantRepository restaurants;
  private final AppUserRepository accounts;
  private final UserService users;
  private final BankCipher cipher;

  public PaymentService(
      PaymentRepository p,
      BankAccountRepository b,
      PayoutRepository t,
      FoodOrderRepository o,
      DeliveryRepository d,
      RestaurantRepository r,
      AppUserRepository a,
      UserService u,
      BankCipher c,
      RefundRepository refunds,
      com.foodie.settings.BusinessPolicyService policies) {
    this.policies = policies;
    this.refunds = refunds;
    payments = p;
    banks = b;
    payouts = t;
    orders = o;
    deliveries = d;
    restaurants = r;
    accounts = a;
    users = u;
    cipher = c;
  }

  public List<Payment> list() {
    var u = users.operational("CUSTOMER", "MERCHANT", "RIDER", "ADMIN");
    return payments.findAll().stream()
        .filter(
            p -> {
              var o = orders.findById(p.getOrderId()).orElseThrow();
              return u.getRole().equals("ADMIN")
                  || u.getRole().equals("CUSTOMER")
                      && java.util.Objects.equals(o.getCustomerId(), u.getId())
                  || u.getRole().equals("MERCHANT")
                      && restaurants
                          .findById(o.getRestaurantId())
                          .orElseThrow()
                          .getOwnerId()
                          .equals(u.getId())
                  || u.getRole().equals("RIDER")
                      && deliveries
                          .findByOrderId(o.getId())
                          .map(d -> d.getRiderId().equals(u.getId()))
                          .orElse(false);
            })
        .toList();
  }

  @Transactional
  public Payment collect(Long orderId) {
    var u = users.operational("MERCHANT", "RIDER");
    var o = orders.lock(orderId).orElseThrow(Inputs::missing);
    if (u.getRole().equals("MERCHANT")) {
      if (!o.getType().equals("PICKUP")
          || !restaurants
              .findById(o.getRestaurantId())
              .orElseThrow()
              .getOwnerId()
              .equals(u.getId())) throw new SecurityException("Pickup Merchant required");
    } else if (deliveries
        .findByOrderId(orderId)
        .filter(d -> d.getRiderId().equals(u.getId()))
        .isEmpty()) throw new SecurityException("Assigned Rider required");
    Inputs.require(
        List.of("DELIVERED", "PICKED_UP").contains(o.getStatus()),
        "Finish fulfilment before recording actual cash collection");
    var p = payments.findByOrderId(orderId).orElseThrow();
    Inputs.require(
        p.getMethod().equals("CASH") && p.getStatus().equals("PENDING"),
        "Payment already settled or unavailable");
    p.setStatus("COLLECTED");
    p.setCollectedBy(u.getId());
    p.setCollectedAt(Instant.now());
    o.setPaymentStatus("COMPLETED");
    return p;
  }

  public Map<String, BigDecimal> balance(Long ownerId) {
    BigDecimal gross = BigDecimal.ZERO, commission = BigDecimal.ZERO;
    if (accounts.findById(ownerId).orElseThrow().getRole().equals("RIDER")) {
      for (var d : deliveries.findByRiderId(ownerId)) {
        var o = orders.findById(d.getOrderId()).orElseThrow();
        if (d.getStatus().equals("DELIVERED")
            && payments
                .findByOrderId(o.getId())
                .map(p -> p.getStatus().equals("COLLECTED"))
                .orElse(false)) {
          gross = gross.add(o.getDeliveryFee());
          commission =
              commission.add(
                  o.getDeliveryFee()
                      .multiply(
                          d.getServiceRate() == null
                              ? policies.amount("driver_service_rate")
                              : d.getServiceRate())
                      .setScale(2, java.math.RoundingMode.HALF_UP));
        }
      }
    } else
      for (var p : payments.findAll()) {
        var o = orders.findById(p.getOrderId()).orElseThrow();
        if (p.getStatus().equals("COLLECTED")
            && restaurants
                .findById(o.getRestaurantId())
                .orElseThrow()
                .getOwnerId()
                .equals(ownerId)) {
          gross =
              gross.add(
                  o.getSubtotal()
                      .subtract(o.getDiscount())
                      .add(o.getCustomerAgreed() ? o.getAdditionalCharge() : BigDecimal.ZERO));
          commission = commission.add(p.getCommission());
        }
      }
    BigDecimal reserved = BigDecimal.ZERO, settled = BigDecimal.ZERO;
    for (var p : payouts.findByOwnerId(ownerId)) {
      if (List.of("PROCESSING", "APPROVED").contains(p.getStatus()))
        reserved = reserved.add(p.getAmount());
      if (p.getStatus().equals("COMPLETED")) settled = settled.add(p.getAmount());
    }
    return Map.of(
        "gross",
        gross,
        "commission",
        commission,
        "net",
        gross.subtract(commission),
        "reserved",
        reserved,
        "paidOut",
        settled,
        "available",
        gross.subtract(commission).subtract(reserved).subtract(settled));
  }

  public Object wallet() {
    return balance(users.operational("MERCHANT", "RIDER").getId());
  }

  public List<BankAccount> banks() {
    return banks.findByOwnerId(users.operational("MERCHANT", "RIDER").getId());
  }

  public record Bank(String bank, String name, String number, String branch, boolean primary) {}

  @Transactional
  public BankAccount bank(Long id, Bank f) {
    var u = users.operational("MERCHANT", "RIDER");
    accounts.lock(u.getId()).orElseThrow();
    var b = id == null ? new BankAccount() : banks.findById(id).orElseThrow(Inputs::missing);
    if (id != null && !b.getOwnerId().equals(u.getId()))
      throw new SecurityException("Bank ownership required");
    String number = Inputs.text(f.number(), 40).replace(" ", "");
    if (!number.matches("[0-9]{4,20}"))
      throw new IllegalArgumentException("Valid full account number required");
    if (f.primary()) for (var old : banks.findByOwnerId(u.getId())) old.setPrimaryAccount(false);
    b.setOwnerId(u.getId());
    b.setBank(Inputs.text(f.bank(), 120));
    b.setName(Inputs.text(f.name(), 120));
    b.setBranch(f.branch() == null || f.branch().isBlank() ? "" : Inputs.text(f.branch(), 120));
    b.setNumberEncrypted(cipher.encrypt(number));
    b.setLastFour(number.substring(number.length() - 4));
    b.setPrimaryAccount(f.primary());
    return banks.save(b);
  }

  @Transactional
  public void removeBank(Long id) {
    var u = users.operational("MERCHANT", "RIDER");
    accounts.lock(u.getId()).orElseThrow();
    var b = banks.findById(id).orElseThrow(Inputs::missing);
    if (!b.getOwnerId().equals(u.getId())) throw new SecurityException("Not your bank account");
    Inputs.require(
        payouts.findByOwnerId(u.getId()).stream().noneMatch(p -> p.getBankAccountId().equals(id)),
        "Bank account has payout history");
    banks.delete(b);
  }

  public List<Payout> payouts() {
    var u = users.operational("MERCHANT", "RIDER", "ADMIN");
    return u.getRole().equals("ADMIN") ? payouts.findAll() : payouts.findByOwnerId(u.getId());
  }

  public Map<String, Object> transferView(Payout p) {
    return Map.of(
        "transactionId",
        p.getId().toString(),
        "bankName",
        p.getBankName(),
        "amount",
        p.getAmount(),
        "currency",
        "LKR",
        "status",
        p.getStatus(),
        "updatedAt",
        p.getUpdatedAt());
  }

  public Object transfer(Long id) {
    var u = users.operational("MERCHANT", "RIDER", "ADMIN");
    var p = payouts.findById(id).orElseThrow(Inputs::missing);
    if (!u.getRole().equals("ADMIN") && !p.getOwnerId().equals(u.getId()))
      throw new SecurityException("Not your payout");
    return transferView(p);
  }

  public record Transfer(
      String bankName,
      String accountHolder,
      String accountLastFour,
      BigDecimal amount,
      Long bankAccountId) {
    public Transfer(
        String bankName, String accountHolder, String accountLastFour, BigDecimal amount) {
      this(bankName, accountHolder, accountLastFour, amount, null);
    }
  }

  @Transactional
  public Object request(Transfer f, String key) {
    var u = users.operational("MERCHANT", "RIDER");
    accounts.lock(u.getId()).orElseThrow();
    Inputs.money(f.amount());
    Inputs.require(f.amount().signum() > 0, "Positive amount required");
    var bank =
        banks.findByOwnerId(u.getId()).stream()
            .filter(
                b ->
                    (f.bankAccountId() == null || b.getId().equals(f.bankAccountId()))
                        && b.getBank().equals(f.bankName())
                        && b.getName().equals(f.accountHolder())
                        && b.getLastFour().equals(f.accountLastFour()))
            .findFirst()
            .orElseThrow(
                () ->
                    new IllegalStateException(
                        "Save a full verified bank account through the bank API first;"
                            + " browser-stored last four digits cannot identify a payout"
                            + " destination"));
    if (key != null) {
      var prior = payouts.findByRequestKey(key);
      if (prior.isPresent()) {
        if (!prior.get().getOwnerId().equals(u.getId())
            || prior.get().getAmount().compareTo(f.amount()) != 0
            || !prior.get().getBankAccountId().equals(bank.getId()))
          throw new IllegalStateException("Request key already used");
        return transferView(prior.get());
      }
    }
    for (var pending : payouts.findByOwnerId(u.getId()))
      if (pending.getStatus().equals("PROCESSING")
          && pending.getBankAccountId().equals(bank.getId())
          && pending.getAmount().compareTo(f.amount()) == 0) return transferView(pending);
    Inputs.require(
        f.amount().compareTo(balance(u.getId()).get("available")) <= 0,
        "Insufficient collected funds");
    Payout p = new Payout();
    p.setOwnerId(u.getId());
    p.setBankAccountId(bank.getId());
    p.setBankName(bank.getBank());
    p.setAmount(f.amount());
    p.setRequestKey(key == null ? UUID.randomUUID().toString() : Inputs.text(key, 80));
    p.setStatus("PROCESSING");
    p.setUpdatedAt(Instant.now());
    return transferView(payouts.saveAndFlush(p));
  }

  public record Settlement(String status, String reference, boolean verified) {}

  @Transactional
  public Payout settle(Long id, Settlement f) {
    Inputs.text(f.status(), 30);
    var admin = users.operational("ADMIN");
    var initial = payouts.findById(id).orElseThrow(Inputs::missing);
    accounts.lock(initial.getOwnerId()).orElseThrow();
    var p = payouts.lock(id).orElseThrow();
    if ("APPROVED".equals(f.status()))
      Inputs.require(p.getStatus().equals("PROCESSING"), "Already reviewed");
    else if ("REJECTED".equals(f.status()))
      Inputs.require(List.of("PROCESSING", "APPROVED").contains(p.getStatus()), "Already settled");
    else if ("COMPLETED".equals(f.status())) {
      Inputs.require(
          p.getStatus().equals("APPROVED") && f.verified(),
          "Admin must independently verify actual bank settlement");
      p.setSettlementReference(Inputs.text(f.reference(), 150));
    } else throw new IllegalArgumentException("Invalid payout status");
    p.setStatus(f.status());
    p.setReviewedBy(admin.getId());
    p.setUpdatedAt(Instant.now());
    return p;
  }

  public Object refunds() {
    var u = users.operational("CUSTOMER", "ADMIN");
    return refunds.findAll().stream()
        .filter(f -> u.getRole().equals("ADMIN") || f.getCustomerId().equals(u.getId()))
        .toList();
  }

  @Transactional
  public Refund refund(Long orderId, String reason, String message) {
    var u = users.operational("CUSTOMER");
    var o = orders.lock(orderId).orElseThrow(Inputs::missing);
    if (!u.getId().equals(o.getCustomerId())) throw new SecurityException("Not your payment");
    var p = payments.findByOrderId(orderId).orElseThrow();
    Inputs.require(
        p.getStatus().equals("COLLECTED") && !refunds.existsByOrderId(orderId),
        "Refund requires a collected unrefunded payment");
    var f = new Refund();
    f.setCustomerId(u.getId());
    f.setOrderId(orderId);
    f.setReason(Inputs.text(reason, 500));
    f.setMessage(Inputs.text(message, 2000));
    f.setStatus("PENDING");
    f.setRequestedAt(Instant.now());
    return refunds.save(f);
  }

  @Transactional
  public Refund refundDecision(Long id, String target, String reference, boolean verified) {
    target = Inputs.text(target, 25);
    users.operational("ADMIN");
    var initial = refunds.findById(id).orElseThrow(Inputs::missing);
    var o = orders.lock(initial.getOrderId()).orElseThrow();
    var f = refunds.lock(id).orElseThrow();
    if (List.of("APPROVED", "REJECTED").contains(target)) {
      Inputs.require(f.getStatus().equals("PENDING"), "Refund already reviewed");
      f.setStatus(target);
    } else if ("COMPLETED".equals(target)) {
      Inputs.require(
          f.getStatus().equals("APPROVED") && verified,
          "Verify actual refund settlement before completion");
      f.setSettlementReference(Inputs.text(reference, 150));
      var p = payments.findByOrderId(o.getId()).orElseThrow();
      Inputs.require(p.getStatus().equals("COLLECTED"), "Payment already refunded");
      p.setStatus("REFUNDED");
      o.setPaymentStatus("REFUNDED");
      f.setStatus("COMPLETED");
    } else throw new IllegalArgumentException("Invalid refund decision");
    return f;
  }

  @Transactional
  public void cancelPending(Long id) {
    users.operational("ADMIN");
    var initial = payments.findById(id).orElseThrow(Inputs::missing);
    var o = orders.lock(initial.getOrderId()).orElseThrow();
    var p = payments.findById(id).orElseThrow();
    Inputs.require(
        o.getStatus().equals("NEW") && p.getStatus().equals("PENDING"),
        "Only pending payments on new orders can be cancelled");
    o.setStatus("CANCELLED");
    o.setPaymentStatus("CANCELLED");
    p.setStatus("CANCELLED");
  }
}
