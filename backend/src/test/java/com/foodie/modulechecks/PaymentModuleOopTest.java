package com.foodie.modulechecks;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Test-only fixtures; no real DB or cloud services are contacted. */
class PaymentModuleOopTest {
  @Test
  void paymentAndBankConstructorsAndInformationHiding() {
    var payment = new com.foodie.payment.model.Payment(10L, "CASH", "PENDING", new java.math.BigDecimal("1150.00"));
    assertEquals(10L, payment.getOrderId());
    assertEquals("CASH", payment.getMethod());
    assertEquals("PENDING", payment.getStatus());
    assertEquals(new java.math.BigDecimal("1150.00"), payment.getAmount());
    assertEquals("Payment{id=null}", payment.toString());

    var bank = new com.foodie.payment.model.BankAccount(4L, "Sample Bank", "Account Holder", "4321");
    bank.setNumberEncrypted("encrypted-secret");
    assertEquals("4321", bank.getLastFour());
    assertFalse(bank.toString().contains("encrypted-secret"));
    assertEquals("BankAccount{id=null}", bank.toString());
  }

  @Test
  void payoutAndRefundConstructorsAndAccessors() {
    var payout = new com.foodie.payment.model.Payout(4L, 2L, new java.math.BigDecimal("500.00"), "PROCESSING");
    assertEquals(4L, payout.getOwnerId());
    assertEquals(2L, payout.getBankAccountId());
    assertEquals("Payout{id=null}", payout.toString());

    var refund = new com.foodie.payment.model.Refund(10L, 6L, "Damaged item", "PENDING");
    assertEquals(10L, refund.getOrderId());
    assertEquals("Damaged item", refund.getReason());
    assertEquals("Refund{id=null}", refund.toString());
  }
}
