package com.foodie.user.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("ADMIN")
public class AdminUser extends AppUser {
  @Override
  public String getRole() {
    return "ADMIN";
  }

  @Override
  public boolean requiresApproval() {
    return false;
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public AdminUser() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public AdminUser(String firstName, String lastName, String email, String phone) {
    setFirstName(firstName);
    setLastName(lastName);
    setEmail(email);
    setPhone(phone);
    setApprovalStatus("APPROVED");
    setActive(true);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "AdminUser{id=" + getId() + ", role=" + getRole() + "}";
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public AdminUser() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public AdminUser(String firstName, String lastName, String email, String phone) {
    setFirstName(firstName);
    setLastName(lastName);
    setEmail(email);
    setPhone(phone);
    setApprovalStatus("APPROVED");
    setActive(true);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "AdminUser{id=" + getId() + ", role=" + getRole() + "}";
  }
}
