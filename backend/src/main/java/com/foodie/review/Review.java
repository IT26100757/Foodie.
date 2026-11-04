package com.foodie.review;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.time.*;

@Entity
@Table(name = "nf_reviews")
public class Review extends DomainEntity {
  private Long orderId;

  public Long getOrderId() {
    return orderId;
  }

  public void setOrderId(Long value) {
    this.orderId = value;
  }

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

  private int rating;

  public int getRating() {
    return rating;
  }

  public void setRating(int value) {
    this.rating = value;
  }

  @Column(length = 1000, unique = false)
  private String comment;

  public String getComment() {
    return comment;
  }

  public void setComment(String value) {
    this.comment = value;
  }

  private boolean hidden;

  public boolean getHidden() {
    return hidden;
  }

  public void setHidden(boolean value) {
    this.hidden = value;
  }
}
