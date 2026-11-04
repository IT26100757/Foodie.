package com.foodie.delivery;

import org.springframework.data.jpa.repository.JpaRepository;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {
  java.util.Optional<Delivery> findByOrderId(Long orderId);

  java.util.List<Delivery> findByRiderId(Long riderId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Delivery x where x.id=:id")
  java.util.Optional<Delivery> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
