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
}
