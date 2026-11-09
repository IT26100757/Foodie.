package com.foodie.payment.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "nf_refunds")
public class Refund extends DomainEntity {
  @Column(unique = true)
  private Long orderId;

  private Long customerId;

  @Column(length = 500)
  private String reason;

  @Column(length = 2000)
  private String message;

  @Column(length = 25)
  private String status;

  private Instant requestedAt;

  @Column(length = 150)
  private String settlementReference;

  public Long getOrderId() {
    return orderId;
  }

  public void setOrderId(Long v) {
    orderId = v;
  }

  public Long getCustomerId() {
    return customerId;
  }

  public void setCustomerId(Long v) {
    customerId = v;
  }

  public String getReason() {
    return reason;
  }

  public void setReason(String v) {
    reason = v;
  }

  public String getMessage() {
    return message;
  }

  public void setMessage(String v) {
    message = v;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String v) {
    status = v;
  }

  public Instant getRequestedAt() {
    return requestedAt;
  }

  public void setRequestedAt(Instant v) {
    requestedAt = v;
  }

  public String getSettlementReference() {
    return settlementReference;
  }

  public void setSettlementReference(String v) {
    settlementReference = v;
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Refund() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Refund(Long orderId, Long customerId, String reason, String status) {
    setOrderId(orderId);
    setCustomerId(customerId);
    setReason(reason);
    setStatus(status);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Refund{id=" + getId() + "}";
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Refund() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Refund(Long orderId, Long customerId, String reason, String status) {
    setOrderId(orderId);
    setCustomerId(customerId);
    setReason(reason);
    setStatus(status);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Refund{id=" + getId() + "}";
  }
}
