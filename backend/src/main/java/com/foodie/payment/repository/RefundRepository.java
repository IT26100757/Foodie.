package com.foodie.payment.repository;

import com.foodie.payment.model.Refund;
import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface RefundRepository extends JpaRepository<Refund, Long> {
  boolean existsByOrderId(Long id);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query("select r from Refund r where r.id=:id")
  Optional<Refund> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
