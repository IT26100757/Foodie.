package com.foodie.settings;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "nf_business_policies")
public class BusinessPolicy {
  @Id private String policyKey;

  @Column(nullable = false, precision = 16, scale = 4)
  private BigDecimal amount;

  public String getPolicyKey() {
    return policyKey;
  }

  public void setPolicyKey(String value) {
    policyKey = value;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal value) {
    amount = value;
  }
}
