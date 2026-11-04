package com.foodie.operations;

import com.foodie.common.Inputs;
import com.foodie.notification.NotificationRepository;
import com.foodie.operations.data.*;
import com.foodie.order.OrderService;
import com.foodie.payment.PaymentService;
import com.foodie.restaurant.RestaurantService;
import com.foodie.restaurant.repository.*;
import com.foodie.user.AppUserRepository;
import com.foodie.user.UserService;
import java.math.BigDecimal;
import java.time.*;
import java.util.*;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OperationsService {
  private final UserService users;
  private final OfferRepository offers;
  private final ComplaintRepository complaints;
  private final NotificationRepository notes;
  private final RestaurantService restaurants;
  private final MenuItemRepository menu;
  private final OrderService orders;
  private final PaymentService payments;
  private final AppUserRepository accounts;
  private final JdbcTemplate db;

  public OperationsService(
      UserService u,
      OfferRepository f,
      ComplaintRepository c,
      NotificationRepository n,
      RestaurantService r,
      MenuItemRepository m,
      OrderService o,
      PaymentService p,
      AppUserRepository a,
      JdbcTemplate db) {
    users = u;
    offers = f;
    complaints = c;
    notes = n;
    restaurants = r;
    menu = m;
    orders = o;
    payments = p;
    accounts = a;
    this.db = db;
  }

  public List<Map<String, Object>> customerOffers() {
    LocalDate today = LocalDate.now(java.time.ZoneId.of("Asia/Colombo"));
    return offers.findAll().stream()
        .filter(
            o ->
                o.getEnabled()
                    && o.getPublished()
                    && !today.isBefore(o.getStartDate())
                    && !today.isAfter(o.getEndDate()))
        .filter(
            o ->
                o.getRestaurantId() == null
                    || restaurants.published(restaurants.get(o.getRestaurantId())))
        .map(
            o -> {
              Map<String, Object> result = new LinkedHashMap<>();
              result.put("id", o.getId());
              result.put("title", o.getTitle());
              result.put("code", o.getCode());
              result.put("description", o.getDescription());
              result.put("discountType", o.getDiscountType());
              result.put("discountValue", o.getDiscountValue());
              result.put("enabled", o.getEnabled());
              result.put("published", o.getPublished());
              result.put("endDate", o.getEndDate());
              if (o.getRestaurantId() != null)
                result.put("restaurantName", restaurants.get(o.getRestaurantId()).getName());
              if (o.getMenuItemId() != null) {
                var item = menu.findById(o.getMenuItemId()).orElseThrow();
                result.put("itemName", item.getName());
                result.put("price", item.getPrice());
                result.put("image", item.getImage());
                result.put("category", item.getCategory());
              }
              return result;
            })
        .toList();
  }

  public Object allOffers() {
    var u = users.operational("MERCHANT", "ADMIN");
    return offers.findAll().stream()
        .filter(
            o ->
                u.getRole().equals("ADMIN")
                    || o.getRestaurantId() != null
                        && restaurants.get(o.getRestaurantId()).getOwnerId().equals(u.getId()))
        .toList();
  }

  public record Promotion(
      Long restaurantId,
      Long menuItemId,
      String title,
      String code,
      String description,
      String discountType,
      BigDecimal discountValue,
      LocalDate startDate,
      LocalDate endDate,
      boolean enabled,
      boolean published) {}

  @Transactional
  public Offer offer(Long id, Promotion f) {
    var u = users.operational("MERCHANT", "ADMIN");
    if (f.restaurantId() != null) restaurants.own(f.restaurantId());
    else if (!u.getRole().equals("ADMIN"))
      throw new SecurityException("Platform offer requires Admin");
    Offer o = id == null ? new Offer() : offers.lock(id).orElseThrow(Inputs::missing);
    if (id != null) {
      if (o.getRestaurantId() != null) restaurants.own(o.getRestaurantId());
      else users.operational("ADMIN");
    }
    if (f.menuItemId() != null) {
      var m = menu.findById(f.menuItemId()).orElseThrow(Inputs::missing);
      if (!m.getRestaurantId().equals(f.restaurantId()))
        throw new IllegalArgumentException("Item must belong to target restaurant");
    }
    String code = Inputs.text(f.code(), 24).toUpperCase(Locale.ROOT);
    if (!code.matches("[A-Z0-9_-]{4,24}"))
      throw new IllegalArgumentException("Invalid coupon code");
    if (!List.of("PERCENTAGE", "FIXED", "FREE_DELIVERY", "BUY_X_GET_Y").contains(f.discountType()))
      throw new IllegalArgumentException("Invalid discount type");
    Inputs.money(f.discountValue());
    if (f.discountType().equals("PERCENTAGE")
            && f.discountValue().compareTo(new BigDecimal("100")) > 0
        || f.startDate() == null
        || f.endDate() == null
        || f.startDate().isAfter(f.endDate()))
      throw new IllegalArgumentException("Invalid discount or dates");
    o.setRestaurantId(f.restaurantId());
    o.setMenuItemId(f.menuItemId());
    o.setTitle(Inputs.text(f.title(), 150));
    o.setCode(code);
    o.setDescription(f.description() == null ? "" : Inputs.text(f.description(), 1000));
    o.setDiscountType(f.discountType());
    o.setDiscountValue(f.discountValue());
    o.setStartDate(f.startDate());
    o.setEndDate(f.endDate());
    o.setEnabled(f.enabled());
    o.setPublished(f.published());
    return offers.save(o);
  }

  @Transactional
  public void cancelOffer(Long id) {
    var o = offers.lock(id).orElseThrow(Inputs::missing);
    if (o.getRestaurantId() != null) restaurants.own(o.getRestaurantId());
    else users.operational("ADMIN");
    o.setEnabled(false);
    o.setPublished(false);
  }

  public Object complaints() {
    var u = users.current();
    return complaints.findAll().stream()
        .filter(c -> u.getRole().equals("ADMIN") || c.getUserId().equals(u.getId()))
        .toList();
  }

  public record Concern(String type, String subject, String description) {}

  @Transactional
  public Complaint complaint(Concern f) {
    var u = users.current();
    var c = new Complaint();
    c.setUserId(u.getId());
    c.setType(Inputs.text(f.type(), 120));
    c.setSubject(Inputs.text(f.subject(), 200));
    c.setDescription(Inputs.text(f.description(), 2000));
    c.setStatus("OPEN");
    c.setCreatedAt(Instant.now());
    return complaints.save(c);
  }

  @Transactional
  public void reply(Long id, String text) {
    users.operational("ADMIN");
    var c = complaints.lock(id).orElseThrow(Inputs::missing);
    Inputs.require(c.getStatus().equals("OPEN"), "Complaint already resolved");
    c.setResponse(Inputs.text(text, 2000));
    c.setStatus("RESOLVED");
  }

  public Object notifications() {
    var u = users.current();
    return notes.findAll().stream()
        .filter(n -> u.getRole().equals("ADMIN") || n.getUserId().equals(u.getId()))
        .map(
            n -> {
              boolean read =
                  db.queryForObject(
                          "SELECT COUNT(*) FROM nf_notification_reads WHERE notification_id=? AND"
                              + " user_id=?",
                          Long.class,
                          n.getId(),
                          u.getId())
                      > 0;
              Map<String, Object> view = new LinkedHashMap<>();
              view.put("id", n.getId());
              view.put("title", n.getTitle());
              view.put("text", n.getText());
              view.put("message", n.getText());
              view.put("type", "ACCOUNT");
              view.put("destination", n.getDestination());
              view.put("createdAt", n.getCreatedAt());
              view.put("read", read);
              view.put("unread", !read);
              return view;
            })
        .toList();
  }

  @Transactional
  public void read(Long id) {
    var u = users.current();
    accounts.lock(u.getId()).orElseThrow();
    var targets =
        id == null ? notes.findAll() : List.of(notes.findById(id).orElseThrow(Inputs::missing));
    for (var n : targets) {
      if (!u.getRole().equals("ADMIN") && !n.getUserId().equals(u.getId())) {
        if (id != null) throw new SecurityException("Private notification");
        continue;
      }
      if (db.queryForObject(
              "SELECT COUNT(*) FROM nf_notification_reads WHERE notification_id=? AND user_id=?",
              Long.class,
              n.getId(),
              u.getId())
          == 0)
        db.update(
            "INSERT INTO nf_notification_reads(notification_id,user_id) VALUES(?,?)",
            n.getId(),
            u.getId());
    }
  }

  public Object dashboard() {
    var u = users.operational("MERCHANT", "ADMIN");
    var visible = orders.list();
    BigDecimal sales = BigDecimal.ZERO;
    for (var p : payments.list())
      if (p.getStatus().equals("COLLECTED")) sales = sales.add(p.getAmount());
    Map<String, Object> result = new LinkedHashMap<>();
    result.put("orders", visible.size());
    result.put("collectedSales", sales);
    result.put(
        "averageOrderValue",
        visible.isEmpty()
            ? BigDecimal.ZERO
            : visible.stream()
                .map(o -> o.getTotal())
                .reduce(BigDecimal.ZERO, BigDecimal::add)
                .divide(BigDecimal.valueOf(visible.size()), 2, java.math.RoundingMode.HALF_UP));
    result.put(
        "completedOrders",
        visible.stream()
            .filter(o -> List.of("PICKED_UP", "DELIVERED").contains(o.getStatus()))
            .count());
    if (u.getRole().equals("ADMIN")) {
      result.put("users", accounts.count());
      result.put(
          "pendingApplications",
          accounts.findAll().stream()
              .filter(a -> a.getSubmitted() && a.getApprovalStatus().equals("PENDING"))
              .count());
    }
    return result;
  }

  private String csv(Object value) {
    String s = value == null ? "" : value.toString();
    if (s.matches("^[=+@-].*")) s = "'" + s;
    return "\"" + s.replace("\"", "\"\"") + "\"";
  }

  public String report(LocalDate from, LocalDate to) {
    users.operational("MERCHANT", "ADMIN");
    if (from == null || to == null || from.isAfter(to))
      throw new IllegalArgumentException("Valid report date range required");
    StringBuilder text = new StringBuilder("Order,Date,Type,Status,Total,Payment status\r\n");
    for (var o : orders.list()) {
      LocalDate date = o.getCreatedAt().atZone(ZoneId.of("Asia/Colombo")).toLocalDate();
      if (date.isBefore(from) || date.isAfter(to)) continue;
      text.append(csv(o.getId()))
          .append(',')
          .append(csv(date))
          .append(',')
          .append(csv(o.getType()))
          .append(',')
          .append(csv(o.getStatus()))
          .append(',')
          .append(csv(o.getTotal()))
          .append(',')
          .append(csv(o.getPaymentStatus()))
          .append("\r\n");
    }
    return text.toString();
  }
}
