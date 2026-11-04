package com.foodie.operations.data;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OfferRepository extends JpaRepository<Offer, Long> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Offer x where x.id=:id")
  java.util.Optional<Offer> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
