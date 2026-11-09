package com.foodie.payment.repository;

import com.foodie.payment.model.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
  java.util.Optional<Payment> findByOrderId(Long orderId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Payment x where x.id=:id")
  java.util.Optional<Payment> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
