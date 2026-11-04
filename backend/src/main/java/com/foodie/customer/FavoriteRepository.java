package com.foodie.customer;

import java.util.*;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FavoriteRepository extends JpaRepository<Favorite, Long> {
  List<Favorite> findByUserId(Long id);

  Optional<Favorite> findByUserIdAndRestaurantId(Long userId, Long restaurantId);
}
