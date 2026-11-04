package com.foodie.order.data;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_orders")
public class FoodOrder extends DomainEntity {
  private Long customerId;

  public Long getCustomerId() {
    return customerId;
  }

  public void setCustomerId(Long value) {
    this.customerId = value;
  }

  private Long restaurantId;

  public Long getRestaurantId() {
    return restaurantId;
  }

  public void setRestaurantId(Long value) {
    this.restaurantId = value;
  }

  @Column(length = 20, unique = false)
  private String type;

  public String getType() {
    return type;
  }

  public void setType(String value) {
    this.type = value;
  }

  @Column(length = 30, unique = false)
  private String status;

  public String getStatus() {
    return status;
  }

  public void setStatus(String value) {
    this.status = value;
  }

  @Column(length = 30, unique = false)
  private String paymentMethod;

  public String getPaymentMethod() {
    return paymentMethod;
  }

  public void setPaymentMethod(String value) {
    this.paymentMethod = value;
  }

  @Column(length = 30, unique = false)
  private String paymentStatus;

  public String getPaymentStatus() {
    return paymentStatus;
  }

  public void setPaymentStatus(String value) {
    this.paymentStatus = value;
  }

  @Column(length = 1000, unique = false)
  private String deliveryAddress;

  public String getDeliveryAddress() {
    return deliveryAddress;
  }

  public void setDeliveryAddress(String value) {
    this.deliveryAddress = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal subtotal;

  public BigDecimal getSubtotal() {
    return subtotal;
  }

  public void setSubtotal(BigDecimal value) {
    this.subtotal = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal deliveryFee;

  public BigDecimal getDeliveryFee() {
    return deliveryFee;
  }

  public void setDeliveryFee(BigDecimal value) {
    this.deliveryFee = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal discount;

  public BigDecimal getDiscount() {
    return discount;
  }

  public void setDiscount(BigDecimal value) {
    this.discount = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal total;

  public BigDecimal getTotal() {
    return total;
  }

  public void setTotal(BigDecimal value) {
    this.total = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal additionalCharge;

  public BigDecimal getAdditionalCharge() {
    return additionalCharge;
  }

  public void setAdditionalCharge(BigDecimal value) {
    this.additionalCharge = value;
  }

  private boolean customerAgreed;

  public boolean getCustomerAgreed() {
    return customerAgreed;
  }

  public void setCustomerAgreed(boolean value) {
    this.customerAgreed = value;
  }

  @Column(length = 80, unique = true)
  private String requestKey;

  public String getRequestKey() {
    return requestKey;
  }

  public void setRequestKey(String value) {
    this.requestKey = value;
  }

  private Instant createdAt;

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant value) {
    this.createdAt = value;
  }

  private int points;
  private int redeemedPoints;
  private Long offerId;

  public int getPoints() {
    return points;
  }

  public void setPoints(int v) {
    points = v;
  }

  public int getRedeemedPoints() {
    return redeemedPoints;
  }

  public void setRedeemedPoints(int v) {
    redeemedPoints = v;
  }

  public Long getOfferId() {
    return offerId;
  }

  public void setOfferId(Long v) {
    offerId = v;
  }

  @jakarta.persistence.Column(length = 160)
  private String contactName;

  public String getContactName() {
    return contactName;
  }

  public void setContactName(String v) {
    contactName = v;
  }

  @jakarta.persistence.Column(length = 150)
  private String contactEmail;

  public String getContactEmail() {
    return contactEmail;
  }

  public void setContactEmail(String v) {
    contactEmail = v;
  }

  @jakarta.persistence.Column(length = 30)
  private String contactPhone;

  public String getContactPhone() {
    return contactPhone;
  }

  public void setContactPhone(String v) {
    contactPhone = v;
  }

  @com.fasterxml.jackson.annotation.JsonIgnore
  @jakarta.persistence.Column(length = 64)
  private String guestAccessHash;

  public String getGuestAccessHash() {
    return guestAccessHash;
  }

  public void setGuestAccessHash(String v) {
    guestAccessHash = v;
  }

  @jakarta.persistence.Column(precision = 14, scale = 2)
  private java.math.BigDecimal offerDiscount;

  @jakarta.persistence.Column(precision = 14, scale = 2)
  private java.math.BigDecimal pointsDiscount;

  public java.math.BigDecimal getOfferDiscount() {
    return offerDiscount;
  }

  public void setOfferDiscount(java.math.BigDecimal value) {
    offerDiscount = value;
  }

  public java.math.BigDecimal getPointsDiscount() {
    return pointsDiscount;
  }

  public void setPointsDiscount(java.math.BigDecimal value) {
    pointsDiscount = value;
  }
}
