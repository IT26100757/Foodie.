package com.foodie.modulechecks;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Test-only fixtures; no real DB or cloud services are contacted. */
class RestaurantModuleOopTest {
  @Test
  void restaurantConstructorsAndAccessors() {
    var empty = new com.foodie.restaurant.model.Restaurant();
    assertNull(empty.getId());
    var r = new com.foodie.restaurant.model.Restaurant(3L, "Spice Garden", "Kiribathgoda", "Sri Lankan");
    assertEquals(3L, r.getOwnerId());
    assertEquals("Spice Garden", r.getName());
    assertEquals("Kiribathgoda", r.getLocation());
    assertEquals("Sri Lankan", r.getCuisine());
    com.foodie.common.DomainEntity base = r;
    assertEquals("Restaurant{id=null}", base.toString());
  }

  @Test
  void menuItemAndSizeConstructorsAndAccessors() {
    var item = new com.foodie.restaurant.model.MenuItem(3L, "Kottu", "Mains", new java.math.BigDecimal("950.00"));
    assertEquals(3L, item.getRestaurantId());
    assertEquals("Kottu", item.getName());
    assertEquals(new java.math.BigDecimal("950.00"), item.getPrice());
    assertEquals("MenuItem{id=null}", item.toString());

    var size = new com.foodie.restaurant.model.MenuSize(9L, "Large", new java.math.BigDecimal("1200.00"), true);
    assertEquals(9L, size.getItemId());
    assertEquals("Large", size.getName());
    assertTrue(size.getSelected());
    assertEquals("MenuSize{id=null}", size.toString());
  }
}
