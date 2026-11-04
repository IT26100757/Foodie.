package com.foodie.operations.data;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Complaint x where x.id=:id")
  java.util.Optional<Complaint> lock(
      @org.springframework.data.repository.query.Param("id") Long id);
}
