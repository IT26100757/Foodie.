package com.foodie.operations.data;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_offers")
public class Offer extends DomainEntity {
  private Long restaurantId;

  public Long getRestaurantId() {
    return restaurantId;
  }

  public void setRestaurantId(Long value) {
    this.restaurantId = value;
  }

  private Long menuItemId;

  public Long getMenuItemId() {
    return menuItemId;
  }

  public void setMenuItemId(Long value) {
    this.menuItemId = value;
  }

  @Column(length = 150, unique = false)
  private String title;

  public String getTitle() {
    return title;
  }

  public void setTitle(String value) {
    this.title = value;
  }

  @Column(length = 24, unique = true)
  private String code;

  public String getCode() {
    return code;
  }

  public void setCode(String value) {
    this.code = value;
  }

  @Column(length = 1000, unique = false)
  private String description;

  public String getDescription() {
    return description;
  }

  public void setDescription(String value) {
    this.description = value;
  }

  @Column(length = 30, unique = false)
  private String discountType;

  public String getDiscountType() {
    return discountType;
  }

  public void setDiscountType(String value) {
    this.discountType = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal discountValue;

  public BigDecimal getDiscountValue() {
    return discountValue;
  }

  public void setDiscountValue(BigDecimal value) {
    this.discountValue = value;
  }

  private LocalDate startDate;

  public LocalDate getStartDate() {
    return startDate;
  }

  public void setStartDate(LocalDate value) {
    this.startDate = value;
  }

  private LocalDate endDate;

  public LocalDate getEndDate() {
    return endDate;
  }

  public void setEndDate(LocalDate value) {
    this.endDate = value;
  }

  private boolean enabled;

  public boolean getEnabled() {
    return enabled;
  }

  public void setEnabled(boolean value) {
    this.enabled = value;
  }

  private boolean published;

  public boolean getPublished() {
    return published;
  }

  public void setPublished(boolean value) {
    this.published = value;
  }
}
