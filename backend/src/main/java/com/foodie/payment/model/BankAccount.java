package com.foodie.payment.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_bank_accounts")
public class BankAccount extends DomainEntity {
  private Long ownerId;

  public Long getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(Long value) {
    this.ownerId = value;
  }

  @Column(length = 120, unique = false)
  private String bank;

  public String getBank() {
    return bank;
  }

  public void setBank(String value) {
    this.bank = value;
  }

  @Column(length = 120, unique = false)
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String value) {
    this.name = value;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore
  @Column(length = 1000, unique = false)
  private String numberEncrypted;

  public String getNumberEncrypted() {
    return numberEncrypted;
  }

  public void setNumberEncrypted(String value) {
    this.numberEncrypted = value;
  }

  @Column(length = 4, unique = false)
  private String lastFour;

  public String getLastFour() {
    return lastFour;
  }

  public void setLastFour(String value) {
    this.lastFour = value;
  }

  @Column(length = 120, unique = false)
  private String branch;

  public String getBranch() {
    return branch;
  }

  public void setBranch(String value) {
    this.branch = value;
  }

  private boolean primaryAccount;

  public boolean getPrimaryAccount() {
    return primaryAccount;
  }

  public void setPrimaryAccount(boolean value) {
    this.primaryAccount = value;
  }
}
