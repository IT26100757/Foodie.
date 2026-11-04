package com.foodie.user.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_users")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", length = 20)
public abstract class AppUser extends DomainEntity {
  @Column(length = 80, unique = false)
  private String firstName;

  public String getFirstName() {
    return firstName;
  }

  public void setFirstName(String value) {
    this.firstName = value;
  }

  @Column(length = 80, unique = false)
  private String lastName;

  public String getLastName() {
    return lastName;
  }

  public void setLastName(String value) {
    this.lastName = value;
  }

  @Column(length = 20, unique = true)
  private String nationalId;

  public String getNationalId() {
    return nationalId;
  }

  public void setNationalId(String value) {
    this.nationalId = value;
  }

  @Column(length = 150, unique = true)
  private String email;

  public String getEmail() {
    return email;
  }

  public void setEmail(String value) {
    this.email = value;
  }

  @Column(length = 30, unique = true)
  private String phone;

  public String getPhone() {
    return phone;
  }

  public void setPhone(String value) {
    this.phone = value;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore
  @Column(length = 255, unique = false)
  private String passwordHash;

  public String getPasswordHash() {
    return passwordHash;
  }

  public void setPasswordHash(String value) {
    this.passwordHash = value;
  }

  @Column(length = 255, unique = false)
  private String address1;

  public String getAddress1() {
    return address1;
  }

  public void setAddress1(String value) {
    this.address1 = value;
  }

  @Column(length = 255, unique = false)
  private String address2;

  public String getAddress2() {
    return address2;
  }

  public void setAddress2(String value) {
    this.address2 = value;
  }

  @Column(length = 255, unique = false)
  private String address3;

  public String getAddress3() {
    return address3;
  }

  public void setAddress3(String value) {
    this.address3 = value;
  }

  @Column(length = 120, unique = false)
  private String city;

  public String getCity() {
    return city;
  }

  public void setCity(String value) {
    this.city = value;
  }

  @Column(length = 20, unique = false)
  private String postalCode;

  public String getPostalCode() {
    return postalCode;
  }

  public void setPostalCode(String value) {
    this.postalCode = value;
  }

  @Column(length = 20, unique = false)
  private String approvalStatus;

  public String getApprovalStatus() {
    return approvalStatus;
  }

  public void setApprovalStatus(String value) {
    this.approvalStatus = value;
  }

  private boolean active;

  public boolean getActive() {
    return active;
  }

  public void setActive(boolean value) {
    this.active = value;
  }

  private boolean emailVerified;

  public boolean getEmailVerified() {
    return emailVerified;
  }

  public void setEmailVerified(boolean value) {
    this.emailVerified = value;
  }

  private boolean submitted;

  public boolean getSubmitted() {
    return submitted;
  }

  public void setSubmitted(boolean value) {
    this.submitted = value;
  }

  @Column(length = 80, unique = false)
  private String vehicle;

  public String getVehicle() {
    return vehicle;
  }

  public void setVehicle(String value) {
    this.vehicle = value;
  }

  @Column(length = 40, unique = false)
  private String plate;

  public String getPlate() {
    return plate;
  }

  public void setPlate(String value) {
    this.plate = value;
  }

  @Column(length = 120, unique = false)
  private String area;

  public String getArea() {
    return area;
  }

  public void setArea(String value) {
    this.area = value;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore
  @Column(length = 64, unique = false)
  private String verificationHash;

  public String getVerificationHash() {
    return verificationHash;
  }

  public void setVerificationHash(String value) {
    this.verificationHash = value;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore private Instant verificationExpires;

  public Instant getVerificationExpires() {
    return verificationExpires;
  }

  public void setVerificationExpires(Instant value) {
    this.verificationExpires = value;
  }

  private Instant createdAt;

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant value) {
    this.createdAt = value;
  }

  public abstract String getRole();

  public abstract boolean requiresApproval();

  public boolean canOperate() {
    return active && (!requiresApproval() || "APPROVED".equals(approvalStatus));
  }

  @jakarta.persistence.Column(name = "profile_photo", columnDefinition = "LONGTEXT")
  private String photo;

  public String getPhoto() {
    return photo;
  }

  public void setPhoto(String photo) {
    this.photo = photo;
  }

  private String pendingEmail;

  public String getPendingEmail() {
    return pendingEmail;
  }

  public void setPendingEmail(String v) {
    pendingEmail = v;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore private String pendingEmailHash;

  public String getPendingEmailHash() {
    return pendingEmailHash;
  }

  public void setPendingEmailHash(String v) {
    pendingEmailHash = v;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore private java.time.Instant pendingEmailExpires;

  public java.time.Instant getPendingEmailExpires() {
    return pendingEmailExpires;
  }

  public void setPendingEmailExpires(java.time.Instant v) {
    pendingEmailExpires = v;
  }

  @jakarta.persistence.Column(length = 255)
  private String photoPublicId;

  public String getPhotoPublicId() {
    return photoPublicId;
  }

  public void setPhotoPublicId(String value) {
    photoPublicId = value;
  }
}
