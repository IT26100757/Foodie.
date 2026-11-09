package com.foodie.modulechecks;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Test-only fixtures; no real DB or cloud services are contacted. */
class ReviewModuleOopTest {
  @Test
  void reviewConstructorsAndAccessors() {
    var empty = new com.foodie.review.Review();
    assertNull(empty.getId());
    var review = new com.foodie.review.Review(11L, 4L, 2L, 5, "Great food and fast delivery");
    assertEquals(11L, review.getOrderId());
    assertEquals(4L, review.getCustomerId());
    assertEquals(2L, review.getRestaurantId());
    assertEquals(5, review.getRating());
    assertEquals("Great food and fast delivery", review.getComment());
    com.foodie.common.DomainEntity base = review;
    assertEquals("Review{id=null}", base.toString());
  }

  @Test
  void offerAndComplaintConstructorsAndAccessors() {
    var offer = new com.foodie.operations.data.Offer(
        2L, "Weekend Deal", "WKND10", "PERCENTAGE", new java.math.BigDecimal("10.00"));
    assertEquals("WKND10", offer.getCode());
    assertEquals("Offer{id=null}", offer.toString());

    var complaint = new com.foodie.operations.data.Complaint(
        4L, "Merchant", "Late order", "Order arrived cold", "OPEN");
    assertEquals("OPEN", complaint.getStatus());
    assertEquals("Complaint{id=null}", complaint.toString());
  }
}
