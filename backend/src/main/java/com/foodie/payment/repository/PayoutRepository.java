package com.foodie.payment.repository;

import com.foodie.payment.model.Payout;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PayoutRepository extends JpaRepository<Payout, Long> {
  java.util.List<Payout> findByOwnerId(Long ownerId);

  java.util.Optional<Payout> findByRequestKey(String requestKey);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Payout x where x.id=:id")
  java.util.Optional<Payout> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
