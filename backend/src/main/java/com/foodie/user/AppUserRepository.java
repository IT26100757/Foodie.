package com.foodie.user;

import com.foodie.user.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppUserRepository extends JpaRepository<AppUser, Long> {
  java.util.Optional<AppUser> findByEmailIgnoreCase(String email);

  java.util.Optional<AppUser> findByPhone(String phone);

  boolean existsByNationalId(String nationalId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from AppUser x where x.id=:id")
  java.util.Optional<AppUser> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
