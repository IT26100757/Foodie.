package com.foodie.user.model;

import jakarta.persistence.*;

@Entity
@DiscriminatorValue("RIDER")
public class RiderUser extends AppUser {
  @Override
  public String getRole() {
    return "RIDER";
  }

  @Override
  public boolean requiresApproval() {
    return true;
  }

  private String licenseNumber;

  public String getLicenseNumber() {
    return licenseNumber;
  }

  public void setLicenseNumber(String value) {
    licenseNumber = value;
  }

  private java.time.LocalDate birthDate;

  public java.time.LocalDate getBirthDate() {
    return birthDate;
  }

  public void setBirthDate(java.time.LocalDate value) {
    birthDate = value;
  }

  private boolean online;

  public boolean getOnline() {
    return online;
  }

  public void setOnline(boolean value) {
    online = value;
  }

  private Double latitude;

  public Double getLatitude() {
    return latitude;
  }

  public void setLatitude(Double value) {
    latitude = value;
  }

  private Double longitude;

  public Double getLongitude() {
    return longitude;
  }

  public void setLongitude(Double value) {
    longitude = value;
  }
}
