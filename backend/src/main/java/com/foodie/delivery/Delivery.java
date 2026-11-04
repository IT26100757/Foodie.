package com.foodie.delivery;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_deliveries")
public class Delivery extends DomainEntity {
  private Long orderId;

  public Long getOrderId() {
    return orderId;
  }

  public void setOrderId(Long value) {
    this.orderId = value;
  }

  private Long riderId;

  public Long getRiderId() {
    return riderId;
  }

  public void setRiderId(Long value) {
    this.riderId = value;
  }

  @Column(length = 30, unique = false)
  private String status;

  public String getStatus() {
    return status;
  }

  public void setStatus(String value) {
    this.status = value;
  }

  private Instant assignedAt;

  public Instant getAssignedAt() {
    return assignedAt;
  }

  public void setAssignedAt(Instant value) {
    this.assignedAt = value;
  }

  private Instant completedAt;

  public Instant getCompletedAt() {
    return completedAt;
  }

  public void setCompletedAt(Instant value) {
    this.completedAt = value;
  }

  @Column(precision = 16, scale = 4)
  private java.math.BigDecimal serviceRate;

  public java.math.BigDecimal getServiceRate() {
    return serviceRate;
  }

  public void setServiceRate(java.math.BigDecimal value) {
    serviceRate = value;
  }
}
