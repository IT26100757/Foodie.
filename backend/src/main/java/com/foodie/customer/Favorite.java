package com.foodie.customer;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;

@Entity
@Table(
    name = "nf_favorites",
    uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "restaurant_id"}))
public class Favorite extends DomainEntity {
  private Long userId;
  private Long restaurantId;

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long v) {
    userId = v;
  }

  public Long getRestaurantId() {
    return restaurantId;
  }

  public void setRestaurantId(Long v) {
    restaurantId = v;
  }
}
