package com.foodie.customer;

import com.foodie.common.Inputs;
import com.foodie.order.data.FoodOrderRepository;
import com.foodie.restaurant.RestaurantService;
import com.foodie.user.AppUserRepository;
import com.foodie.user.UserService;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class CustomerService {
  private final UserService users;
  private final AppUserRepository accounts;
  private final FavoriteRepository favorites;
  private final RestaurantService restaurants;
  private final FoodOrderRepository orders;

  public CustomerService(
      UserService u,
      AppUserRepository a,
      FavoriteRepository f,
      RestaurantService r,
      FoodOrderRepository o) {
    users = u;
    accounts = a;
    favorites = f;
    restaurants = r;
    orders = o;
  }

  public Object favorites() {
    return favorites.findByUserId(users.operational("CUSTOMER").getId()).stream()
        .map(f -> restaurants.get(f.getRestaurantId()))
        .toList();
  }

  @Transactional
  public void favorite(Long restaurantId, boolean saved) {
    var u = users.operational("CUSTOMER");
    accounts.lock(u.getId()).orElseThrow();
    if (saved)
      Inputs.require(
          restaurants.published(restaurants.get(restaurantId)), "Restaurant unavailable");
    var prior = favorites.findByUserIdAndRestaurantId(u.getId(), restaurantId);
    if (saved && prior.isEmpty()) {
      var f = new Favorite();
      f.setUserId(u.getId());
      f.setRestaurantId(restaurantId);
      favorites.save(f);
    } else if (!saved) prior.ifPresent(favorites::delete);
  }

  public Object rewards() {
    var u = users.operational("CUSTOMER");
    var history = orders.findByCustomerId(u.getId());
    int earned =
        history.stream()
            .filter(o -> List.of("DELIVERED", "PICKED_UP").contains(o.getStatus()))
            .mapToInt(o -> o.getPoints())
            .sum();
    int redeemed =
        history.stream()
            .filter(o -> !o.getStatus().equals("CANCELLED"))
            .mapToInt(o -> o.getRedeemedPoints())
            .sum();
    return Map.of(
        "earned",
        earned,
        "redeemedOrReserved",
        redeemed,
        "available",
        Math.max(0, earned - redeemed));
  }
}
