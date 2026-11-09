package com.foodie.operations.data;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_complaints")
public class Complaint extends DomainEntity {
  private Long userId;

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long value) {
    this.userId = value;
  }

  @Column(length = 200, unique = false)
  private String subject;

  public String getSubject() {
    return subject;
  }

  public void setSubject(String value) {
    this.subject = value;
  }

  @Column(length = 2000, unique = false)
  private String description;

  public String getDescription() {
    return description;
  }

  public void setDescription(String value) {
    this.description = value;
  }

  @Column(length = 2000, unique = false)
  private String response;

  public String getResponse() {
    return response;
  }

  public void setResponse(String value) {
    this.response = value;
  }

  @Column(length = 20, unique = false)
  private String status;

  public String getStatus() {
    return status;
  }

  public void setStatus(String value) {
    this.status = value;
  }

  private Instant createdAt;

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant value) {
    this.createdAt = value;
  }

  private String type;

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Complaint() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Complaint(Long userId, String type, String subject, String description, String status) {
    setUserId(userId);
    setType(type);
    setSubject(subject);
    setDescription(description);
    setStatus(status);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Complaint{id=" + getId() + "}";
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Complaint() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Complaint(Long userId, String type, String subject, String description, String status) {
    setUserId(userId);
    setType(type);
    setSubject(subject);
    setDescription(description);
    setStatus(status);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Complaint{id=" + getId() + "}";
  }
}
