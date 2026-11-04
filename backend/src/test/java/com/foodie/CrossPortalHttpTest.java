package com.foodie;

import static org.junit.jupiter.api.Assertions.*;

import com.fasterxml.jackson.databind.*;
import com.foodie.user.AppUserRepository;
import com.foodie.user.model.*;
import java.net.*;
import java.net.http.*;
import java.time.Instant;
import java.util.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
      "spring.datasource.url=jdbc:h2:mem:crossportal;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER",
      "foodie.mail.enabled=false",
      "CLOUDINARY_UPLOADS_ENABLED=false",
      "CLOUDINARY_URL="
    })
@ActiveProfiles("test")
class CrossPortalHttpTest {
  @LocalServerPort int port;
  @Autowired ObjectMapper json;
  @Autowired AppUserRepository accounts;
  @Autowired PasswordEncoder passwords;
  @Autowired JdbcTemplate db;
  final String password = UUID.randomUUID() + "Aa1!";

  HttpClient browser() {
    return HttpClient.newBuilder()
        .cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL))
        .build();
  }

  JsonNode request(HttpClient browser, String method, String path, Object body, int expected)
      throws Exception {
    HttpRequest.Builder builder =
        HttpRequest.newBuilder(URI.create("http://localhost:" + port + path));
    if (!method.equals("GET")) {
      JsonNode csrf = request(browser, "GET", "/api/csrf", null, 200);
      builder.header(csrf.get("headerName").asText(), csrf.get("token").asText());
    }
    if (body != null) builder.header("Content-Type", "application/json");
    if (path.equals("/api/orders") && method.equals("POST"))
      builder.header("Idempotency-Key", UUID.randomUUID().toString());
    HttpResponse<String> response =
        browser.send(
            builder
                .method(
                    method,
                    body == null
                        ? HttpRequest.BodyPublishers.noBody()
                        : HttpRequest.BodyPublishers.ofString(json.writeValueAsString(body)))
                .build(),
            HttpResponse.BodyHandlers.ofString());
    assertEquals(expected, response.statusCode(), path + " " + response.body());
    return response.body().isBlank() ? json.nullNode() : json.readTree(response.body());
  }

  AppUser fixture(AppUser account) {
    String id = UUID.randomUUID().toString();
    account.setEmail(id + "@example.test");
    account.setFirstName("HTTP");
    account.setLastName(account.getRole());
    account.setPasswordHash(passwords.encode(password));
    account.setActive(true);
    account.setApprovalStatus(account.requiresApproval() ? "PENDING" : "APPROVED");
    account.setSubmitted(true);
    account.setEmailVerified(true);
    account.setCreatedAt(Instant.now());
    account.setAddress1("Isolated test address");
    accounts.saveAndFlush(account);
    return account;
  }

  HttpClient login(AppUser account) throws Exception {
    HttpClient browser = browser();
    request(
        browser,
        "POST",
        "/api/auth/login",
        Map.of("email", account.getEmail(), "password", password),
        200);
    return browser;
  }

  @BeforeEach
  void policies() {
    rewardPolicies();
    for (var e :
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
            .entrySet())
      db.update(
          "MERGE INTO nf_business_policies(policy_key,amount) KEY(policy_key) VALUES (?,?)",
          e.getKey(),
          new java.math.BigDecimal(e.getValue()));
  }

  @Test
  void sameDatabaseOrderMovesThroughCustomerMerchantDriverAndAdmin() throws Exception {
    AppUser customer = fixture(new CustomerUser()),
        merchant = fixture(new MerchantUser()),
        driver = fixture(new RiderUser()),
        admin = fixture(new AdminUser());
    HttpClient c = login(customer), m = login(merchant), r = login(driver), a = login(admin);
    request(m, "GET", "/api/restaurants/mine", null, 403);
    assertEquals(
        "PENDING",
        request(m, "GET", "/api/applications", null, 200).get("approvalStatus").asText());
    request(a, "POST", "/api/admin/merchants/" + merchant.getId() + "/approve", null, 200);
    request(a, "POST", "/api/admin/riders/" + driver.getId() + "/approve", null, 200);
    long restaurant =
        request(
                m,
                "POST",
                "/api/restaurants",
                Map.of(
                    "name",
                    "HTTP Kitchen " + UUID.randomUUID(),
                    "address",
                    "Test street",
                    "phone",
                    "0771234567",
                    "location",
                    "Test area",
                    "cuisine",
                    "Sri Lankan",
                    "description",
                    "Isolated HTTP fixture",
                    "open",
                    true,
                    "delivery",
                    true,
                    "pickup",
                    true),
                200)
            .get("id")
            .asLong();
    long item =
        request(
                m,
                "POST",
                "/api/menu-items",
                Map.of(
                    "restaurantId",
                    restaurant,
                    "name",
                    "HTTP meal",
                    "category",
                    "Main course",
                    "description",
                    "Isolated fixture",
                    "price",
                    1000,
                    "available",
                    true,
                    "sizesEnabled",
                    false),
                200)
            .get("id")
            .asLong();
    Map<String, Object> checkout =
        Map.of(
            "restaurantId",
            restaurant,
            "type",
            "DELIVERY",
            "deliveryAddress",
            "Test destination",
            "paymentMethod",
            "CASH",
            "items",
            List.of(Map.of("menuItemId", item, "quantity", 2)));
    long before = db.queryForObject("SELECT COUNT(*) FROM nf_orders", Long.class);
    JsonNode quote = request(c, "POST", "/api/guest/orders/quote", checkout, 200);
    assertEquals(2150, quote.get("total").asDouble());
    assertEquals(before, db.queryForObject("SELECT COUNT(*) FROM nf_orders", Long.class));
    long id = request(c, "POST", "/api/orders", checkout, 200).get("id").asLong();
    assertTrue(request(m, "GET", "/api/orders", null, 200).toString().contains("\"id\":" + id));
    request(m, "PATCH", "/api/orders/" + id + "/status", Map.of("status", "PREPARING"), 200);
    assertEquals(
        "PREPARING",
        request(c, "GET", "/api/orders/" + id + "/tracking", null, 200)
            .get("order")
            .get("status")
            .asText());
    request(m, "PATCH", "/api/orders/" + id + "/status", Map.of("status", "READY"), 200);
    request(
        r,
        "PUT",
        "/api/driver/availability",
        Map.of("available", true, "latitude", 6.9, "longitude", 79.8),
        200);
    assertEquals(id, request(r, "GET", "/api/driver/orders/offer", null, 200).get("id").asLong());
    request(r, "POST", "/api/driver/orders/" + id + "/accept", null, 200);
    request(r, "POST", "/api/driver/orders/" + id + "/pickup", null, 200);
    assertEquals(
        "ON_DELIVERY",
        request(c, "GET", "/api/orders/" + id + "/tracking", null, 200)
            .get("order")
            .get("status")
            .asText());
    request(r, "POST", "/api/driver/orders/" + id + "/complete", null, 200);
    assertEquals(
        "DELIVERED",
        request(c, "GET", "/api/orders/" + id + "/tracking", null, 200)
            .get("order")
            .get("status")
            .asText());
    assertEquals(
        "PENDING",
        db.queryForObject("SELECT payment_status FROM nf_orders WHERE id=?", String.class, id));
    long reviewId =
        request(
                c,
                "POST",
                "/api/reviews",
                Map.of("orderId", id, "rating", 5, "comment", "Verified HTTP delivery review"),
                200)
            .get("id")
            .asLong();
    assertEquals(
        5, db.queryForObject("SELECT rating FROM nf_reviews WHERE id=?", Integer.class, reviewId));
    HttpClient stranger = login(fixture(new CustomerUser()));
    request(
        stranger,
        "PUT",
        "/api/reviews/" + reviewId,
        Map.of("orderId", id, "rating", 1, "comment", "Not allowed"),
        403);
    request(a, "PATCH", "/api/admin/users/" + customer.getId(), Map.of("active", false), 200);
    request(c, "GET", "/api/orders", null, 403);
    request(a, "PATCH", "/api/admin/users/" + customer.getId(), Map.of("active", true), 200);
    request(c, "GET", "/api/orders", null, 200);
    assertEquals(
        0,
        db.queryForObject(
            "SELECT COUNT(*) FROM nf_notifications WHERE email_status='SENT'", Integer.class));
    JsonNode oversight = request(a, "GET", "/api/admin/orders", null, 200);
    assertTrue(oversight.toString().contains("DELIVERED"));
    request(c, "GET", "/api/admin/users", null, 403);
    request(c, "POST", "/api/driver/orders/" + id + "/complete", null, 403);
  }

  @Test
  void policyChangesRequireAdminAndPersistInDatabase() throws Exception {
    HttpClient c = login(fixture(new CustomerUser())), a = login(fixture(new AdminUser()));
    request(c, "PUT", "/api/admin/policies", Map.of("delivery_fee", 200), 403);
    request(a, "PUT", "/api/admin/policies", Map.of("delivery_fee", 200), 200);
    request(a, "PUT", "/api/admin/policies", Map.of("reward_points_base", 1.5), 400);
    request(a, "PUT", "/api/admin/policies", Map.of("commission_rate", 1.1), 400);
    assertEquals(
        200,
        request(browser(), "GET", "/api/customer/policies", null, 200)
            .get("delivery_fee")
            .asDouble());
  }

  @Test
  void unsafeRequestsWithoutCsrfAreRejected() throws Exception {
    HttpResponse<String> response =
        browser()
            .send(
                HttpRequest.newBuilder(URI.create("http://localhost:" + port + "/api/auth/login"))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString("{}"))
                    .build(),
                HttpResponse.BodyHandlers.ofString());
    assertEquals(403, response.statusCode());
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
}
