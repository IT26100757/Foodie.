package com.foodie.restaurant.repository;

import com.foodie.restaurant.model.Restaurant;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RestaurantRepository extends JpaRepository<Restaurant, Long> {
  java.util.List<Restaurant> findByOwnerId(Long ownerId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Restaurant x where x.id=:id")
  java.util.Optional<Restaurant> lock(
      @org.springframework.data.repository.query.Param("id") Long id);
}
