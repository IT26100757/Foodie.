package com.foodie.restaurant.repository;

import com.foodie.restaurant.model.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
  java.util.Optional<MenuItem> findByClientId(String clientId);

  java.util.List<MenuItem> findByRestaurantId(Long restaurantId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from MenuItem x where x.id=:id")
  java.util.Optional<MenuItem> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
