package com.foodie.config;

import com.foodie.user.AppUserRepository;
import com.foodie.user.model.AdminUser;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.*;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class AdminSetup {
  @Bean
  CommandLineRunner setup(
      AppUserRepository users,
      PasswordEncoder passwords,
      @Value("${FOODIE_ADMIN_EMAIL:}") String email,
      @Value("${FOODIE_ADMIN_PASSWORD:}") String password) {
    return args -> {
      if (email.isBlank() || users.findByEmailIgnoreCase(email).isPresent()) return;
      if (password.length() < 14
          || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
        throw new IllegalArgumentException("Admin password must be 14–72 bytes");
      var u = new AdminUser();
      u.setEmail(email.trim().toLowerCase());
      u.setPasswordHash(passwords.encode(password));
      u.setFirstName("Platform");
      u.setLastName("Admin");
      u.setActive(true);
      u.setApprovalStatus("APPROVED");
      u.setCreatedAt(java.time.Instant.now());
      users.save(u);
    };
  }
}
