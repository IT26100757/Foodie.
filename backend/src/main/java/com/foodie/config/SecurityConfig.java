package com.foodie.config;

import com.foodie.user.AppUserRepository;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.*;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {
  @Bean
  PasswordEncoder passwords() {
    return new BCryptPasswordEncoder();
  }

  @Bean
  UserDetailsService details(AppUserRepository users) {
    return name -> {
      var u =
          users
              .findByEmailIgnoreCase(name)
              .or(() -> users.findByPhone(name.replaceAll("[^0-9]", "")))
              .orElseThrow(() -> new UsernameNotFoundException("Invalid credentials"));
      return User.withUsername(u.getEmail())
          .password(u.getPasswordHash())
          .roles(u.getRole())
          .disabled(!u.getActive())
          .build();
    };
  }

  @Bean
  AuthenticationManager authenticationManager(AuthenticationConfiguration c) throws Exception {
    return c.getAuthenticationManager();
  }

  @Bean
  org.springframework.security.core.session.SessionRegistry sessions() {
    return new org.springframework.security.core.session.SessionRegistryImpl();
  }

  @Bean
  org.springframework.security.web.session.HttpSessionEventPublisher sessionEvents() {
    return new org.springframework.security.web.session.HttpSessionEventPublisher();
  }

  @Bean
  SecurityFilterChain chain(
      HttpSecurity http, org.springframework.security.core.session.SessionRegistry sessions)
      throws Exception {
    org.springframework.security.web.util.matcher.RequestMatcher sameOrigin =
        request -> {
          String origin = request.getHeader("Origin");
          String expected =
              request.getScheme()
                  + "://"
                  + request.getServerName()
                  + ((request.getServerPort() == 80 || request.getServerPort() == 443)
                      ? ""
                      : ":" + request.getServerPort());
          return origin != null && origin.equals(expected);
        };
    return http.sessionManagement(
            s ->
                s.maximumSessions(-1)
                    .sessionRegistry(sessions)
                    .expiredSessionStrategy(
                        event -> event.getResponse().sendError(401, "Session expired")))
        .csrf(c -> c.ignoringRequestMatchers(sameOrigin))
        .authorizeHttpRequests(
            a ->
                a.requestMatchers(
                        "/login",
                        "/error",
                        "/api/csrf",
                        "/api/auth/login",
                        "/api/driver/auth/login",
                        "/api/driver/applications",
                        "/api/auth/setup-password",
                        "/api/auth/recovery",
                        "/api/guest/orders",
                        "/api/guest/orders/quote",
                        "/api/guest/orders/*",
                        "/api/guest/orders/*/additional-charge/consent",
                        "/api/auth/register/**",
                        "/api/merchants/register",
                        "/",
                        "/home",
                        "/register",
                        "/restaurants",
                        "/store/**",
                        "/offers",
                        "/cart",
                        "/checkout",
                        "/track-order",
                        "/assets/**",
                        "/driver",
                        "/driver/**",
                        "/rider-scooter-v2.png",
                        "/merchant",
                        "/merchant/**",
                        "/admin",
                        "/admin/**")
                    .permitAll()
                    .requestMatchers(
                        org.springframework.http.HttpMethod.GET,
                        "/api/restaurants",
                        "/api/menu-items",
                        "/api/customer/offers",
                        "/api/customer/policies",
                        "/api/restaurants/*",
                        "/api/reviews/restaurant/**")
                    .permitAll()
                    .requestMatchers("/api/admin/**")
                    .hasRole("ADMIN")
                    .anyRequest()
                    .authenticated())
        .formLogin(f -> f.loginPage("/login").permitAll())
        .exceptionHandling(
            e ->
                e.defaultAuthenticationEntryPointFor(
                    (request, response, error) -> response.sendError(401),
                    new org.springframework.security.web.util.matcher.AntPathRequestMatcher(
                        "/api/**")))
        .build();
  }
}
