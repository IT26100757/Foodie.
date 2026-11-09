package com.foodie.user.controller;

import com.foodie.user.UserService;
import jakarta.servlet.http.*;
import java.util.Map;
import org.springframework.security.authentication.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

@RestController
public class AuthController {
  private final org.springframework.security.core.session.SessionRegistry sessions;
  private final UserService users;
  private final AuthenticationManager authentication;
  private final com.foodie.user.AppUserRepository accounts;

  public AuthController(
      UserService users,
      AuthenticationManager authentication,
      com.foodie.user.AppUserRepository accounts,
      org.springframework.security.core.session.SessionRegistry sessions) {
    this.sessions = sessions;
    this.users = users;
    this.authentication = authentication;
    this.accounts = accounts;
  }

  public record Login(String email, String password) {}

  @GetMapping("/api/csrf")
  public Object csrf(CsrfToken token) {
    return Map.of(
        "token",
        token.getToken(),
        "headerName",
        token.getHeaderName(),
        "parameterName",
        token.getParameterName());
  }

  @PostMapping("/api/auth/register/{role}")
  public Object register(@PathVariable String role, @RequestBody UserService.Registration r) {
    return users.register(role.toUpperCase(), r);
  }

  @PostMapping("/api/merchants/register")
  public Object merchant(@RequestBody UserService.Registration r) {
    return users.register("MERCHANT", r);
  }

  @PostMapping("/api/auth/login")
  public Object login(
      @RequestBody Login form, HttpServletRequest request, HttpServletResponse response) {
    var auth =
        authentication.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(form.email(), form.password()));
    request.getSession();
    request.changeSessionId();
    sessions.registerNewSession(request.getSession().getId(), auth.getPrincipal());
    new org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository()
        .saveToken(null, request, response);
    var context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(auth);
    SecurityContextHolder.setContext(context);
    new HttpSessionSecurityContextRepository().saveContext(context, request, response);
    return users.current();
  }

  @GetMapping("/api/account")
  public Object account() {
    return users.current();
  }

  @PutMapping("/api/account")
  public Object profile(@RequestBody UserService.Profile form) {
    return users.profile(form);
  }

  @PostMapping("/api/driver/auth/login")
  public Object driverLogin(
      @RequestBody Login form, HttpServletRequest request, HttpServletResponse response) {
    var auth =
        authentication.authenticate(
            UsernamePasswordAuthenticationToken.unauthenticated(form.email(), form.password()));
    var user = accounts.findByEmailIgnoreCase(auth.getName()).orElseThrow();
    if (!user.getRole().equals("RIDER") || !user.canOperate())
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.FORBIDDEN,
          "Driver account is pending approval, rejected or disabled");
    request.getSession();
    request.changeSessionId();
    sessions.registerNewSession(request.getSession().getId(), auth.getPrincipal());
    new org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository()
        .saveToken(null, request, response);
    var context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(auth);
    SecurityContextHolder.setContext(context);
    new HttpSessionSecurityContextRepository().saveContext(context, request, response);
    return Map.of("driver", user);
  }

  @PostMapping("/api/driver/applications")
  public Object driverApplication(
      @RequestBody UserService.DriverRegistration p,
      HttpServletRequest request,
      HttpServletResponse response) {
    var account = users.driverRegistration(p);
    var authentication =
        UsernamePasswordAuthenticationToken.authenticated(
            account.getEmail(),
            null,
            java.util.List.of(
                new org.springframework.security.core.authority.SimpleGrantedAuthority(
                    "ROLE_RIDER")));
    request.getSession();
    request.changeSessionId();
    sessions.registerNewSession(request.getSession().getId(), authentication.getPrincipal());
    new org.springframework.security.web.csrf.HttpSessionCsrfTokenRepository()
        .saveToken(null, request, response);
    var context = SecurityContextHolder.createEmptyContext();
    context.setAuthentication(authentication);
    SecurityContextHolder.setContext(context);
    new HttpSessionSecurityContextRepository().saveContext(context, request, response);
    return account;
  }

  @PostMapping("/api/auth/setup-password")
  public void setup(@RequestBody Map<String, String> p) {
    users.setupPassword(p.get("email"), p.get("token"), p.get("password"));
  }

  @PatchMapping("/api/driver/profile")
  public Object driverProfile(@RequestBody Map<String, String> p) {
    return users.driverProfile(p);
  }

  @PostMapping({"/api/driver/profile/password", "/api/account/password"})
  public void password(@RequestBody Map<String, String> p, HttpServletRequest request) {
    users.password(p.get("currentPassword"), p.get("newPassword"));
    if (request.getSession(false) != null) request.getSession().invalidate();
    SecurityContextHolder.clearContext();
  }

  @PostMapping({"/api/driver/profile/email/verify", "/api/account/email/verify"})
  public void emailChange(@RequestBody Map<String, String> p, HttpServletRequest request) {
    users.verifyEmailChange(p.get("token"));
    if (request.getSession(false) != null) request.getSession().invalidate();
    SecurityContextHolder.clearContext();
  }

  @PostMapping("/api/auth/recovery")
  public Object recovery(@RequestBody Map<String, String> p) {
    users.recovery(p.get("email"));
    return Map.of(
        "message",
        "If the account is eligible, recovery instructions will be sent when email is configured.");
  }

  @PutMapping("/api/account/photo")
  public void photo(@RequestBody Map<String, String> value) {
    users.photo(value.get("photo"));
  }

  @PostMapping("/api/auth/logout")
  public void logout(HttpServletRequest request) {
    if (request.getSession(false) != null) request.getSession().invalidate();
    SecurityContextHolder.clearContext();
  }

  @PostMapping("/api/account/email")
  public void emailChange(@RequestBody Map<String, String> value) {
    users.requestEmailChange(value.get("email"), value.get("password"));
  }
}
