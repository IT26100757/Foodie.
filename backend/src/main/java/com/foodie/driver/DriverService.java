package com.foodie.driver;

import com.foodie.common.Inputs;
import com.foodie.delivery.DeliveryRepository;
import com.foodie.delivery.DeliveryService;
import com.foodie.notification.NotificationService;
import com.foodie.order.data.*;
import com.foodie.order.data.FoodOrder;
import com.foodie.payment.PaymentService;
import com.foodie.payment.repository.BankAccountRepository;
import com.foodie.user.AppUserRepository;
import com.foodie.user.UserService;
import com.foodie.user.document.*;
import com.foodie.user.model.*;
import java.math.*;
import java.time.*;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@Transactional(readOnly = true)
public class DriverService {
  private final com.foodie.settings.BusinessPolicyService policies;

  private final UserService users;
  private final AppUserRepository accounts;
  private final VehicleChangeRepository changes;
  private final DocumentRepository documents;
  private final FoodOrderRepository orders;
  private final OrderLineRepository lines;
  private final DeliveryRepository deliveries;
  private final DeliveryService dispatch;
  private final PaymentService payments;
  private final BankAccountRepository banks;
  private final org.springframework.jdbc.core.JdbcTemplate db;
  private final NotificationService notes;

  public DriverService(
      UserService u,
      AppUserRepository a,
      VehicleChangeRepository c,
      DocumentRepository doc,
      FoodOrderRepository o,
      OrderLineRepository l,
      DeliveryRepository d,
      DeliveryService ds,
      PaymentService p,
      BankAccountRepository b,
      org.springframework.jdbc.core.JdbcTemplate db,
      NotificationService n,
      com.foodie.settings.BusinessPolicyService policies) {
    this.policies = policies;
    users = u;
    accounts = a;
    changes = c;
    documents = doc;
    orders = o;
    lines = l;
    deliveries = d;
    dispatch = ds;
    payments = p;
    banks = b;
    this.db = db;
    notes = n;
  }

  private RiderUser rider() {
    return (RiderUser) users.operational("RIDER");
  }

  public Object profile() {
    var u = users.current();
    if (!u.getRole().equals("RIDER")) throw new SecurityException("Driver account required");
    Map<String, Object> data = new LinkedHashMap<>();
    data.put("id", u.getId());
    if (u instanceof RiderUser rider) {
      data.put("online", rider.getOnline());
      data.put("latitude", rider.getLatitude());
      data.put("longitude", rider.getLongitude());
    }
    data.put("driverId", u.getId());
    data.put("name", u.getFirstName() + " " + u.getLastName());
    data.put("firstName", u.getFirstName());
    data.put("lastName", u.getLastName());
    data.put("email", u.getEmail());
    data.put("phone", u.getPhone());
    data.put(
        "address",
        String.join(
            ", ",
            List.of(
                u.getAddress1() == null ? "" : u.getAddress1(),
                u.getAddress2() == null ? "" : u.getAddress2(),
                u.getAddress3() == null ? "" : u.getAddress3())));
    data.put(
        "vehicleChangeStatus",
        changes.findByUserId(u.getId()).stream()
                .anyMatch(c -> c.getStatus().equals("PENDING_REVIEW"))
            ? "PENDING_REVIEW"
            : "NONE");
    data.put("status", u.getApprovalStatus());
    data.put("vehicleRegistrationNumber", u.getPlate());
    return data;
  }

  @Transactional
  public void availability(boolean online, Double latitude, Double longitude) {
    var u = rider();
    u = (RiderUser) accounts.lock(u.getId()).orElseThrow();
    if (online) {
      Inputs.require(
          changes.findByUserId(u.getId()).stream()
              .noneMatch(c -> c.getStatus().equals("PENDING_REVIEW")),
          "Vehicle approval is pending");
      if (latitude == null
          || longitude == null
          || !Double.isFinite(latitude)
          || !Double.isFinite(longitude)
          || Math.abs(latitude) > 90
          || Math.abs(longitude) > 180)
        throw new IllegalArgumentException("Valid location required");
      u.setLatitude(latitude);
      u.setLongitude(longitude);
    }
    u.setOnline(online);
  }

