package com.foodie.order.data;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_orders")
public class FoodOrder extends DomainEntity {

    // Fields

    private Long customerId;

    private Long restaurantId;

    @Column(length = 20, unique = false)
    private String type;

    @Column(length = 30, unique = false)
    private String status;

    @Column(length = 30, unique = false)
    private String paymentMethod;

    @Column(length = 30, unique = false)
    private String paymentStatus;

    @Column(length = 1000, unique = false)
    private String deliveryAddress;

    @Column(precision = 14, scale = 2)
    private BigDecimal subtotal;

    @Column(precision = 14, scale = 2)
    private BigDecimal deliveryFee;

    @Column(precision = 14, scale = 2)
    private BigDecimal discount;

    @Column(precision = 14, scale = 2)
    private BigDecimal total;

    @Column(precision = 14, scale = 2)
    private BigDecimal additionalCharge;

    private boolean customerAgreed;

    @Column(length = 80, unique = true)
    private String requestKey;

    private Instant createdAt;

    private int points;

    private int redeemedPoints;

    private Long offerId;

    @jakarta.persistence.Column(length = 160)
    private String contactName;

    @jakarta.persistence.Column(length = 150)
    private String contactEmail;

    @jakarta.persistence.Column(length = 30)
    private String contactPhone;

    @com.fasterxml.jackson.annotation.JsonIgnore
    @jakarta.persistence.Column(length = 64)
    private String guestAccessHash;

    @jakarta.persistence.Column(precision = 14, scale = 2)
    private java.math.BigDecimal offerDiscount;

    @jakarta.persistence.Column(precision = 14, scale = 2)
    private java.math.BigDecimal pointsDiscount;

    // Constructors

    /** Required by JPA; service methods enforce business validation. */
    public FoodOrder() {}

    /** Initialize supplied values without fixed business records or credentials. */
    public FoodOrder(Long customerId, Long restaurantId, String type, String status) {
        setCustomerId(customerId);
        setRestaurantId(restaurantId);
        setType(type);
        setStatus(status);
    }

    // Getters and setters

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public Long getRestaurantId() {
        return restaurantId;
    }

    public void setRestaurantId(Long restaurantId) {
        this.restaurantId = restaurantId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(BigDecimal deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public BigDecimal getDiscount() {
        return discount;
    }

    public void setDiscount(BigDecimal discount) {
        this.discount = discount;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public BigDecimal getAdditionalCharge() {
        return additionalCharge;
    }

    public void setAdditionalCharge(BigDecimal additionalCharge) {
        this.additionalCharge = additionalCharge;
    }

    public boolean getCustomerAgreed() {
        return customerAgreed;
    }

    public void setCustomerAgreed(boolean customerAgreed) {
        this.customerAgreed = customerAgreed;
    }

    public String getRequestKey() {
        return requestKey;
    }

    public void setRequestKey(String requestKey) {
        this.requestKey = requestKey;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public int getPoints() {
        return points;
    }

    public void setPoints(int points) {
        this.points = points;
    }

    public int getRedeemedPoints() {
        return redeemedPoints;
    }

    public void setRedeemedPoints(int redeemedPoints) {
        this.redeemedPoints = redeemedPoints;
    }

    public Long getOfferId() {
        return offerId;
    }

    public void setOfferId(Long offerId) {
        this.offerId = offerId;
    }

    public String getContactName() {
        return contactName;
    }

    public void setContactName(String contactName) {
        this.contactName = contactName;
    }

    public String getContactEmail() {
        return contactEmail;
    }

    public void setContactEmail(String contactEmail) {
        this.contactEmail = contactEmail;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public String getGuestAccessHash() {
        return guestAccessHash;
    }

    public void setGuestAccessHash(String guestAccessHash) {
        this.guestAccessHash = guestAccessHash;
    }

    public java.math.BigDecimal getOfferDiscount() {
        return offerDiscount;
    }

    public void setOfferDiscount(java.math.BigDecimal offerDiscount) {
        this.offerDiscount = offerDiscount;
    }

    public java.math.BigDecimal getPointsDiscount() {
        return pointsDiscount;
    }

    public void setPointsDiscount(java.math.BigDecimal pointsDiscount) {
        this.pointsDiscount = pointsDiscount;
    }

    // Business methods

    /** Identity-only description: avoids logging personal or financial details. */
    @Override
    public String toString() {
        return "FoodOrder{id=" + getId() + "}";
    }
}
