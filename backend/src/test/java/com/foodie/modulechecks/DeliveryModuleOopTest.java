package com.foodie.modulechecks;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Test-only fixtures; no real DB or cloud services are contacted. */
class DeliveryModuleOopTest {
  @Test
  void deliveryAndVehicleChangeConstructorsAndAccessors() {
    var empty = new com.foodie.delivery.Delivery();
    assertNull(empty.getId());
    var delivery = new com.foodie.delivery.Delivery(15L, 8L, "ASSIGNED");
    assertEquals(15L, delivery.getOrderId());
    assertEquals(8L, delivery.getRiderId());
    assertEquals("ASSIGNED", delivery.getStatus());
    com.foodie.common.DomainEntity base = delivery;
    assertEquals("Delivery{id=null}", base.toString());

    var change = new com.foodie.user.document.VehicleChange(8L, "WP-CAB-1234", "PENDING");
    assertEquals(8L, change.getUserId());
    assertEquals("WP-CAB-1234", change.getRegistration());
    assertEquals("VehicleChange{id=null}", change.toString());
  }

  @Test
  void documentConstructorsAndBinaryHiding() {
    var doc = new com.foodie.user.document.Document(8L, "LICENSE_FRONT", "image/png");
    doc.setContent(new byte[] {1, 2, 3});
    assertEquals(8L, doc.getUserId());
    assertEquals("LICENSE_FRONT", doc.getKind());
    assertEquals("Document{id=null}", doc.toString());
  }
}