  private Map<String, Object> view(FoodOrder o) {
    var customer =
        o.getCustomerId() == null ? null : accounts.findById(o.getCustomerId()).orElseThrow();
    Map<String, Object> v = new LinkedHashMap<>();
    v.put("id", o.getId());
    v.put(
        "customerName",
        customer == null
            ? o.getContactName()
            : customer.getFirstName() + " " + customer.getLastName());
    v.put("items", lines.findByOrderId(o.getId()));
    v.put("deliveryPayment", o.getDeliveryFee());
    v.put("destination", o.getDeliveryAddress());
    v.put("status", o.getStatus());
    v.put("paymentStatus", o.getPaymentStatus());
    v.put("paymentMethod", o.getPaymentMethod());
    v.put("total", o.getTotal());
    deliveries
        .findByOrderId(o.getId())
        .ifPresent(
            delivery -> {
              v.put("deliveryStatus", delivery.getStatus());
              v.put("completedAt", delivery.getCompletedAt());
            });
    return v;
  }

  public Object offer() {
    var u = rider();
    if (!u.getOnline()
        || deliveries.findByRiderId(u.getId()).stream()
            .anyMatch(delivery -> !delivery.getStatus().equals("DELIVERED"))) return null;
    return dispatch.available().stream()
        .filter(
            o ->
                db.queryForObject(
                        "SELECT COUNT(*) FROM nf_delivery_declines WHERE order_id=? AND rider_id=?",
                        Long.class,
                        o.getId(),
                        u.getId())
                    == 0)
        .findFirst()
        .map(this::view)
        .orElse(null);
  }

  @Transactional
  public Object accept(Long orderId) {
    rider();
    var d = dispatch.accept(orderId);
    return Map.of("order", view(orders.findById(d.getOrderId()).orElseThrow()));
  }

  @Transactional
  public void decline(Long orderId) {
    var u = rider();
    accounts.lock(u.getId()).orElseThrow();
    var o = orders.lock(orderId).orElseThrow(Inputs::missing);
    Inputs.require(
        o.getType().equals("DELIVERY")
            && o.getStatus().equals("READY")
            && deliveries.findByOrderId(orderId).isEmpty(),
        "Delivery is unavailable");
    if (db.queryForObject(
            "SELECT COUNT(*) FROM nf_delivery_declines WHERE order_id=? AND rider_id=?",
            Long.class,
            orderId,
            u.getId())
        == 0)
      db.update(
          "INSERT INTO nf_delivery_declines(order_id,rider_id) VALUES(?,?)", orderId, u.getId());
  }

  @Transactional
  public void progress(Long orderId, String status) {
    var u = rider();
    var d = deliveries.findByOrderId(orderId).orElseThrow(Inputs::missing);
    if (!d.getRiderId().equals(u.getId())) throw new SecurityException("Assigned driver required");
    dispatch.status(d.getId(), status);
  }

  public Object earnings(LocalDate from, LocalDate to) {
    var u = rider();
    if (from == null
        || to == null
        || from.isAfter(to)
        || java.time.temporal.ChronoUnit.DAYS.between(from, to) > 366)
      throw new IllegalArgumentException("Valid range of at most 366 days required");
    Map<LocalDate, BigDecimal> daily = new TreeMap<>();
    long trips = 0;
    BigDecimal gross = BigDecimal.ZERO;
    BigDecimal charge = BigDecimal.ZERO;
    for (var d : deliveries.findByRiderId(u.getId())) {
      if (!d.getStatus().equals("DELIVERED") || d.getCompletedAt() == null) continue;
      LocalDate day = d.getCompletedAt().atZone(ZoneId.of("Asia/Colombo")).toLocalDate();
      if (day.isBefore(from) || day.isAfter(to)) continue;
      BigDecimal fee = orders.findById(d.getOrderId()).orElseThrow().getDeliveryFee();
      gross = gross.add(fee);
      trips++;
      BigDecimal tripCharge =
          fee.multiply(
                  d.getServiceRate() == null
                      ? policies.amount("driver_service_rate")
                      : d.getServiceRate())
              .setScale(2, RoundingMode.HALF_UP);
      charge = charge.add(tripCharge);
      daily.merge(day, fee.subtract(tripCharge), BigDecimal::add);
    }

    BigDecimal net = gross.subtract(charge);
    return Map.of(
        "totalEarnings",
        net,
        "totalTrips",
        trips,
        "serviceCharge",
        charge,
        "serviceChargeRate",
        policies.amount("driver_service_rate").multiply(new BigDecimal("100")),
        "averagePerTrip",
        trips == 0
            ? BigDecimal.ZERO
            : net.divide(BigDecimal.valueOf(trips), 2, RoundingMode.HALF_UP),
        "dailyBreakdown",
        daily.entrySet().stream()
            .map(e -> Map.of("date", e.getKey(), "netEarnings", e.getValue()))
            .toList());
  }

