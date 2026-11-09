package com.foodie.user.document;

import java.util.*;
import org.springframework.data.jpa.repository.*;

public interface VehicleChangeRepository extends JpaRepository<VehicleChange, Long> {
  List<VehicleChange> findByUserId(Long id);

  @Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @Query("select v from VehicleChange v where v.id=:id")
  Optional<VehicleChange> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
