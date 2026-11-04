package com.foodie;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;

import com.fasterxml.jackson.databind.*;
import com.foodie.order.data.*;
import com.foodie.payment.repository.*;
import com.foodie.restaurant.repository.*;
import com.foodie.user.AppUserRepository;
import com.foodie.user.model.*;
import java.time.*;
import java.util.*;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mock.web.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.*;

@SpringBootTest(properties = {"foodie.mail.enabled=true"})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class NewBackendTest {
  @Autowired MockMvc mvc;
  @Autowired ObjectMapper json;
  @Autowired AppUserRepository accounts;
  @Autowired RestaurantRepository restaurants;
  @Autowired MenuItemRepository menu;
  @Autowired FoodOrderRepository orders;
  @Autowired OrderLineRepository lines;
  @Autowired PaymentRepository payments;
  @Autowired PasswordEncoder passwords;
  @Autowired JdbcTemplate db;
  @MockitoBean JavaMailSender mail;

  @org.springframework.test.context.bean.override.mockito.MockitoSpyBean
  com.foodie.media.CloudinaryImages images;

  static final java.util.concurrent.atomic.AtomicInteger sequence =
      new java.util.concurrent.atomic.AtomicInteger(100000000);

  @org.springframework.test.context.DynamicPropertySource
  static void testKeys(org.springframework.test.context.DynamicPropertyRegistry registry) {
    registry.add("CLOUDINARY_UPLOADS_ENABLED", () -> false);
    registry.add("CLOUDINARY_URL", () -> "");
    registry.add(
        "foodie.bank-key",
        () -> {
          byte[] key = new byte[32];
          new java.security.SecureRandom().nextBytes(key);
          return java.util.Base64.getEncoder().encodeToString(key);
        });
  }

  static final String PASSWORD = UUID.randomUUID().toString();
  AppUser customer, merchant, rider, admin, other;
  MockHttpSession c, m, r, a, x;
  long restaurant, item;

  MvcResult result(String method, String path, MockHttpSession session, Object body, int status)
      throws Exception {
    var request =
        request(org.springframework.http.HttpMethod.valueOf(method), path)
            .with(csrf())
            .contentType("application/json");
    if (session != null) request.session(session);
    if (body != null) request.content(json.writeValueAsString(body));
    var result = mvc.perform(request).andReturn();
    assertEquals(
        status,
        result.getResponse().getStatus(),
        method + " " + path + " " + result.getResponse().getContentAsString());
    return result;
  }

  JsonNode call(String method, String path, MockHttpSession session, Object body, int status)
      throws Exception {
    String text = result(method, path, session, body, status).getResponse().getContentAsString();
    return text.isBlank() ? json.nullNode() : json.readTree(text);
  }

  MockHttpSession login(AppUser user) throws Exception {
    return (MockHttpSession)
        result(
                "POST",
                "/api/auth/login",
                null,
                Map.of("email", user.getEmail(), "password", PASSWORD),
                200)
            .getRequest()
            .getSession(false);
  }

  AppUser fixture(String role, boolean approved) {
    AppUser user =
        switch (role) {
          case "CUSTOMER" -> new CustomerUser();
          case "MERCHANT" -> new MerchantUser();
          case "RIDER" -> new RiderUser();
          default -> new AdminUser();
        };
    int n = sequence.incrementAndGet();
    user.setFirstName(role);
    user.setLastName("Test");
    user.setNationalId("200" + n);
    user.setEmail(role.toLowerCase() + n + "@example.com");
    user.setPhone(Integer.toString(n));
    user.setPasswordHash(passwords.encode(PASSWORD));
    user.setActive(true);
    user.setApprovalStatus(approved ? "APPROVED" : "PENDING");
    user.setCreatedAt(Instant.now());
    user.setAddress1("Test address");
    if (user instanceof RiderUser driver) {
      driver.setOnline(true);
      driver.setBirthDate(LocalDate.of(2000, 1, 1));
      driver.setLicenseNumber("TEST-LICENSE");
    }
    return accounts.saveAndFlush(user);
  }

  @BeforeEach
  void fixtures() throws Exception {
    for (var policy :
        Map.of(
                "delivery_fee",
                "150",
                "commission_rate",
                "0.10",
                "driver_service_rate",
                "0.10",
                "reward_discount_rate",
                "0.10",
                "reward_minimum_points",
                "20",
                "reward_tier_one",
                "1000",
                "reward_tier_two",
                "2500",
                "reward_tier_three",
                "5000")
            .entrySet()) {
      db.update(
          "MERGE INTO nf_business_policies (policy_key, amount) KEY(policy_key) VALUES (?,?)",
          policy.getKey(),
          new java.math.BigDecimal(policy.getValue()));
    }
    rewardPolicies();
    customer = fixture("CUSTOMER", true);
    merchant = fixture("MERCHANT", true);
    rider = fixture("RIDER", true);
    admin = fixture("ADMIN", true);
    other = fixture("CUSTOMER", true);
    c = login(customer);
    m = login(merchant);
    r = login(rider);
    a = login(admin);
    x = login(other);
    restaurant =
        call(
                "POST",
                "/api/restaurants",
                m,
                Map.of(
                    "name",
                    "Test Kitchen " + UUID.randomUUID(),
                    "address",
                    "42 Test Street",
                    "phone",
                    "0771234567",
                    "location",
                    "Kiribathgoda",
                    "cuisine",
                    "Sri Lankan",
                    "description",
                    "Test fixture",
                    "open",
                    true,
                    "delivery",
                    true,
                    "pickup",
                    true),
                200)
            .get("id")
            .asLong();
    item =
        call(
                "POST",
                "/api/menu-items",
                m,
                Map.of(
                    "restaurantId",
                    restaurant,
                    "name",
                    "Test meal",
                    "category",
                    "Main course",
                    "description",
                    "Test fixture",
                    "price",
                    1000,
                    "available",
                    true,
                    "sizesEnabled",
                    false),
                200)
            .get("id")
            .asLong();
  }

  Map<String, Object> registration(String role) {
    int n = sequence.incrementAndGet();
    Map<String, Object> form = new HashMap<>();
    form.put("firstName", "New");
    form.put("lastName", "Applicant");
    form.put("nationalId", "200" + n);
    form.put("email", "applicant" + n + "@example.com");
    form.put("phone", Integer.toString(n));
    form.put("address1", "House");
    form.put("address2", "Street");
    form.put("address3", "City");
    form.put("password", PASSWORD);
    form.put("confirmPassword", PASSWORD);
    form.put("terms", true);
    form.put("restaurantName", "Applicant kitchen");
    form.put("restaurantAddress", "Kiribathgoda");
    form.put("restaurantPhone", Integer.toString(n));
    return form;
  }

  JsonNode checkout(String type, String method, String key, int status) throws Exception {
    var request =
        post("/api/orders")
            .session(c)
            .with(csrf())
            .header("Idempotency-Key", key)
            .contentType("application/json")
            .content(
                json.writeValueAsString(
                    Map.of(
                        "restaurantId",
                        restaurant,
                        "type",
                        type,
                        "deliveryAddress",
                        "42 Delivery Street",
                        "paymentMethod",
                        method,
                        "items",
                        List.of(Map.of("menuItemId", item, "quantity", 1)))));
    var response = mvc.perform(request).andReturn().getResponse();
    assertEquals(status, response.getStatus(), response.getContentAsString());
    return json.readTree(response.getContentAsString());
  }

  long checkout(String type) throws Exception {
    return checkout(type, "CASH", UUID.randomUUID().toString(), 200).get("id").asLong();
  }

  void stage(long id, String status) throws Exception {
    call("PATCH", "/api/orders/" + id + "/status", m, Map.of("status", status), 200);
  }

  long completePickup() throws Exception {
    long id = checkout("PICKUP");
    stage(id, "PREPARING");
    stage(id, "READY");
    stage(id, "PICKED_UP");
    return id;
  }

  void upload(MockHttpSession session, String kind) throws Exception {
    byte[] png =
        Base64.getDecoder()
            .decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ioAAAAASUVORK5CYII=");
    var file = new MockMultipartFile("file", "document.png", "image/png", png);
    var response =
        mvc.perform(
                multipart("/api/applications/documents/" + kind)
                    .file(file)
                    .session(session)
                    .with(csrf()))
            .andReturn()
            .getResponse();
    assertEquals(200, response.getStatus(), response.getContentAsString());
  }

  @Test
  void customerRegistrationIsImmediateAndRejectsDuplicates() throws Exception {
    var form = registration("CUSTOMER");
    var created = call("POST", "/api/auth/register/customer", null, form, 200);
    assertEquals("APPROVED", created.get("approvalStatus").asText());
    assertFalse(created.has("passwordHash"));
    var user = accounts.findById(created.get("id").asLong()).orElseThrow();
    call("GET", "/api/orders", login(user), null, 200);
    call("POST", "/api/auth/register/customer", null, form, 409);
    call("POST", "/api/auth/register/admin", null, registration("ADMIN"), 400);
  }

  @Test
  void pendingUsersCanReadStatusButCannotOperate() throws Exception {
    var created = call("POST", "/api/merchants/register", null, registration("MERCHANT"), 200);
    var u = accounts.findById(created.get("id").asLong()).orElseThrow();
    var pending = login(u);
    call("GET", "/api/applications", pending, null, 200);
    call("GET", "/api/orders", pending, null, 403);
    call("GET", "/api/wallet", pending, null, 403);
    var driver = fixture("RIDER", false);
    call(
        "POST",
        "/api/driver/auth/login",
        null,
        Map.of("email", driver.getEmail(), "password", PASSWORD),
        403);
    call("GET", "/api/applications", login(driver), null, 200);
  }

  @Test
  void merchantApprovalIsPersistentAndMailFailureCannotUndoIt() throws Exception {
    var u = fixture("MERCHANT", false);
    var pending = login(u);
    upload(pending, "BUSINESS_FRONT");
    upload(pending, "BUSINESS_BACK");
    call("POST", "/api/applications/submit", pending, null, 200);
    doThrow(new org.springframework.mail.MailSendException("Isolated test failure"))
        .when(mail)
        .send(any(SimpleMailMessage.class));
    call("POST", "/api/admin/merchants/" + u.getId() + "/approve", a, null, 200);
    assertEquals("APPROVED", accounts.findById(u.getId()).orElseThrow().getApprovalStatus());
    assertTrue(
        db.queryForObject(
                "SELECT COUNT(*) FROM nf_notifications WHERE user_id=? AND email_status='FAILED'",
                Long.class,
                u.getId())
            > 0);
    call("POST", "/api/admin/merchants/" + u.getId() + "/approve", a, null, 409);
    call("GET", "/api/orders", pending, null, 200);
  }

  @Test
  void rejectionEmailsAndPermissionChecks() throws Exception {
    var u = fixture("MERCHANT", false);
    var pending = login(u);
    upload(pending, "BUSINESS_FRONT");
    upload(pending, "BUSINESS_BACK");
    call("POST", "/api/applications/submit", pending, null, 200);
    call(
        "POST",
        "/api/admin/merchants/" + u.getId() + "/reject",
        c,
        Map.of("reason", "Incomplete business details"),
        403);
    call(
        "POST",
        "/api/admin/merchants/" + u.getId() + "/reject",
        a,
        Map.of("reason", "Incomplete business details"),
        200);
    call("GET", "/api/orders", pending, null, 403);
    var capture = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mail, atLeastOnce()).send(capture.capture());
    assertTrue(
        capture.getAllValues().stream()
            .anyMatch(
                message ->
                    message.getSubject().contains("rejected")
                        && message.getText().contains("Incomplete business details")));
  }

  @Test
  void driverRegistrationVerificationDocumentsAndApproval() throws Exception {
    int n = sequence.incrementAndGet();
    var form =
        Map.ofEntries(
            Map.entry("firstName", "Driver"),
            Map.entry("lastName", "Applicant"),
            Map.entry("nationalId", "200" + n),
            Map.entry("licenseNumber", "LICENSE-" + n),
            Map.entry("birthDate", "2000-01-01"),
            Map.entry("email", "driverapp" + n + "@example.com"),
            Map.entry("phone", Integer.toString(n)),
            Map.entry("address1", "Home"),
            Map.entry("address2", "Street"),
            Map.entry("address3", "City"),
            Map.entry("registration", "WP-TEST"));
    var created = call("POST", "/api/driver/applications", null, form, 200);
    long id = created.get("id").asLong();
    var capture = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mail, atLeastOnce()).send(capture.capture());
    String code =
        capture.getAllValues().stream()
            .filter(message -> message.getSubject().equals("Verify Foodie email"))
            .reduce((first, last) -> last)
            .orElseThrow()
            .getText()
            .split(": ")[1]
            .split("\n")[0];
    assertFalse(
        db.queryForObject(
                "SELECT text FROM nf_notifications WHERE user_id=? ORDER BY id DESC LIMIT 1",
                String.class,
                id)
            .contains(code));
    call(
        "POST",
        "/api/auth/setup-password",
        null,
        Map.of("email", form.get("email"), "token", "wrong", "password", PASSWORD),
        400);
    call(
        "POST",
        "/api/auth/setup-password",
        null,
        Map.of("email", form.get("email"), "token", code, "password", PASSWORD),
        200);
    call(
        "POST",
        "/api/auth/setup-password",
        null,
        Map.of("email", form.get("email"), "token", code, "password", PASSWORD),
        400);
    var session = login(accounts.findById(id).orElseThrow());
    call("POST", "/api/applications/submit", session, null, 409);
    for (String kind :
        List.of(
            "NIC_FRONT",
            "NIC_BACK",
            "LICENSE_FRONT",
            "LICENSE_BACK",
            "REGISTRATION_FRONT",
            "REGISTRATION_BACK",
            "REVENUE_FRONT",
            "REVENUE_BACK",
            "INSURANCE_FRONT",
            "INSURANCE_BACK",
            "VEHICLE_FRONT",
            "VEHICLE_BACK",
            "VEHICLE_SIDE")) upload(session, kind);
    call("POST", "/api/applications/submit", session, null, 200);
    call("POST", "/api/admin/riders/" + id + "/approve", a, null, 200);
    call(
        "POST",
        "/api/driver/auth/login",
        null,
        Map.of("email", form.get("email"), "password", PASSWORD),
        200);
  }

  @Test
  void documentDownloadsArePrivate() throws Exception {
    var u = fixture("MERCHANT", false);
    upload(login(u), "BUSINESS_FRONT");
    long id =
        db.queryForObject("SELECT id FROM nf_documents WHERE user_id=?", Long.class, u.getId());
    call("GET", "/api/applications/documents/" + id, x, null, 403);
    assertEquals(
        "image/png",
        result("GET", "/api/applications/documents/" + id, a, null, 200)
            .getResponse()
            .getContentType());
  }

  @Test
  void sessionCsrfAndAdminFormLogin() throws Exception {
    assertEquals(
        403,
        mvc.perform(
                post("/api/auth/login")
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of("email", rider.getEmail(), "password", PASSWORD))))
            .andReturn()
            .getResponse()
            .getStatus());
    assertEquals(
        403,
        mvc.perform(
                post("/api/driver/auth/login")
                    .header("Origin", "https://attacker.example")
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of("email", rider.getEmail(), "password", PASSWORD))))
            .andReturn()
            .getResponse()
            .getStatus());
    assertEquals(
        200,
        mvc.perform(
                post("/api/driver/auth/login")
                    .header("Origin", "http://localhost")
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of("email", rider.getEmail(), "password", PASSWORD))))
            .andReturn()
            .getResponse()
            .getStatus());
    call(
        "POST",
        "/api/auth/login",
        null,
        Map.of("email", customer.getEmail(), "password", "wrong"),
        401);
    call("GET", "/api/admin/test", null, null, 401);
    call("GET", "/api/admin/test", c, null, 403);
    var form =
        mvc.perform(
                post("/login")
                    .with(csrf())
                    .param("username", admin.getEmail())
                    .param("password", PASSWORD))
            .andReturn();
    assertEquals(302, form.getResponse().getStatus());
    var session = (MockHttpSession) form.getRequest().getSession(false);
    assertEquals(
        "Platform Admin authentication successful",
        call("GET", "/api/admin/test", session, null, 200).get("message").asText());
    call("GET", "/api/admin/csrf", session, null, 200);
  }

  @Test
  void restaurantOwnershipAndRealLocationFilters() throws Exception {
    var stranger = fixture("MERCHANT", true);
    var session = login(stranger);
    call(
        "PUT",
        "/api/restaurants/" + restaurant,
        session,
        Map.of(
            "name",
            "Takeover",
            "address",
            "Street",
            "phone",
            "0771234567",
            "location",
            "City",
            "cuisine",
            "Food",
            "open",
            true),
        403);
    var list = call("GET", "/api/restaurants?location=Kiribathgoda&type=PICKUP", null, null, 200);
    assertTrue(list.size() > 0);
    for (var row : list) {
      assertEquals("Kiribathgoda", row.get("location").asText());
      assertTrue(row.get("pickup").asBoolean());
    }
    assertEquals(0, call("GET", "/api/restaurants?location=NoSuchCity", null, null, 200).size());
  }

  @Test
  void browserMenuAliasNeverBecomesDatabaseId() throws Exception {
    String alias = UUID.randomUUID().toString();
    var body =
        Map.of(
            "name",
            "Browser item",
            "category",
            "Main course",
            "price",
            1250,
            "available",
            true,
            "sizesEnabled",
            true,
            "sizes",
            Map.of(
                "Small",
                Map.of("selected", true, "price", 900),
                "Large",
                Map.of("selected", true, "price", 1500)));
    var saved = call("POST", "/api/menu-items/" + alias, m, body, 200);
    assertTrue(saved.get("id").isNumber());
    long id = saved.get("id").asLong();
    assertEquals(id, call("POST", "/api/menu-items/" + alias, m, body, 200).get("id").asLong());
    var publicRows = call("GET", "/api/menu-items?restaurantId=" + restaurant, null, null, 200);
    assertTrue(publicRows.findValues("id").stream().allMatch(JsonNode::isNumber));
    var outsider = login(fixture("MERCHANT", true));
    call("POST", "/api/menu-items/" + alias, outsider, body, 403);
    call("DELETE", "/api/menu-items/" + id, m, null, 200);
    assertFalse(menu.findById(id).orElseThrow().getAvailable());
  }

  @Test
  void orderTotalsIdempotencyOwnershipAndCardUnavailability() throws Exception {
    String key = UUID.randomUUID().toString();
    var order = checkout("DELIVERY", "CASH", key, 200);
    assertEquals(1150, order.get("total").asDouble());
    assertEquals(order.get("id"), checkout("DELIVERY", "CASH", key, 200).get("id"));
    call("GET", "/api/orders/" + order.get("id").asLong(), x, null, 403);
    checkout("PICKUP", "CARD", UUID.randomUUID().toString(), 503);
    call(
        "PATCH",
        "/api/orders/" + order.get("id").asLong() + "/status",
        m,
        Map.of("status", "DELIVERED"),
        409);
  }

  @Test
  void pickupCannotEnterDriverQueueAndCashCannotBeDuplicated() throws Exception {
    long id = completePickup();
    var offers = call("GET", "/api/deliveries/available", r, null, 200);
    for (var offer : offers) assertNotEquals(id, offer.get("id").asLong());
    call("POST", "/api/deliveries/accept/" + id, r, null, 409);
    call("POST", "/api/payments/collect/" + id, c, null, 403);
    call("POST", "/api/payments/collect/" + id, m, null, 200);
    call("POST", "/api/payments/collect/" + id, m, null, 409);
    assertTrue(call("GET", "/api/wallet", m, null, 200).get("available").asDouble() >= 900);
  }

  @Test
  void actualDriverContractDeliveryAndEarnings() throws Exception {
    long id = checkout("DELIVERY");
    stage(id, "PREPARING");
    stage(id, "READY");
    call(
        "PUT",
        "/api/driver/availability",
        r,
        Map.of("available", true, "latitude", 6.9, "longitude", 79.9),
        200);
    var offer = call("GET", "/api/driver/orders/offer", r, null, 200);
    assertTrue(offer.has("deliveryPayment"));
    call("POST", "/api/driver/orders/" + id + "/accept", r, null, 200);
    call("POST", "/api/driver/orders/" + id + "/complete", r, null, 409);
    call("POST", "/api/driver/orders/" + id + "/pickup", r, null, 200);
    call("POST", "/api/driver/orders/" + id + "/complete", r, null, 200);
    call("POST", "/api/payments/collect/" + id, r, null, 200);
    var earnings = call("GET", "/api/driver/earnings?from=2020-01-01&to=2020-01-02", r, null, 200);
    assertEquals(0, earnings.get("totalTrips").asLong());
    String today = LocalDate.now(ZoneId.of("Asia/Colombo")).toString();
    earnings = call("GET", "/api/driver/earnings?from=" + today + "&to=" + today, r, null, 200);
    assertTrue(earnings.get("totalEarnings").asDouble() >= 135);
  }

  @Test
  void simultaneousDriversCannotBothAccept() throws Exception {
    long id = checkout("DELIVERY");
    stage(id, "PREPARING");
    stage(id, "READY");
    var second = login(fixture("RIDER", true));
    var start = new CountDownLatch(1);
    var pool = Executors.newFixedThreadPool(2);
    try {
      var first =
          pool.submit(
              () -> {
                start.await();
                return mvc.perform(post("/api/deliveries/accept/" + id).session(r).with(csrf()))
                    .andReturn()
                    .getResponse()
                    .getStatus();
              });
      var next =
          pool.submit(
              () -> {
                start.await();
                return mvc.perform(
                        post("/api/deliveries/accept/" + id).session(second).with(csrf()))
                    .andReturn()
                    .getResponse()
                    .getStatus();
              });
      start.countDown();
      var statuses = new ArrayList<>(List.of(first.get(), next.get()));
      Collections.sort(statuses);
      assertEquals(List.of(200, 409), statuses);
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  void bankEncryptionPayoutReservationsAndVerifiedSettlement() throws Exception {
    long id = completePickup();
    call("POST", "/api/payments/collect/" + id, m, null, 200);
    var bank =
        call(
            "POST",
            "/api/wallet/bank-accounts",
            m,
            Map.of(
                "bank",
                "Test Bank",
                "name",
                "Test Holder",
                "number",
                "123456789012",
                "branch",
                "Test Branch",
                "primary",
                true),
            200);
    assertFalse(bank.has("numberEncrypted"));
    String stored =
        db.queryForObject(
            "SELECT number_encrypted FROM nf_bank_accounts WHERE id=?",
            String.class,
            bank.get("id").asLong());
    assertFalse(stored.contains("123456789012"));
    var transfer =
        call(
            "POST",
            "/api/wallet/transfers",
            m,
            Map.of(
                "bankName",
                "Test Bank",
                "accountHolder",
                "Test Holder",
                "accountLastFour",
                "9012",
                "amount",
                100),
            200);
    assertEquals("PROCESSING", transfer.get("status").asText());
    long tid = Long.parseLong(transfer.get("transactionId").asText());
    assertEquals(800, call("GET", "/api/wallet", m, null, 200).get("available").asDouble());
    call(
        "PATCH",
        "/api/admin/payouts/" + tid,
        a,
        Map.of("status", "APPROVED", "verified", false),
        200);
    call(
        "PATCH",
        "/api/admin/payouts/" + tid,
        a,
        Map.of("status", "COMPLETED", "reference", "TEST-REFERENCE", "verified", false),
        409);
    call(
        "PATCH",
        "/api/admin/payouts/" + tid,
        a,
        Map.of("status", "COMPLETED", "reference", "TEST-REFERENCE", "verified", true),
        200);
    call(
        "PATCH",
        "/api/admin/payouts/" + tid,
        a,
        Map.of("status", "COMPLETED", "reference", "TEST-REFERENCE", "verified", true),
        409);
  }

  @Test
  void reviewsSupportOwnedCrudAndRejectDuplicates() throws Exception {
    long id = completePickup();
    var review =
        call("POST", "/api/reviews", c, Map.of("orderId", id, "rating", 5, "comment", "Good"), 200);
    long rid = review.get("id").asLong();
    call("POST", "/api/reviews", c, Map.of("orderId", id, "rating", 5, "comment", "Again"), 409);
    call(
        "PUT",
        "/api/reviews/" + rid,
        x,
        Map.of("orderId", id, "rating", 4, "comment", "Changed"),
        403);
    call(
        "PUT",
        "/api/reviews/" + rid,
        c,
        Map.of("orderId", id, "rating", 4, "comment", "Changed"),
        200);
    call("DELETE", "/api/reviews/" + rid, c, null, 200);
    assertEquals(0, call("GET", "/api/reviews/restaurant/" + restaurant, null, null, 200).size());
  }

  @Test
  void offersAreDatabaseBackedAndApplyServerSide() throws Exception {
    String code = "TEST-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    call(
        "POST",
        "/api/offers",
        m,
        Map.ofEntries(
            Map.entry("restaurantId", restaurant),
            Map.entry("menuItemId", item),
            Map.entry("title", "Test offer"),
            Map.entry("code", code),
            Map.entry("description", "Test fixture"),
            Map.entry("discountType", "PERCENTAGE"),
            Map.entry("discountValue", 10),
            Map.entry("startDate", "2020-01-01"),
            Map.entry("endDate", "2030-01-01"),
            Map.entry("enabled", true),
            Map.entry("published", true)),
        200);
    assertTrue(call("GET", "/api/customer/offers", null, null, 200).size() > 0);
    var body =
        Map.of(
            "restaurantId",
            restaurant,
            "type",
            "PICKUP",
            "paymentMethod",
            "CASH",
            "offerCode",
            code,
            "items",
            List.of(Map.of("menuItemId", item, "quantity", 1)));
    var response =
        mvc.perform(
                post("/api/orders")
                    .session(c)
                    .with(csrf())
                    .header("Idempotency-Key", UUID.randomUUID().toString())
                    .contentType("application/json")
                    .content(json.writeValueAsString(body)))
            .andReturn()
            .getResponse();
    assertEquals(200, response.getStatus(), response.getContentAsString());
    assertEquals(900, json.readTree(response.getContentAsString()).get("total").asDouble());
  }

  @Test
  void chargeConsentAndRefundsNeverClaimUnverifiedSettlement() throws Exception {
    long id = checkout("PICKUP");
    call("PUT", "/api/orders/" + id + "/additional-charge", m, Map.of("amount", 100), 200);
    call("POST", "/api/orders/" + id + "/additional-charge/consent", x, Map.of("amount", 100), 403);
    call("POST", "/api/orders/" + id + "/additional-charge/consent", c, Map.of("amount", 100), 200);
    call("PUT", "/api/orders/" + id + "/additional-charge", m, Map.of("amount", 200), 409);
    stage(id, "PREPARING");
    stage(id, "READY");
    stage(id, "PICKED_UP");
    call("POST", "/api/payments/collect/" + id, m, null, 200);
    var refund =
        call(
            "POST",
            "/api/refunds/" + id,
            c,
            Map.of("reason", "Test return", "message", "Test fixture"),
            200);
    long fid = refund.get("id").asLong();
    call(
        "POST",
        "/api/admin/refunds/" + fid,
        a,
        Map.of("status", "APPROVED", "verified", false),
        200);
    assertEquals("COMPLETED", orders.findById(id).orElseThrow().getPaymentStatus());
    call(
        "POST",
        "/api/admin/refunds/" + fid,
        a,
        Map.of("status", "COMPLETED", "verified", false),
        409);
    call(
        "POST",
        "/api/admin/refunds/" + fid,
        a,
        Map.of("status", "COMPLETED", "verified", true, "reference", "TEST-REFUND-REFERENCE"),
        200);
    assertEquals("REFUNDED", orders.findById(id).orElseThrow().getPaymentStatus());
  }

  @Test
  void complaintsNotificationsAndReportsUsePersistentRecords() throws Exception {
    var complaint =
        call(
            "POST",
            "/api/complaints",
            c,
            Map.of("type", "Merchant", "subject", "Test concern", "description", "Test message"),
            200);
    call(
        "POST",
        "/api/admin/complaints/" + complaint.get("id").asLong() + "/reply",
        a,
        Map.of("response", "Reviewed"),
        200);
    assertEquals(
        "RESOLVED",
        db.queryForObject(
            "SELECT status FROM nf_complaints WHERE id=?",
            String.class,
            complaint.get("id").asLong()));
    long id = completePickup();
    var report =
        result("GET", "/api/reports/sales?from=2020-01-01&to=2030-01-01", m, null, 200)
            .getResponse()
            .getContentAsString();
    assertTrue(report.startsWith("Order,Date,Type,Status,Total,Payment status"));
    assertTrue(report.contains("\"" + id + "\""));
    assertTrue(report.contains("PICKED_UP"));
    call("GET", "/api/admin/dashboard", a, null, 200);
    call("GET", "/api/admin/restaurants", a, null, 200);
    call("GET", "/api/admin/riders", a, null, 200);
    call("GET", "/api/admin/refunds", a, null, 200);
  }

  @Test
  void passwordsAndSuspensionsInvalidateOperationalAccess() throws Exception {
    call(
        "PATCH",
        "/api/driver/profile",
        r,
        Map.of("phone", Integer.toString(sequence.incrementAndGet())),
        200);
    call(
        "POST",
        "/api/driver/profile/password",
        r,
        Map.of("currentPassword", "wrong", "newPassword", "ChangedPass123!"),
        400);
    call("PATCH", "/api/admin/users/" + rider.getId(), a, Map.of("active", false), 200);
    call("GET", "/api/driver/profile", r, null, 403);
    call("GET", "/api/driver/earnings?from=2026-11-01&to=2026-11-03", r, null, 403);
  }

  @Test
  void rewardsAreReservedAndCancellationRestoresThem() throws Exception {
    for (int i = 0; i < 10; i++) completePickup();
    var body =
        Map.of(
            "restaurantId",
            restaurant,
            "type",
            "PICKUP",
            "paymentMethod",
            "CASH",
            "redeemPoints",
            true,
            "items",
            List.of(Map.of("menuItemId", item, "quantity", 1)));
    var first =
        mvc.perform(
                post("/api/orders")
                    .session(c)
                    .with(csrf())
                    .header("Idempotency-Key", UUID.randomUUID().toString())
                    .contentType("application/json")
                    .content(json.writeValueAsString(body)))
            .andReturn()
            .getResponse();
    assertEquals(200, first.getStatus(), first.getContentAsString());
    var order = json.readTree(first.getContentAsString());
    assertEquals(900, order.get("total").asDouble());
    var second =
        mvc.perform(
                post("/api/orders")
                    .session(c)
                    .with(csrf())
                    .header("Idempotency-Key", UUID.randomUUID().toString())
                    .contentType("application/json")
                    .content(json.writeValueAsString(body)))
            .andReturn()
            .getResponse();
    assertEquals(409, second.getStatus(), second.getContentAsString());
    call(
        "PATCH",
        "/api/orders/" + order.get("id").asLong() + "/status",
        c,
        Map.of("status", "CANCELLED"),
        200);
    assertEquals(
        200,
        mvc.perform(
                post("/api/orders")
                    .session(c)
                    .with(csrf())
                    .header("Idempotency-Key", UUID.randomUUID().toString())
                    .contentType("application/json")
                    .content(json.writeValueAsString(body)))
            .andReturn()
            .getResponse()
            .getStatus());
  }

  @Test
  void notificationsArePrivateAndReadStateIsPerAccount() throws Exception {
    var user = fixture("MERCHANT", false);
    var session = login(user);
    upload(session, "BUSINESS_FRONT");
    upload(session, "BUSINESS_BACK");
    call("POST", "/api/applications/submit", session, null, 200);
    long note =
        db.queryForObject(
            "SELECT id FROM nf_notifications WHERE user_id=? ORDER BY id DESC LIMIT 1",
            Long.class,
            user.getId());
    call("POST", "/api/notifications/" + note + "/read", x, null, 403);
    call("POST", "/api/notifications/" + note + "/read", a, null, 200);
    call("POST", "/api/notifications/" + note + "/read", a, null, 200);
    assertEquals(
        1,
        db.queryForObject(
            "SELECT COUNT(*) FROM nf_notification_reads WHERE notification_id=? AND user_id=?",
            Long.class,
            note,
            admin.getId()));
    assertEquals(
        0,
        db.queryForObject(
            "SELECT COUNT(*) FROM nf_notification_reads WHERE notification_id=? AND user_id=?",
            Long.class,
            note,
            user.getId()));
  }

  @Test
  void driverBankAndAvailabilityValidateActualContract() throws Exception {
    call(
        "PUT",
        "/api/driver/availability",
        r,
        Map.of("available", true, "latitude", 200, "longitude", 0),
        400);
    call("PUT", "/api/driver/availability", r, Map.of("available", false), 200);
    call("GET", "/api/driver/orders/offer", r, null, 204);
    call(
        "POST",
        "/api/driver/bank-accounts",
        r,
        Map.of(
            "bank",
            "Test Driver Bank",
            "accountHolder",
            "Test Driver",
            "accountNumber",
            "1234567890"),
        200);
    var bank = call("GET", "/api/driver/bank-accounts", r, null, 200).get(0);
    assertEquals("7890", bank.get("accountLastFour").asText());
    assertFalse(bank.has("accountNumber"));
    call(
        "POST",
        "/api/driver/payouts",
        r,
        Map.of("bankAccountId", bank.get("id").asLong(), "amount", 1),
        409);
  }

  @Test
  void vehicleChangesRequireDocumentsAndAdminReview() throws Exception {
    byte[] png =
        Base64.getDecoder()
            .decode(
                "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a9ioAAAAASUVORK5CYII=");
    var request = multipart("/api/driver/profile/vehicle-change-requests");
    request.param("registration", "WP-NEW").session(r).with(csrf());
    for (String name :
        List.of(
            "registrationDocument",
            "revenueLicence",
            "insuranceDocument",
            "frontPhoto",
            "sidePhoto",
            "backPhoto"))
      request.file(new MockMultipartFile(name, "document.png", "image/png", png));
    var response = mvc.perform(request).andReturn().getResponse();
    assertEquals(200, response.getStatus(), response.getContentAsString());
    long id = json.readTree(response.getContentAsString()).get("id").asLong();
    call(
        "PUT",
        "/api/driver/availability",
        r,
        Map.of("available", true, "latitude", 6.9, "longitude", 79.9),
        409);
    call("POST", "/api/admin/vehicle-changes/" + id + "/approve", a, null, 200);
    assertEquals("WP-NEW", accounts.findById(rider.getId()).orElseThrow().getPlate());
    call(
        "PUT",
        "/api/driver/availability",
        r,
        Map.of("available", true, "latitude", 6.9, "longitude", 79.9),
        200);
  }

  @Test
  void driverEmailChangesRequireVerifiedCode() throws Exception {
    String email = "changed" + sequence.incrementAndGet() + "@example.com";
    call("PATCH", "/api/driver/profile", r, Map.of("email", email), 200);
    assertNotEquals(email, accounts.findById(rider.getId()).orElseThrow().getEmail());
    var capture = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mail, atLeastOnce()).send(capture.capture());
    String code =
        capture.getAllValues().stream()
            .filter(message -> message.getSubject().equals("Verify Foodie email"))
            .reduce((one, two) -> two)
            .orElseThrow()
            .getText()
            .split(": ")[1]
            .split("\n")[0];
    call("POST", "/api/driver/profile/email/verify", r, Map.of("token", "bad"), 400);
    call("POST", "/api/driver/profile/email/verify", r, Map.of("token", code), 200);
    assertEquals(email, accounts.findById(rider.getId()).orElseThrow().getEmail());
  }

  @Test
  void malformedInputsAndHistoricalPricesAreProtected() throws Exception {
    var form = registration("CUSTOMER");
    form.put("email", "invalid\n@example.com");
    call("POST", "/api/auth/register/customer", null, form, 400);
    long id = checkout("PICKUP");
    call(
        "PUT",
        "/api/menu-items/" + item,
        m,
        Map.of(
            "restaurantId",
            restaurant,
            "name",
            "Changed menu",
            "category",
            "Main course",
            "price",
            2000,
            "available",
            true,
            "sizesEnabled",
            false),
        200);
    assertEquals(
        1000,
        call("GET", "/api/orders/" + id + "/items", c, null, 200)
            .get(0)
            .get("unitPrice")
            .asDouble());
    call("PATCH", "/api/orders/" + id + "/status", c, Map.of("status", "CANCELLED"), 200);
    call("PATCH", "/api/orders/" + id + "/status", m, Map.of("status", "PREPARING"), 409);
    call("DELETE", "/api/restaurants/" + restaurant, m, null, 409);
  }

  @Test
  void incompleteApplicationsCannotBeApprovedAndSuspensionIsRechecked() throws Exception {
    var pending = fixture("MERCHANT", false);
    call("POST", "/api/admin/merchants/" + pending.getId() + "/approve", a, null, 409);
    call("PATCH", "/api/admin/users/" + customer.getId(), a, Map.of("active", false), 200);
    call("GET", "/api/orders", c, null, 403);
    call("PATCH", "/api/admin/users/" + admin.getId(), a, Map.of("active", false), 409);
  }

  @Test
  void concurrentPayoutsCannotOverdrawCollectedFunds() throws Exception {
    for (int i = 0; i < 2; i++) {
      long id = completePickup();
      call("POST", "/api/payments/collect/" + id, m, null, 200);
    }
    call(
        "POST",
        "/api/wallet/bank-accounts",
        m,
        Map.of(
            "bank",
            "Concurrent Test Bank",
            "name",
            "Test Holder",
            "number",
            "12345678",
            "branch",
            "Test Branch",
            "primary",
            true),
        200);
    var start = new CountDownLatch(1);
    var pool = Executors.newFixedThreadPool(2);
    try {
      var jobs = new ArrayList<Future<Integer>>();
      for (int amount : List.of(1000, 1100)) {
        jobs.add(
            pool.submit(
                () -> {
                  start.await();
                  return mvc.perform(
                          post("/api/wallet/transfers")
                              .session(m)
                              .with(csrf())
                              .header("Idempotency-Key", UUID.randomUUID().toString())
                              .contentType("application/json")
                              .content(
                                  json.writeValueAsString(
                                      Map.of(
                                          "bankName",
                                          "Concurrent Test Bank",
                                          "accountHolder",
                                          "Test Holder",
                                          "accountLastFour",
                                          "5678",
                                          "amount",
                                          amount))))
                      .andReturn()
                      .getResponse()
                      .getStatus();
                }));
      }
      start.countDown();
      var statuses = new ArrayList<>(List.of(jobs.get(0).get(), jobs.get(1).get()));
      Collections.sort(statuses);
      assertEquals(List.of(200, 409), statuses);
      assertTrue(call("GET", "/api/wallet", m, null, 200).get("available").asDouble() >= 0);
    } finally {
      pool.shutdownNow();
    }
  }

  @Test
  void guestCheckoutUsesCatalogPricesAndScopedAccessToken() throws Exception {
    var body =
        Map.of(
            "name",
            "Guest Test",
            "email",
            "guest@example.com",
            "phone",
            "0771234567",
            "order",
            Map.of(
                "restaurantId",
                restaurant,
                "type",
                "DELIVERY",
                "deliveryAddress",
                "Guest delivery address",
                "paymentMethod",
                "CASH",
                "items",
                List.of(Map.of("menuItemId", item, "quantity", 1))));
    var response =
        mvc.perform(
                post("/api/guest/orders")
                    .with(csrf())
                    .header("Idempotency-Key", UUID.randomUUID().toString())
                    .contentType("application/json")
                    .content(json.writeValueAsString(body)))
            .andReturn()
            .getResponse();
    assertEquals(200, response.getStatus(), response.getContentAsString());
    var saved = json.readTree(response.getContentAsString());
    long id = saved.get("order").get("id").asLong();
    assertEquals(1150, saved.get("order").get("total").asDouble());
    assertFalse(saved.get("order").has("guestAccessHash"));
    assertEquals(0, saved.get("order").get("points").asInt());
    assertEquals(
        403,
        mvc.perform(get("/api/guest/orders/" + id).header("X-Guest-Token", "wrong"))
            .andReturn()
            .getResponse()
            .getStatus());
    assertEquals(
        200,
        mvc.perform(
                get("/api/guest/orders/" + id)
                    .header("X-Guest-Token", saved.get("accessToken").asText()))
            .andReturn()
            .getResponse()
            .getStatus());
    call("GET", "/api/payments", c, null, 200);
    call("GET", "/api/orders/" + id, x, null, 403);
  }

  @Test
  void customerFavoritesAndRewardsArePersistentAndPrivate() throws Exception {
    call("PUT", "/api/customer/favorites/" + restaurant, c, null, 200);
    call("PUT", "/api/customer/favorites/" + restaurant, c, null, 200);
    assertEquals(
        1,
        db.queryForObject(
            "SELECT COUNT(*) FROM nf_favorites WHERE user_id=?", Long.class, customer.getId()));
    assertEquals(0, call("GET", "/api/customer/favorites", x, null, 200).size());
    completePickup();
    assertEquals(2, call("GET", "/api/customer/rewards", c, null, 200).get("available").asInt());
    call("DELETE", "/api/customer/favorites/" + restaurant, c, null, 200);
    assertEquals(0, call("GET", "/api/customer/favorites", c, null, 200).size());
  }

  @Test
  void passwordRecoveryUsesEmailProofAndRevokesPriorSessions() throws Exception {
    var prior = login(customer);
    call("POST", "/api/auth/recovery", null, Map.of("email", customer.getEmail()), 200);
    var captured = org.mockito.ArgumentCaptor.forClass(SimpleMailMessage.class);
    verify(mail, atLeastOnce()).send(captured.capture());
    String token =
        captured.getAllValues().stream()
            .filter(message -> message.getSubject().equals("Verify Foodie email"))
            .reduce((first, last) -> last)
            .orElseThrow()
            .getText()
            .split(": ")[1]
            .split("\n")[0];
    String changed = UUID.randomUUID().toString();
    call(
        "POST",
        "/api/auth/setup-password",
        null,
        Map.of("email", customer.getEmail(), "token", token, "password", changed),
        200);
    call("GET", "/api/account", prior, null, 401);
    call(
        "POST",
        "/api/auth/login",
        null,
        Map.of("email", customer.getEmail(), "password", changed),
        200);
    call(
        "POST",
        "/api/auth/setup-password",
        null,
        Map.of("email", customer.getEmail(), "token", token, "password", changed),
        400);
  }

  void rewardPolicies() {
    for (var entry :
        java.util.Map.of(
                "reward_points_base",
                1,
                "reward_points_one",
                2,
                "reward_points_two",
                3,
                "reward_points_three",
                5)
            .entrySet())
      db.update(
          "MERGE INTO nf_business_policies(policy_key,amount) KEY(policy_key) VALUES (?,?)",
          entry.getKey(),
          entry.getValue());
  }

  @Test
  void identicalProductNamesKeepRestaurantPricesAndCloudinaryReferencesSeparate() throws Exception {
    final String image =
        "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6v8AAAAASUVORK5CYII=";
    doAnswer(
            invocation -> {
              String scope = invocation.getArgument(3);
              String publicId = scope + "/" + UUID.randomUUID();
              return new com.foodie.media.CloudinaryImages.ImageReference(
                  "https://res.cloudinary.com/test-only/image/upload/" + publicId + ".png",
                  publicId);
            })
        .when(images)
        .store(anyString(), nullable(String.class), nullable(String.class), anyString(), anyInt());
    AppUser secondMerchant = fixture("MERCHANT", true);
    MockHttpSession secondSession = login(secondMerchant);
    long secondRestaurant =
        call(
                "POST",
                "/api/restaurants",
                secondSession,
                Map.of(
                    "name",
                    "Second Kitchen " + UUID.randomUUID(),
                    "address",
                    "Test street",
                    "phone",
                    "0772345678",
                    "location",
                    "Test area",
                    "cuisine",
                    "Test cuisine",
                    "open",
                    true,
                    "delivery",
                    true,
                    "pickup",
                    true),
                200)
            .get("id")
            .asLong();
    var first =
        call(
            "POST",
            "/api/menu-items/" + item,
            m,
            Map.of(
                "restaurantId",
                restaurant,
                "name",
                "Chicken Burger",
                "category",
                "Main course",
                "price",
                1000,
                "available",
                true,
                "image",
                image,
                "sizesEnabled",
                false),
            200);
    var second =
        call(
            "POST",
            "/api/menu-items/" + UUID.randomUUID(),
            secondSession,
            Map.of(
                "restaurantId",
                secondRestaurant,
                "name",
                "Chicken Burger",
                "category",
                "Main course",
                "price",
                2000,
                "available",
                true,
                "image",
                image,
                "sizesEnabled",
                false),
            200);
    long secondItem = second.get("id").asLong();
    assertNotEquals(item, secondItem);
    assertNotEquals(first.get("imagePublicId").asText(), second.get("imagePublicId").asText());
    assertTrue(
        first
            .get("imagePublicId")
            .asText()
            .contains("restaurants/" + restaurant + "/menu/" + item + "/"));
    assertTrue(
        second
            .get("imagePublicId")
            .asText()
            .contains("restaurants/" + secondRestaurant + "/menu/" + secondItem + "/"));
    var visible = call("GET", "/api/menu-items?restaurantId=" + restaurant, null, null, 200);
    assertEquals(1, visible.size());
    assertEquals(restaurant, visible.get(0).get("restaurantId").asLong());
    assertEquals(1000, visible.get(0).get("price").asDouble());
    call(
        "POST",
        "/api/menu-items/" + secondItem,
        m,
        Map.of(
            "name",
            "Forbidden",
            "category",
            "Main course",
            "price",
            1,
            "available",
            true,
            "image",
            image),
        403);
    verify(images, times(2))
        .store(anyString(), nullable(String.class), nullable(String.class), anyString(), anyInt());
    String secondUrl = menu.findById(secondItem).orElseThrow().getImage();
    call(
        "POST",
        "/api/menu-items/" + item,
        m,
        Map.of(
            "restaurantId",
            restaurant,
            "name",
            "Chicken Burger",
            "category",
            "Main course",
            "price",
            1200,
            "available",
            true,
            "image",
            image,
            "sizesEnabled",
            false),
        200);
    assertEquals(secondUrl, menu.findById(secondItem).orElseThrow().getImage());
    assertEquals(2000, menu.findById(secondItem).orElseThrow().getPrice().intValue());
    call("GET", "/api/restaurants/" + secondRestaurant + "/menu/manage", m, null, 403);
    call("GET", "/api/restaurants/" + secondRestaurant + "/menu/manage", a, null, 200);
  }

  @Test
  void merchantCanSaveLegacyMenuWithNullImageCropAndKeepDatabaseId() throws Exception {
    var rows = call("GET", "/api/restaurants/" + restaurant + "/menu/manage", m, null, 200);
    var edit =
        json.convertValue(
            rows.get(0),
            new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>() {});
    edit.put("zoom", null);
    edit.put("focalX", null);
    edit.put("focalY", null);
    edit.put("price", 1050);
    var saved = call("POST", "/api/menu-items/" + item, m, edit, 200);
    assertEquals(item, saved.get("id").asLong());
    assertEquals(
        0,
        menu.findById(item).orElseThrow().getPrice().compareTo(new java.math.BigDecimal("1050")));
    assertEquals(restaurant, menu.findById(item).orElseThrow().getRestaurantId());
    assertNotNull(menu.findById(item).orElseThrow().getZoom());
  }

  @Test
  void guestExtraChargeNeedsMatchingPrivateTokenAndExactCurrentAmount() throws Exception {
    var checkout =
        Map.of(
            "restaurantId",
            restaurant,
            "type",
            "DELIVERY",
            "deliveryAddress",
            "Isolated guest destination",
            "paymentMethod",
            "CASH",
            "items",
            List.of(Map.of("menuItemId", item, "quantity", 1)));
    var result =
        mvc.perform(
                post("/api/guest/orders")
                    .with(csrf())
                    .header("Idempotency-Key", UUID.randomUUID().toString())
                    .contentType("application/json")
                    .content(
                        json.writeValueAsString(
                            Map.of(
                                "order",
                                checkout,
                                "name",
                                "Isolated Guest",
                                "email",
                                "charge-guest@example.test",
                                "phone",
                                "0771234567"))))
            .andReturn();
    assertEquals(200, result.getResponse().getStatus());
    var guest = json.readTree(result.getResponse().getContentAsString());
    long id = guest.get("order").get("id").asLong();
    var before = guest.get("order").get("total").decimalValue();
    String token = guest.get("accessToken").asText();
    call("PUT", "/api/orders/" + id + "/additional-charge", m, Map.of("amount", 75), 200);
    String path = "/api/guest/orders/" + id + "/additional-charge/consent";
    assertEquals(
        403,
        mvc.perform(
                post(path)
                    .with(csrf())
                    .header("X-Guest-Token", "wrong-token")
                    .contentType("application/json")
                    .content("{\"amount\":75}"))
            .andReturn()
            .getResponse()
            .getStatus());
    assertEquals(
        409,
        mvc.perform(
                post(path)
                    .with(csrf())
                    .header("X-Guest-Token", token)
                    .contentType("application/json")
                    .content("{\"amount\":74}"))
            .andReturn()
            .getResponse()
            .getStatus());
    assertEquals(
        400,
        mvc.perform(
                post(path)
                    .with(csrf())
                    .header("X-Guest-Token", token)
                    .contentType("application/json")
                    .content("{}"))
            .andReturn()
            .getResponse()
            .getStatus());
    assertEquals(
        200,
        mvc.perform(
                post(path)
                    .with(csrf())
                    .header("X-Guest-Token", token)
                    .contentType("application/json")
                    .content("{\"amount\":75}"))
            .andReturn()
            .getResponse()
            .getStatus());
    var saved = orders.findById(id).orElseThrow();
    assertTrue(saved.getCustomerAgreed());
    assertEquals(0, before.add(new java.math.BigDecimal("75")).compareTo(saved.getTotal()));
    assertEquals(
        409,
        mvc.perform(
                post(path)
                    .with(csrf())
                    .header("X-Guest-Token", token)
                    .contentType("application/json")
                    .content("{\"amount\":75}"))
            .andReturn()
            .getResponse()
            .getStatus());
  }
}
