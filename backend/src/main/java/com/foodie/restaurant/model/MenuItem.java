package com.foodie.restaurant.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_menu_items")
public class MenuItem extends DomainEntity {
  private Long restaurantId;

  public Long getRestaurantId() {
    return restaurantId;
  }

  public void setRestaurantId(Long value) {
    this.restaurantId = value;
  }

  @Column(length = 150, unique = false)
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String value) {
    this.name = value;
  }

  @Column(length = 100, unique = false)
  private String category;

  public String getCategory() {
    return category;
  }

  public void setCategory(String value) {
    this.category = value;
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
  private String image;

  public String getImage() {
    return image;
  }

  public void setImage(String value) {
    this.image = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal price;

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal value) {
    this.price = value;
  }

  private boolean available;

  public boolean getAvailable() {
    return available;
  }

  public void setAvailable(boolean value) {
    this.available = value;
  }

  private boolean sizesEnabled;

  public boolean getSizesEnabled() {
    return sizesEnabled;
  }

  public void setSizesEnabled(boolean value) {
    this.sizesEnabled = value;
  }

  @Column(precision = 8, scale = 2)
  private BigDecimal zoom;

  public BigDecimal getZoom() {
    return zoom;
  }

  public void setZoom(BigDecimal value) {
    this.zoom = value;
  }

  @Column(name = "focal_x", precision = 8, scale = 2)
  private BigDecimal focalX;

  public BigDecimal getFocalX() {
    return focalX;
  }

  public void setFocalX(BigDecimal value) {
    this.focalX = value;
  }

  @Column(name = "focal_y", precision = 8, scale = 2)
  private BigDecimal focalY;

  public BigDecimal getFocalY() {
    return focalY;
  }

  public void setFocalY(BigDecimal value) {
    this.focalY = value;
  }

  @jakarta.persistence.Column(length = 80, unique = true)
  private String clientId;

  public String getClientId() {
    return clientId;
  }

  public void setClientId(String v) {
    clientId = v;
  }

  @jakarta.persistence.Column(length = 255)
  private String imagePublicId;

  public String getImagePublicId() {
    return imagePublicId;
  }

  public void setImagePublicId(String value) {
    imagePublicId = value;
  }
}
