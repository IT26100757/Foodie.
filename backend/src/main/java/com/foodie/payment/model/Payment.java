package com.foodie.payment.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_payments")
public class Payment extends DomainEntity {
  private Long orderId;

  public Long getOrderId() {
    return orderId;
  }

  public void setOrderId(Long value) {
    this.orderId = value;
  }

  @Column(length = 30, unique = false)
  private String method;

  public String getMethod() {
    return method;
  }

  public void setMethod(String value) {
    this.method = value;
  }

  @Column(length = 30, unique = false)
  private String status;

  public String getStatus() {
    return status;
  }

  public void setStatus(String value) {
    this.status = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal amount;

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal value) {
    this.amount = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal commission;

  public BigDecimal getCommission() {
    return commission;
  }

  public void setCommission(BigDecimal value) {
    this.commission = value;
  }

  private Long collectedBy;

  public Long getCollectedBy() {
    return collectedBy;
  }

  public void setCollectedBy(Long value) {
    this.collectedBy = value;
  }

  private Instant collectedAt;

  public Instant getCollectedAt() {
    return collectedAt;
  }

  public void setCollectedAt(Instant value) {
    this.collectedAt = value;
  }
}
