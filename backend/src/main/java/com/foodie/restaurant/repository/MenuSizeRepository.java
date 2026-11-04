package com.foodie.restaurant.repository;

import com.foodie.restaurant.model.MenuSize;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MenuSizeRepository extends JpaRepository<MenuSize, Long> {
  java.util.List<MenuSize> findByItemId(Long itemId);

  void deleteByItemId(Long itemId);

  @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
  @org.springframework.data.jpa.repository.Query("select x from MenuSize x where x.id=:id")
  java.util.Optional<MenuSize> lock(@org.springframework.data.repository.query.Param("id") Long id);
}
