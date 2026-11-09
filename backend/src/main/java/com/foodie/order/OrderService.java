package com.foodie.order;

import com.foodie.common.Inputs;
import com.foodie.order.data.*;
import com.foodie.payment.model.Payment;
import com.foodie.payment.repository.PaymentRepository;
import com.foodie.restaurant.RestaurantService;
import com.foodie.restaurant.repository.*;
import com.foodie.user.UserService;
import java.math.*;
import java.time.Instant;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class OrderService {
    private final com.foodie.operations.data.OfferRepository offers;
    private final com.foodie.user.AppUserRepository accounts;
    private final FoodOrderRepository orders;
    private final OrderLineRepository lines;
    private final MenuItemRepository items;
    private final MenuSizeRepository sizes;
    private final RestaurantService restaurants;
    private final UserService users;
    private final PaymentRepository payments;
    private final com.foodie.notification.NotificationService notifications;
    private final com.foodie.delivery.DeliveryRepository deliveries;

    private final com.foodie.settings.BusinessPolicyService policies;

    public OrderService(
            FoodOrderRepository orders,
            OrderLineRepository lines,
            MenuItemRepository items,
            MenuSizeRepository sizes,
            RestaurantService restaurants,
            UserService users,
            PaymentRepository payments,
            com.foodie.operations.data.OfferRepository offers,
            com.foodie.user.AppUserRepository accounts,
            com.foodie.settings.BusinessPolicyService policies,
            com.foodie.delivery.DeliveryRepository deliveries,
            com.foodie.notification.NotificationService notifications) {
        this.notifications = notifications;
        this.deliveries = deliveries;
        this.policies = policies;
        this.offers = offers;
        this.accounts = accounts;
        this.orders = orders;
        this.lines = lines;
        this.items = items;
        this.sizes = sizes;
        this.restaurants = restaurants;
        this.users = users;
        this.payments = payments;
    }

    public Object tracking(Long id) {
        return trackingData(visible(id));
    }

    private Object trackingData(FoodOrder order) {
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("order", order);
        result.put("items", lines.findByOrderId(order.getId()));
        result.put("restaurant", restaurants.get(order.getRestaurantId()));
        var delivery = deliveries.findByOrderId(order.getId());
        if (delivery.isPresent()) {
            var rider = accounts.findById(delivery.get().getRiderId()).orElseThrow();
            Map<String, Object> driver = new LinkedHashMap<>();
            driver.put("name", rider.getFirstName() + " " + rider.getLastName());
            driver.put("phone", rider.getPhone());
            driver.put("vehicleNumber", rider.getPlate());
            driver.put("vehicleType", rider.getVehicle());
            result.put("driver", driver);
        }
        return result;
    }

    public FoodOrder get(Long id) {
        return orders.findById(id).orElseThrow(Inputs::missing);
    }

    public FoodOrder visible(Long id) {
        var user = users.operational("CUSTOMER", "MERCHANT", "ADMIN");
        var order = get(id);
        if (!user.getRole().equals("ADMIN")
                && !user.getId().equals(order.getCustomerId())
                && !user.getId().equals(restaurants.get(order.getRestaurantId()).getOwnerId())) {
            throw new SecurityException("Order access denied");
        }
        return order;
    }

    public List<FoodOrder> list() {
        var user = users.operational("CUSTOMER", "MERCHANT", "ADMIN");
        if (user.getRole().equals("CUSTOMER")) {
            return orders.findByCustomerId(user.getId());
        }
        if (user.getRole().equals("ADMIN")) {
            return orders.findAll();
        }
        return orders.findAll().stream()
                .filter(order -> restaurants.get(order.getRestaurantId()).getOwnerId().equals(user.getId()))
                .toList();
    }

    public List<OrderLine> lines(Long id) {
        visible(id);
        return lines.findByOrderId(id);
    }

    public record Line(Long menuItemId, int quantity, String size, String specialInstructions) {}

    public record Checkout(
            Long restaurantId,
            String type,
            String deliveryAddress,
            String paymentMethod,
            List<Line> items,
            String offerCode,
            boolean redeemPoints,
            Map<String, String> contact) {}

    @Transactional
    public FoodOrder checkout(Checkout form, String requestKey) {
        return place(users.operational("CUSTOMER").getId(), form, requestKey);
    }

    public record Guest(Checkout order, String name, String email, String phone) {}

    @Transactional
    public Object guest(Guest f, String requestKey) {
        java.util.UUID.fromString(requestKey);
        if (orders.findByRequestKey(requestKey).isPresent())
            throw new IllegalStateException(
                    "This guest request already created an order; use the access token from its original"
                            + " response");
        String name = Inputs.text(f.name(), 160),
                email = Inputs.text(f.email(), 150),
                phone = Inputs.text(f.phone(), 30);
        if (!email.matches("[^ @]+@[^ @]+[.][^ @]+")) {
            throw new IllegalArgumentException("Valid email required");
        }
        String digits = phone.replaceAll("[^0-9]", "");
        if (digits.startsWith("94")) {
            digits = digits.substring(2);
        }
        if (digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        if (!digits.matches("[0-9]{9}")) {
            throw new IllegalArgumentException("Valid phone required");
        }
        var o = place(null, f.order(), requestKey);
        o.setContactName(name);
        o.setContactEmail(email);
        o.setContactPhone(digits);
        byte[] secret = new byte[32];
        new java.security.SecureRandom().nextBytes(secret);
        String token = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(secret);
        o.setGuestAccessHash(users.digest(token));
        return Map.of("order", o, "accessToken", token);
    }

    public Object guestOrder(Long id, String token) {
        var o = get(id);
        if (o.getCustomerId() != null
                || token == null
                || o.getGuestAccessHash() == null
                || !java.security.MessageDigest.isEqual(
                        o.getGuestAccessHash().getBytes(), users.digest(token).getBytes())) {
            throw new SecurityException("Guest order access denied");
        }
        return trackingData(o);
    }

    @Transactional
    private FoodOrder place(Long customerId, Checkout form, String requestKey) {
        return calculate(customerId, form, requestKey, true);
    }

    public FoodOrder quote(Checkout form) {
        Long customerId = null;
        var authentication =
                org.springframework.security.core.context.SecurityContextHolder.getContext()
                        .getAuthentication();
        if (authentication != null && !authentication.getName().equals("anonymousUser")) {
            customerId = users.operational("CUSTOMER").getId();
        }
        return calculate(customerId, form, null, false);
    }

    private FoodOrder calculate(Long customerId, Checkout form, String requestKey, boolean persist) {
        if (form == null) {
            throw new IllegalArgumentException("Checkout details required");
        }
        BigDecimal deliveryFee = policies.amount("delivery_fee");
        BigDecimal commission = policies.amount("commission_rate");
        if (persist && customerId != null) {
            accounts.lock(customerId).orElseThrow();
        }
        if (persist) {
            requestKey = Inputs.text(requestKey, 80);
        }
        var prior =
                persist ? orders.findByRequestKey(requestKey) : java.util.Optional.<FoodOrder>empty();
        if (prior.isPresent()) {
            if (customerId == null || !java.util.Objects.equals(prior.get().getCustomerId(), customerId)) {
                throw new SecurityException("Request key belongs to another account");
            }
            return prior.get();
        }
        var restaurant = restaurants.get(form.restaurantId());
        Inputs.require(restaurants.published(restaurant) && restaurant.getOpen(), "Restaurant unavailable");
        if (form.type() == null || !List.of("DELIVERY", "PICKUP").contains(form.type())) {
            throw new IllegalArgumentException("Delivery or pickup required");
        }
        Inputs.require(
                form.type().equals("DELIVERY") ? restaurant.getDelivery() : restaurant.getPickup(), "Fulfilment unavailable");
        if (persist && !"CASH".equals(form.paymentMethod()))
            throw new org.springframework.web.server.ResponseStatusException(
                    org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
                    "Real card gateway is not configured; no payment was processed");
        if (form.items() == null || form.items().isEmpty() || form.items().size() > 50) {
            throw new IllegalArgumentException("Order needs 1–50 items");
        }
        FoodOrder o = new FoodOrder();
        o.setCustomerId(customerId);
        if (form.contact() != null) {
            o.setContactName(Inputs.text(form.contact().get("name"), 160));
            String email = Inputs.text(form.contact().get("email"), 150);
            String phone = Inputs.text(form.contact().get("phone"), 30).replaceAll("[^0-9]", "");
            if (phone.startsWith("94")) {
                phone = phone.substring(2);
            }
            if (phone.startsWith("0")) {
                phone = phone.substring(1);
            }
            if (!email.matches("[^ @]+@[^ @]+[.][^ @]+") || !phone.matches("[0-9]{9}")) {
                throw new IllegalArgumentException("Valid checkout contact email and phone required");
            }
            o.setContactEmail(email);
            o.setContactPhone(phone);
        }
        o.setRestaurantId(restaurant.getId());
        o.setType(form.type());
        o.setDeliveryAddress(
                form.type().equals("DELIVERY")
                        ? Inputs.text(form.deliveryAddress(), 1000)
                        : restaurant.getAddress());
        o.setStatus("NEW");
        o.setPaymentMethod("CASH");
        o.setPaymentStatus("PENDING");
        o.setCreatedAt(Instant.now());
        o.setRequestKey(requestKey);
        o.setDiscount(BigDecimal.ZERO);
        o.setAdditionalCharge(BigDecimal.ZERO);
        o.setSubtotal(BigDecimal.ZERO);
        o.setDeliveryFee(form.type().equals("DELIVERY") ? deliveryFee : BigDecimal.ZERO);
        o.setTotal(BigDecimal.ZERO);
        if (persist) {
            orders.saveAndFlush(o);
        }
        List<OrderLine> calculatedLines = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        Set<String> seen = new HashSet<>();
        for (Line f : form.items()) {
            if (f == null
                    || f.quantity() < 1
                    || f.quantity() > 99
                    || !seen.add(f.menuItemId() + ":" + f.size())) {
                throw new IllegalArgumentException("Invalid quantity or duplicate line");
            }
            var menuItem = items.findById(f.menuItemId()).orElseThrow(Inputs::missing);
            Inputs.require(
                    menuItem.getRestaurantId().equals(restaurant.getId()) && menuItem.getAvailable(), "Menu item unavailable");
            BigDecimal price = menuItem.getPrice();
            if (menuItem.getSizesEnabled())
                price =
                        sizes.findByItemId(menuItem.getId()).stream()
                                .filter(menuSize -> menuSize.getSelected() && menuSize.getName().equals(f.size()))
                                .findFirst()
                                .orElseThrow(() -> new IllegalArgumentException("Select an available size"))
                                .getPrice();
            OrderLine line = new OrderLine();
            line.setOrderId(o.getId());
            line.setMenuItemId(menuItem.getId());
            line.setName(menuItem.getName());
            line.setQuantity(f.quantity());
            line.setUnitPrice(price);
            line.setSize(f.size());
            if (f.specialInstructions() != null && f.specialInstructions().length() > 240) {
                throw new IllegalArgumentException("Instructions may contain at most 240 characters");
            }
            line.setSpecialInstructions(f.specialInstructions());
            calculatedLines.add(line);
            if (persist) {
                lines.save(line);
            }
            subtotal = subtotal.add(price.multiply(BigDecimal.valueOf(f.quantity())));
        }
        o.setSubtotal(subtotal);
        BigDecimal discount = BigDecimal.ZERO;
        if (form.offerCode() != null && !form.offerCode().isBlank()) {
            var offer =
                    offers.findAll().stream()
                            .filter(x -> x.getCode().equalsIgnoreCase(form.offerCode()))
                            .findFirst()
                            .orElseThrow(() -> new IllegalArgumentException("Unknown offer code"));
            var today = java.time.LocalDate.now(java.time.ZoneId.of("Asia/Colombo"));
            Inputs.require(
                    offer.getEnabled()
                            && offer.getPublished()
                            && !today.isBefore(offer.getStartDate())
                            && !today.isAfter(offer.getEndDate())
                            && (offer.getRestaurantId() == null || offer.getRestaurantId().equals(restaurant.getId())),
                    "Offer is not valid for this order");
            var eligible =
                    calculatedLines.stream()
                            .filter(
                                    orderLine ->
                                            offer.getMenuItemId() == null
                                                    || offer.getMenuItemId().equals(orderLine.getMenuItemId()))
                            .toList();
            BigDecimal applicable =
                    eligible.stream()
                            .map(l -> l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQuantity())))
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
            switch (offer.getDiscountType()) {
                case "PERCENTAGE" ->
                        discount =
                                applicable
                                        .multiply(offer.getDiscountValue())
                                        .divide(new BigDecimal("100"), 2, RoundingMode.HALF_UP);
                case "FIXED" -> discount = applicable.min(offer.getDiscountValue());
                case "FREE_DELIVERY" -> {
                    Inputs.require(o.getType().equals("DELIVERY"), "Delivery offer requires delivery");
                    o.setDeliveryFee(BigDecimal.ZERO);
                }
                case "BUY_X_GET_Y" -> {
                    int buy = offer.getDiscountValue().intValueExact();
                    if (buy < 1) {
                        throw new IllegalArgumentException("Invalid buy quantity");
                    }
                    for (var l : eligible)
                        discount =
                                discount.add(
                                        l.getUnitPrice().multiply(BigDecimal.valueOf(l.getQuantity() / (buy + 1))));
                }
                default -> throw new IllegalArgumentException("Unsupported offer");
            }
            o.setOfferId(offer.getId());
        }
        o.setOfferDiscount(discount);
        o.setPointsDiscount(BigDecimal.ZERO);
        if (form.redeemPoints()) {
            if (customerId == null) {
                throw new IllegalArgumentException("Guest reward redemption is unavailable");
            }
            int balance =
                    orders.findByCustomerId(customerId).stream()
                            .filter(x -> !x.getStatus().equals("CANCELLED"))
                            .mapToInt(
                                    x ->
                                            (List.of("DELIVERED", "PICKED_UP").contains(x.getStatus())
                                                            ? x.getPoints()
                                                            : 0)
                                                    - x.getRedeemedPoints())
                            .sum();
            int requiredPoints = policies.amount("reward_minimum_points").intValueExact();
            Inputs.require(balance >= requiredPoints, "Not enough earned reward points");
            BigDecimal pointsDiscount =
                    subtotal
                            .subtract(discount)
                            .multiply(policies.amount("reward_discount_rate"))
                            .setScale(2, RoundingMode.HALF_UP);
            o.setPointsDiscount(pointsDiscount);
            discount = discount.add(pointsDiscount);
            o.setRedeemedPoints(requiredPoints);
        }
        o.setDiscount(discount);
        int earnedPoints = policies.amount("reward_points_base").intValueExact();
        if (subtotal.compareTo(policies.amount("reward_tier_one")) >= 0) {
            earnedPoints = policies.amount("reward_points_one").intValueExact();
        }
        if (subtotal.compareTo(policies.amount("reward_tier_two")) >= 0) {
            earnedPoints = policies.amount("reward_points_two").intValueExact();
        }
        if (subtotal.compareTo(policies.amount("reward_tier_three")) >= 0) {
            earnedPoints = policies.amount("reward_points_three").intValueExact();
        }
        o.setPoints(subtotal.signum() == 0 ? 0 : earnedPoints);
        o.setTotal(subtotal.subtract(discount).add(o.getDeliveryFee()));
        Payment p = new Payment();
        p.setOrderId(o.getId());
        p.setMethod("CASH");
        p.setStatus("PENDING");
        p.setAmount(o.getTotal());
        p.setCommission(
                subtotal.subtract(discount).multiply(commission).setScale(2, RoundingMode.HALF_UP));
        if (persist) {
            payments.save(p);
            var merchant = accounts.findById(restaurant.getOwnerId()).orElseThrow();
            notifications.queue(
                    merchant.getId(),
                    merchant.getEmail(),
                    "New Foodie order #" + o.getId(),
                    "Order #" + o.getId() + " is awaiting acceptance.",
                    "Orders");
        }
        if (customerId == null) {
            o.setPoints(0);
        }
        return o;
    }

    @Transactional
    public FoodOrder status(Long id, String target) {
        target = Inputs.text(target, 30);
        var user = users.operational("CUSTOMER", "MERCHANT", "ADMIN");
        var o = orders.lock(id).orElseThrow(Inputs::missing);
        String from = o.getStatus();
        if (user.getRole().equals("CUSTOMER")) {
            if (!user.getId().equals(o.getCustomerId())) {
                throw new SecurityException("Not your order");
            }
            Inputs.require(
                    from.equals("NEW") && "CANCELLED".equals(target),
                    "Customer cancellation is allowed before acceptance");
        } else {
            restaurants.own(o.getRestaurantId());
            boolean valid =
                    from.equals("NEW") && List.of("PREPARING", "CANCELLED").contains(target)
                            || from.equals("PREPARING") && "READY".equals(target)
                            || from.equals("READY") && o.getType().equals("PICKUP") && "PICKED_UP".equals(target);
            Inputs.require(valid, "Invalid order transition");
        }
        o.setStatus(target);
        if (target.equals("CANCELLED")) {
            var p = payments.findByOrderId(id).orElseThrow();
            Inputs.require(p.getStatus().equals("PENDING"), "Settled payment cannot be cancelled");
            p.setStatus("CANCELLED");
            o.setPaymentStatus("CANCELLED");
        }
        return o;
    }

    @Transactional
    public void proposeCharge(Long id, BigDecimal amount) {
        var order = orders.lock(id).orElseThrow(Inputs::missing);
        restaurants.own(order.getRestaurantId());
        Inputs.require(
                !order.getCustomerAgreed() && List.of("NEW", "PREPARING").contains(order.getStatus()),
                "Order cannot change after an accepted charge");
        order.setAdditionalCharge(Inputs.money(amount));
        order.setCustomerAgreed(false);
    }

    @Transactional
    public void consent(Long id, BigDecimal amount) {
        var user = users.operational("CUSTOMER");
        var o = orders.lock(id).orElseThrow(Inputs::missing);
        if (!user.getId().equals(o.getCustomerId())) {
            throw new SecurityException("Not your order");
        }
        acceptCharge(o, amount);
    }

    @Transactional
    public void guestConsent(Long id, String token, BigDecimal amount) {
        guestOrder(id, token);
        acceptCharge(orders.lock(id).orElseThrow(Inputs::missing), amount);
    }

    private void acceptCharge(FoodOrder order, BigDecimal amount) {
        BigDecimal commission = policies.amount("commission_rate");
        amount = Inputs.money(amount);
        Inputs.require(
                !order.getCustomerAgreed()
                        && order.getAdditionalCharge().compareTo(amount) == 0
                        && List.of("NEW", "PREPARING").contains(order.getStatus()),
                "Charge changed or already accepted");
        order.setCustomerAgreed(true);
        order.setTotal(
                order.getSubtotal()
                        .add(order.getDeliveryFee())
                        .add(order.getAdditionalCharge())
                        .subtract(order.getDiscount()));
        var payment = payments.findByOrderId(order.getId()).orElseThrow();
        payment.setAmount(order.getTotal());
        payment.setCommission(
                order.getSubtotal()
                        .subtract(order.getDiscount())
                        .add(order.getAdditionalCharge())
                        .multiply(commission)
                        .setScale(2, RoundingMode.HALF_UP));
    }
}
