package com.foodie.user.document;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_documents")
public class Document extends DomainEntity {
  private Long userId;

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long value) {
    this.userId = value;
  }

  @Column(length = 40, unique = false)
  private String kind;

  public String getKind() {
    return kind;
  }

  public void setKind(String value) {
    this.kind = value;
  }

  @Column(length = 80, unique = false)
  private String mediaType;

  public String getMediaType() {
    return mediaType;
  }

  public void setMediaType(String value) {
    this.mediaType = value;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore @Lob private byte[] content;

  public byte[] getContent() {
    return content;
  }

  public void setContent(byte[] value) {
    this.content = value;
  }

  private Long vehicleChangeId;

  public Long getVehicleChangeId() {
    return vehicleChangeId;
  }

  public void setVehicleChangeId(Long v) {
    vehicleChangeId = v;
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Document() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Document(Long userId, String kind, String mediaType) {
    setUserId(userId);
    setKind(kind);
    setMediaType(mediaType);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Document{id=" + getId() + "}";
  }
}
