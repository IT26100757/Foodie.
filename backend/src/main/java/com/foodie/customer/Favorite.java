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

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Favorite() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Favorite(Long userId, Long restaurantId) {
    setUserId(userId);
    setRestaurantId(restaurantId);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Favorite{id=" + getId() + "}";
  }

  // Constructors

  /** Required by JPA; service methods enforce business validation. */
  public Favorite() {}

  /** Initialize supplied values without fixed business records or credentials. */
  public Favorite(Long userId, Long restaurantId) {
    setUserId(userId);
    setRestaurantId(restaurantId);
  }

  // Business methods

  /** Identity-only description: avoids logging personal or financial details. */
  @Override
  public String toString() {
    return "Favorite{id=" + getId() + "}";
  }
}
