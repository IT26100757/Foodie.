package com.foodie.restaurant.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_restaurants")
public class Restaurant extends DomainEntity {
  private Long ownerId;

  public Long getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(Long value) {
    this.ownerId = value;
  }

  @Column(length = 150, unique = false)
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String value) {
    this.name = value;
  }

  @Column(length = 500, unique = false)
  private String address;

  public String getAddress() {
    return address;
  }

  public void setAddress(String value) {
    this.address = value;
  }

  @Column(length = 30, unique = false)
  private String phone;

  public String getPhone() {
    return phone;
  }

  public void setPhone(String value) {
    this.phone = value;
  }

  @Column(length = 120, unique = false)
  private String location;

  public String getLocation() {
    return location;
  }

  public void setLocation(String value) {
    this.location = value;
  }

  @Column(length = 120, unique = false)
  private String cuisine;

  public String getCuisine() {
    return cuisine;
  }

  public void setCuisine(String value) {
    this.cuisine = value;
  }

  @Column(length = 1000, unique = false)
  private String description;

  public String getDescription() {
    return description;
  }

  public void setDescription(String value) {
    this.description = value;
  }

  @Column(columnDefinition = "LONGTEXT")
  private String logoImage;

  public String getLogoImage() {
    return logoImage;
  }

  public void setLogoImage(String value) {
    this.logoImage = value;
  }

  @Column(columnDefinition = "LONGTEXT")
  private String bannerImage;

  public String getBannerImage() {
    return bannerImage;
  }

  public void setBannerImage(String value) {
    this.bannerImage = value;
  }

  private boolean open;

  public boolean getOpen() {
    return open;
  }

  public void setOpen(boolean value) {
    this.open = value;
  }

  private boolean delivery;

  public boolean getDelivery() {
    return delivery;
  }

  public void setDelivery(boolean value) {
    this.delivery = value;
  }

  private boolean pickup;

  public boolean getPickup() {
    return pickup;
  }

  public void setPickup(boolean value) {
    this.pickup = value;
  }

  @jakarta.persistence.Column(length = 255)
  private String logoPublicId;

  public String getLogoPublicId() {
    return logoPublicId;
  }

  public void setLogoPublicId(String value) {
    logoPublicId = value;
  }

  @jakarta.persistence.Column(length = 255)
  private String bannerPublicId;

  public String getBannerPublicId() {
    return bannerPublicId;
  }

  public void setBannerPublicId(String value) {
    bannerPublicId = value;
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Restaurant() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Restaurant(Long ownerId, String name, String location, String cuisine) {
    setOwnerId(ownerId);
    setName(name);
    setLocation(location);
    setCuisine(cuisine);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Restaurant{id=" + getId() + "}";
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Restaurant() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Restaurant(Long ownerId, String name, String location, String cuisine) {
    setOwnerId(ownerId);
    setName(name);
    setLocation(location);
    setCuisine(cuisine);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Restaurant{id=" + getId() + "}";
  }
}
