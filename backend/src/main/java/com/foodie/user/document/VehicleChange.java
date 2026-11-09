package com.foodie.user.document;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "nf_vehicle_changes")
public class VehicleChange extends DomainEntity {
  private Long userId;
  private String registration;
  private String status;
  private Instant createdAt;

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long v) {
    userId = v;
  }

  public String getRegistration() {
    return registration;
  }

  public void setRegistration(String v) {
    registration = v;
  }

  public String getStatus() {
    return status;
  }

  public void setStatus(String v) {
    status = v;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant v) {
    createdAt = v;
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public VehicleChange() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public VehicleChange(Long userId, String registration, String status) {
    setUserId(userId);
    setRegistration(registration);
    setStatus(status);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "VehicleChange{id=" + getId() + "}";
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public VehicleChange() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public VehicleChange(Long userId, String registration, String status) {
    setUserId(userId);
    setRegistration(registration);
    setStatus(status);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "VehicleChange{id=" + getId() + "}";
  }
}
