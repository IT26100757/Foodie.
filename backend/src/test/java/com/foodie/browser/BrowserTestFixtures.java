package com.foodie.browser;

import com.foodie.restaurant.model.*;
import com.foodie.restaurant.repository.*;
import com.foodie.user.AppUserRepository;
import com.foodie.user.model.*;
import java.math.BigDecimal;
import java.time.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.core.env.Environment;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
@Profile("browser-test")
public class BrowserTestFixtures {
  @Bean
  CommandLineRunner isolatedFixtures(
      Environment environment,
      AppUserRepository users,
      PasswordEncoder passwords,
      RestaurantRepository restaurants,
      MenuItemRepository menu,
      JdbcTemplate database) {
    return args -> {
      if (!environment.getRequiredProperty("spring.datasource.url").startsWith("jdbc:h2:mem:"))
        throw new IllegalStateException(
            "Browser fixtures require the explicit isolated test database");
      String password = environment.getRequiredProperty("FOODIE_TEST_PASSWORD");
      AppUser[] fixtures = {
        new CustomerUser(), new MerchantUser(), new RiderUser(), new AdminUser()
      };
      int index = 0;
      for (AppUser user : fixtures) {
        String role = user.getRole().equals("RIDER") ? "driver" : user.getRole().toLowerCase();
        if (users.findByEmailIgnoreCase("integration-" + role + "@example.test").isPresent())
          continue;
        user.setEmail("integration-" + role + "@example.test");
        user.setFirstName("Integration");
        user.setLastName(role);
        user.setNationalId("20000000123" + index++);
        user.setPhone("77123456" + index);
        user.setAddress1("Isolated test address");
        user.setAddress2("Test street");
        user.setAddress3("Test city");
        user.setCity("Test city");
        user.setPostalCode("00000");
        user.setCreatedAt(Instant.now());
        user.setActive(true);
        user.setEmailVerified(true);
        user.setSubmitted(true);
        user.setApprovalStatus("APPROVED");
        user.setPasswordHash(passwords.encode(password));
        if (user instanceof RiderUser rider) {
          rider.setVehicle("MOTORCYCLE");
          rider.setPlate("TEST-DRIVER");
          rider.setLicenseNumber("TEST-LICENSE");
          rider.setBirthDate(LocalDate.of(2000, 1, 1));
          rider.setOnline(true);
          rider.setLatitude(6.9);
          rider.setLongitude(79.8);
        }
        users.saveAndFlush(user);
        if (user instanceof MerchantUser) {
          Restaurant restaurant = new Restaurant();
          restaurant.setOwnerId(user.getId());
          restaurant.setName("Integration Kitchen");
          restaurant.setAddress("Isolated test street");
          restaurant.setPhone("0771234567");
          restaurant.setLocation("Test city");
          restaurant.setCuisine("Test cuisine");
          restaurant.setDescription("Isolated browser test fixture");
          restaurant.setOpen(true);
          restaurant.setDelivery(true);
          restaurant.setPickup(true);
          restaurants.saveAndFlush(restaurant);
          MenuItem item = new MenuItem();
          item.setRestaurantId(restaurant.getId());
          item.setName("Integration Meal");
          item.setDescription("Isolated browser test fixture");
          item.setCategory("Main course");
          item.setPrice(new BigDecimal("1000"));
          item.setAvailable(true);
          item.setSizesEnabled(false);
          menu.save(item);
        }
      }
      for (var entry :
          java.util.Map.of(
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
        database.update(
            "MERGE INTO nf_business_policies(policy_key,amount) KEY(policy_key) VALUES (?,?)",
            entry.getKey(),
            new BigDecimal(entry.getValue()));
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
        database.update(
            "MERGE INTO nf_business_policies(policy_key,amount) KEY(policy_key) VALUES (?,?)",
            entry.getKey(),
            entry.getValue());
    };
  }

  public static void main(String[] ignored) {
    String password = System.getenv("FOODIE_TEST_PASSWORD");
    if (password == null || password.length() < 14)
      throw new IllegalStateException(
          "Set FOODIE_TEST_PASSWORD to a private test password of at least 14 characters");
    byte[] key = new byte[32];
    new java.security.SecureRandom().nextBytes(key);
    org.springframework.boot.SpringApplication.run(
        com.foodie.FoodieApplication.class,
        "--server.port=18081",
        "--spring.profiles.active=browser-test",
        "--spring.datasource.url=jdbc:h2:mem:foodie_browser_test;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER",
        "--spring.datasource.driver-class-name=org.h2.Driver",
        "--spring.datasource.username=sa",
        "--spring.datasource.password=",
        "--spring.flyway.enabled=true",
        "--foodie.mail.enabled=false",
        "--CLOUDINARY_UPLOADS_ENABLED=false",
        "--CLOUDINARY_URL=",
        "--CLOUDINARY_CLOUD_NAME=",
        "--CLOUDINARY_API_KEY=",
        "--CLOUDINARY_API_SECRET=",
        "--FOODIE_ADMIN_EMAIL=",
        "--FOODIE_ADMIN_PASSWORD=",
        "--foodie.bank-key=" + java.util.Base64.getEncoder().encodeToString(key));
  }
}
