package com.foodie.payment.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_payouts")
public class Payout extends DomainEntity {
  private Long ownerId;

  public Long getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(Long value) {
    this.ownerId = value;
  }

  private Long bankAccountId;

  public Long getBankAccountId() {
    return bankAccountId;
  }

  public void setBankAccountId(Long value) {
    this.bankAccountId = value;
  }

  @Column(length = 120, unique = false)
  private String bankName;

  public String getBankName() {
    return bankName;
  }

  public void setBankName(String value) {
    this.bankName = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal amount;

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal value) {
    this.amount = value;
  }

  @Column(length = 30, unique = false)
  private String status;

  public String getStatus() {
    return status;
  }

  public void setStatus(String value) {
    this.status = value;
  }

  @Column(length = 80, unique = true)
  private String requestKey;

  public String getRequestKey() {
    return requestKey;
  }

  public void setRequestKey(String value) {
    this.requestKey = value;
  }

  @Column(length = 150, unique = false)
  private String settlementReference;

  public String getSettlementReference() {
    return settlementReference;
  }

  public void setSettlementReference(String value) {
    this.settlementReference = value;
  }

  private Long reviewedBy;

  public Long getReviewedBy() {
    return reviewedBy;
  }

  public void setReviewedBy(Long value) {
    this.reviewedBy = value;
  }

  private Instant updatedAt;

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant value) {
    this.updatedAt = value;
  }
}