  public Object banks() {
    rider();
    return ((List<com.foodie.payment.model.BankAccount>) payments.banks())
        .stream()
            .map(
                b ->
                    Map.of(
                        "id",
                        b.getId(),
                        "bank",
                        b.getBank(),
                        "accountHolder",
                        b.getName(),
                        "accountLastFour",
                        b.getLastFour()))
            .toList();
  }

  @Transactional
  public void bank(String bank, String holder, String number) {
    rider();
    payments.bank(null, new PaymentService.Bank(bank, holder, number, "", false));
  }

  @Transactional
  public Object payout(Long bankId, BigDecimal amount) {
    var u = rider();
    var bank = banks.findById(bankId).orElseThrow(Inputs::missing);
    if (!bank.getOwnerId().equals(u.getId()))
      throw new SecurityException("Bank ownership required");
    return payments.request(
        new PaymentService.Transfer(bank.getBank(), bank.getName(), bank.getLastFour(), amount),
        null);
  }

  @Transactional
  public Object vehicle(String registration, Map<String, MultipartFile> files)
      throws java.io.IOException {
    var u = rider();
    accounts.lock(u.getId()).orElseThrow();
    Inputs.require(
        changes.findByUserId(u.getId()).stream()
            .noneMatch(c -> c.getStatus().equals("PENDING_REVIEW")),
        "Vehicle review already pending");
    List<String> required =
        List.of(
            "registrationDocument",
            "revenueLicence",
            "insuranceDocument",
            "frontPhoto",
            "sidePhoto",
            "backPhoto");
    if (!files.keySet().containsAll(required))
      throw new IllegalArgumentException("All vehicle documents and photos required");
    VehicleChange change = new VehicleChange();
    change.setUserId(u.getId());
    change.setRegistration(Inputs.text(registration, 40));
    change.setStatus("PENDING_REVIEW");
    change.setCreatedAt(Instant.now());
    changes.saveAndFlush(change);
    for (String kind : required) {
      var file = files.get(kind);
      if (file.isEmpty() || file.getSize() > 5242880)
        throw new IllegalArgumentException("Documents must be 1 byte–5 MB");
      byte[] b = file.getBytes();
      String media =
          b.length > 4 && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F'
              ? "application/pdf"
              : b.length > 3 && (b[0] & 255) == 255 && (b[1] & 255) == 216
                  ? "image/jpeg"
                  : b.length > 8 && (b[0] & 255) == 137 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                      ? "image/png"
                      : null;
      if (media == null || kind.endsWith("Photo") && !media.startsWith("image/"))
        throw new IllegalArgumentException("Valid PDF, JPEG or PNG required");
      Document d = new Document();
      d.setUserId(u.getId());
      d.setVehicleChangeId(change.getId());
      d.setKind("VC" + change.getId() + ":" + kind);
      d.setMediaType(media);
      d.setContent(b);
      documents.save(d);
    }
    u.setOnline(false);
    notes.queue(
        u.getId(),
        u.getEmail(),
        "Vehicle change submitted",
        "Your vehicle change is pending Admin review.",
        "Delivery Riders");
    return change;
  }

  @Transactional
  public void reviewVehicle(Long id, boolean approve) {
    users.operational("ADMIN");
    var c = changes.lock(id).orElseThrow(Inputs::missing);
    Inputs.require(c.getStatus().equals("PENDING_REVIEW"), "Vehicle change already reviewed");
    var u = accounts.lock(c.getUserId()).orElseThrow();
    c.setStatus(approve ? "APPROVED" : "REJECTED");
    if (approve) u.setPlate(c.getRegistration());
    notes.queue(
        u.getId(),
        u.getEmail(),
        "Vehicle change " + c.getStatus().toLowerCase(),
        "Vehicle review: " + c.getStatus(),
        "Delivery Riders");
  }

  public Object activeOrder() {
    var rider = rider();
    return deliveries.findByRiderId(rider.getId()).stream()
        .filter(delivery -> !delivery.getStatus().equals("DELIVERED"))
        .findFirst()
        .map(delivery -> view(orders.findById(delivery.getOrderId()).orElseThrow()))
        .orElse(null);
  }

  public Object history() {
    var rider = rider();
    return deliveries.findByRiderId(rider.getId()).stream()
        .map(delivery -> view(orders.findById(delivery.getOrderId()).orElseThrow()))
        .toList();
  }

  public Object vehicleRequests(Long userId) {
    users.operational("ADMIN");
    return changes.findByUserId(userId);
  }
}
