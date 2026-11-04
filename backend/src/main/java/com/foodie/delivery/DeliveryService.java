package com.foodie.delivery;

import com.foodie.common.Inputs;
import com.foodie.order.data.FoodOrderRepository;
import com.foodie.user.AppUserRepository;
import com.foodie.user.UserService;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class DeliveryService {
  private final DeliveryRepository deliveries;
  private final FoodOrderRepository orders;
  private final UserService users;
  private final AppUserRepository accounts;
  private final com.foodie.settings.BusinessPolicyService policies;

  public DeliveryService(
      DeliveryRepository d,
      FoodOrderRepository o,
      UserService u,
      AppUserRepository a,
      com.foodie.settings.BusinessPolicyService policies) {
    this.policies = policies;
    deliveries = d;
    orders = o;
    users = u;
    accounts = a;
  }

  public java.util.List<com.foodie.order.data.FoodOrder> available() {
    users.operational("RIDER");
    return orders.findAll().stream()
        .filter(
            o ->
                o.getType().equals("DELIVERY")
                    && o.getStatus().equals("READY")
                    && deliveries.findByOrderId(o.getId()).isEmpty())
        .toList();
  }

  public List<Delivery> mine() {
    return deliveries.findByRiderId(users.operational("RIDER").getId());
  }

  @Transactional
  public Delivery accept(Long orderId) {
    var u = users.operational("RIDER");
    var rider = (com.foodie.user.model.RiderUser) accounts.lock(u.getId()).orElseThrow();
    Inputs.require(rider.getOnline(), "Go online before accepting deliveries");
    Inputs.require(
        deliveries.findByRiderId(u.getId()).stream()
            .noneMatch(delivery -> !delivery.getStatus().equals("DELIVERED")),
        "Complete your active delivery before accepting another");
    var o = orders.lock(orderId).orElseThrow(Inputs::missing);
    Inputs.require(
        o.getType().equals("DELIVERY")
            && o.getStatus().equals("READY")
            && deliveries.findByOrderId(orderId).isEmpty(),
        "Delivery already assigned or unavailable");
    var d = new Delivery();
    d.setOrderId(orderId);
    d.setServiceRate(policies.amount("driver_service_rate"));
    d.setRiderId(u.getId());
    d.setStatus("ASSIGNED");
    d.setAssignedAt(Instant.now());
    return deliveries.save(d);
  }

  @Transactional
  public Delivery status(Long id, String target) {
    target = Inputs.text(target, 30);
    var u = users.operational("RIDER");
    var initial = deliveries.findById(id).orElseThrow(Inputs::missing);
    var o = orders.lock(initial.getOrderId()).orElseThrow();
    var d = deliveries.lock(id).orElseThrow();
    if (!u.getId().equals(d.getRiderId())) throw new SecurityException("Assigned Rider required");
    boolean valid =
        d.getStatus().equals("ASSIGNED")
                && "ON_DELIVERY".equals(target)
                && o.getStatus().equals("READY")
            || d.getStatus().equals("ON_DELIVERY")
                && "DELIVERED".equals(target)
                && o.getStatus().equals("ON_DELIVERY");
    Inputs.require(valid, "Invalid delivery transition");
    d.setStatus(target);
    o.setStatus(target);
    if (target.equals("DELIVERED")) d.setCompletedAt(Instant.now());
    return d;
  }

  public BigDecimal earnings() {
    return mine().stream()
        .filter(d -> d.getStatus().equals("DELIVERED"))
        .map(d -> orders.findById(d.getOrderId()).orElseThrow().getDeliveryFee())
        .reduce(BigDecimal.ZERO, BigDecimal::add);
  }
}
