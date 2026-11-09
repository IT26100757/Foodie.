package com.foodie.notification;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_notifications")
public class Notification extends DomainEntity {
  private Long userId;

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long value) {
    this.userId = value;
  }

  @Column(length = 200, unique = false)
  private String title;

  public String getTitle() {
    return title;
  }

  public void setTitle(String value) {
    this.title = value;
  }

  @Column(length = 2000, unique = false)
  private String text;

  public String getText() {
    return text;
  }

  public void setText(String value) {
    this.text = value;
  }

  @Column(length = 80, unique = false)
  private String destination;

  public String getDestination() {
    return destination;
  }

  public void setDestination(String value) {
    this.destination = value;
  }

  @Column(length = 20, unique = false)
  private String emailStatus;

  public String getEmailStatus() {
    return emailStatus;
  }

  public void setEmailStatus(String value) {
    this.emailStatus = value;
  }

  private Instant createdAt;

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant value) {
    this.createdAt = value;
  }
}
