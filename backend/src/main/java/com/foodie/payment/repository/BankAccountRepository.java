package com.foodie.payment.repository;

import com.foodie.payment.model.BankAccount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BankAccountRepository extends JpaRepository<BankAccount, Long> {
  java.util.List<BankAccount> findByOwnerId(Long ownerId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from BankAccount x where x.id=:id")
  java.util.Optional<BankAccount> lock(
      @org.springframework.data.repository.query.Param("id") Long id);
}
