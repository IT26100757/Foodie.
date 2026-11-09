package com.foodie.modulechecks;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Test-only fixtures; no real DB or cloud services are contacted. */
class OrderModuleOopTest {
  @Test
  void foodOrderConstructorsAndAccessors() {
    var empty = new com.foodie.order.data.FoodOrder();
    assertNull(empty.getId());
    var item = new com.foodie.order.data.FoodOrder(7L, 7L, "sample-type", "sample-status");
    assertEquals(7L, item.getCustomerId());
    assertEquals(7L, item.getRestaurantId());
    assertEquals("sample-type", item.getType());
    assertEquals("sample-status", item.getStatus());
    empty.setCustomerId(item.getCustomerId());
    assertEquals(item.getCustomerId(), empty.getCustomerId());
    com.foodie.common.DomainEntity base = item;
    assertEquals("FoodOrder{id=null}", base.toString());
  }
  @Test
  void orderLineConstructorsAndAccessors() {
    var empty = new com.foodie.order.data.OrderLine();
    assertNull(empty.getId());
    var item = new com.foodie.order.data.OrderLine(7L, 7L, "sample-name", 4, new java.math.BigDecimal("250.00"));
    assertEquals(7L, item.getOrderId());
    assertEquals(7L, item.getMenuItemId());
    assertEquals("sample-name", item.getName());
    assertEquals(4, item.getQuantity());
    assertEquals(new java.math.BigDecimal("250.00"), item.getUnitPrice());
    empty.setOrderId(item.getOrderId());
    assertEquals(item.getOrderId(), empty.getOrderId());
    com.foodie.common.DomainEntity base = item;
    assertEquals("OrderLine{id=null}", base.toString());
  }
}
