package com.foodie.review;

import com.foodie.common.Inputs;
import com.foodie.order.data.FoodOrderRepository;
import com.foodie.user.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class ReviewService {
  private final ReviewRepository reviews;
  private final FoodOrderRepository orders;
  private final UserService users;

  public ReviewService(ReviewRepository r, FoodOrderRepository o, UserService u) {
    reviews = r;
    orders = o;
    users = u;
  }

  public Object list(Long restaurantId) {
    return reviews.findByRestaurantIdAndHiddenFalse(restaurantId);
  }

  public record Feedback(Long orderId, int rating, String comment) {}

  @Transactional
  public Review create(Feedback f) {
    var u = users.operational("CUSTOMER");
    var o = orders.lock(f.orderId()).orElseThrow(Inputs::missing);
    if (!u.getId().equals(o.getCustomerId())) throw new SecurityException("Not your order");
    Inputs.require(
        java.util.List.of("DELIVERED", "PICKED_UP").contains(o.getStatus())
            && !reviews.existsByOrderId(o.getId()),
        "Review requires a completed unreviewed order");
    Review r = new Review();
    r.setCustomerId(u.getId());
    r.setOrderId(o.getId());
    r.setRestaurantId(o.getRestaurantId());
    apply(r, f);
    return reviews.save(r);
  }

  private void apply(Review r, Feedback f) {
    if (f.rating() < 1 || f.rating() > 5) throw new IllegalArgumentException("Rating must be 1–5");
    r.setRating(f.rating());
    r.setComment(Inputs.text(f.comment(), 1000));
  }

  @Transactional
  public Review edit(Long id, Feedback f) {
    var u = users.operational("CUSTOMER");
    var r = reviews.lock(id).orElseThrow(Inputs::missing);
    if (!u.getId().equals(r.getCustomerId())) throw new SecurityException("Not your review");
    apply(r, f);
    return r;
  }

  @Transactional
  public void remove(Long id) {
    var u = users.operational("CUSTOMER", "ADMIN");
    var r = reviews.lock(id).orElseThrow(Inputs::missing);
    if (!u.getRole().equals("ADMIN") && !u.getId().equals(r.getCustomerId()))
      throw new SecurityException("Not your review");
    r.setHidden(true);
  }
}
