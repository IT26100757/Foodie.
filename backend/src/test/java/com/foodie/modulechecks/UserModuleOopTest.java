package com.foodie.modulechecks;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

/** Test-only fixtures; no real DB or cloud services are contacted. */
class UserModuleOopTest {
  @Test
  void userRoleHierarchyAndPolymorphism() {
    com.foodie.user.model.AppUser customer =
        new com.foodie.user.model.CustomerUser("Amal", "Perera", "amal@example.test", "0771234567");
    assertEquals("CUSTOMER", customer.getRole());
    assertFalse(customer.requiresApproval());
    assertTrue(customer.canOperate());
    assertEquals("CustomerUser{id=null, role=CUSTOMER}", customer.toString());

    com.foodie.user.model.AppUser merchant =
        new com.foodie.user.model.MerchantUser("Nimal", "Silva", "nimal@example.test", "0777654321");
    assertEquals("MERCHANT", merchant.getRole());
    assertTrue(merchant.requiresApproval());
    assertFalse(merchant.canOperate());
    merchant.setApprovalStatus("APPROVED");
    assertTrue(merchant.canOperate());
  }

  @Test
  void favoriteConstructorsAndAccessors() {
    var empty = new com.foodie.customer.Favorite();
    assertNull(empty.getId());
    var fav = new com.foodie.customer.Favorite(5L, 12L);
    assertEquals(5L, fav.getUserId());
    assertEquals(12L, fav.getRestaurantId());
    com.foodie.common.DomainEntity base = fav;
    assertEquals("Favorite{id=null}", base.toString());
  }
}
