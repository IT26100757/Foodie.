package com.foodie.review;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ReviewRepository extends JpaRepository<Review, Long> {
  boolean existsByOrderId(Long orderId);

  java.util.List<Review> findByRestaurantIdAndHiddenFalse(Long restaurantId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Review x where x.id=:id")
  java.util.Optional<Review> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
