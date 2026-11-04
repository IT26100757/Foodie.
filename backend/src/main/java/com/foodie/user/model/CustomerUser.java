package com.foodie.user.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("CUSTOMER")
public class CustomerUser extends AppUser {
  @Override
  public String getRole() {
    return "CUSTOMER";
  }

  @Override
  public boolean requiresApproval() {
    return false;
  }
}
