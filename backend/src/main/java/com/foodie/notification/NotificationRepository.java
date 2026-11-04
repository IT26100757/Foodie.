package com.foodie.notification;

import org.springframework.data.jpa.repository.JpaRepository;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from Notification x where x.id=:id")
  java.util.Optional<Notification> lock(
      @org.springframework.data.repository.query.Param("id") Long id);
}
