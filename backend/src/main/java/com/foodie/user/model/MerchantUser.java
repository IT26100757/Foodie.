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
}
