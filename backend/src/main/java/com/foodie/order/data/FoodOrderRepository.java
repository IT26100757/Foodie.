package com.foodie.order.data;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FoodOrderRepository extends JpaRepository<FoodOrder, Long> {
  java.util.Optional<FoodOrder> findByRequestKey(String requestKey);

  java.util.List<FoodOrder> findByCustomerId(Long customerId);

  java.util.List<FoodOrder> findByRestaurantId(Long restaurantId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from FoodOrder x where x.id=:id")
  java.util.Optional<FoodOrder> lock(
      @org.springframework.data.repository.query.Param("id") Long id);
}
