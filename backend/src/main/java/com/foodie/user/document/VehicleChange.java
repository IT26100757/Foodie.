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
}
