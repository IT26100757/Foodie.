package com.foodie.user.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("MERCHANT")
public class MerchantUser extends AppUser {
  @Override
  public String getRole() {
    return "MERCHANT";
  }

  @Override
  public boolean requiresApproval() {
    return true;
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public MerchantUser() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public MerchantUser(String firstName, String lastName, String email, String phone) {
    setFirstName(firstName);
    setLastName(lastName);
    setEmail(email);
    setPhone(phone);
    setApprovalStatus("PENDING");
    setActive(true);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "MerchantUser{id=" + getId() + ", role=" + getRole() + "}";
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public MerchantUser() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public MerchantUser(String firstName, String lastName, String email, String phone) {
    setFirstName(firstName);
    setLastName(lastName);
    setEmail(email);
    setPhone(phone);
    setApprovalStatus("PENDING");
    setActive(true);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "MerchantUser{id=" + getId() + ", role=" + getRole() + "}";
  }
}
