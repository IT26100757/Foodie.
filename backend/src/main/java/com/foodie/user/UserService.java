package com.foodie.user;

import com.foodie.common.Inputs;
import com.foodie.notification.NotificationService;
import com.foodie.restaurant.model.Restaurant;
import com.foodie.restaurant.repository.RestaurantRepository;
import com.foodie.user.document.*;
import com.foodie.user.model.*;
import java.security.*;
import java.time.*;
import java.util.*;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UserService {
  private final org.springframework.security.core.session.SessionRegistry sessions;
  private final AppUserRepository users;
  private final RestaurantRepository restaurants;
  private final DocumentRepository documents;
  private final PasswordEncoder passwords;
  private final NotificationService notes;
  private final com.foodie.media.CloudinaryImages images;

  @org.springframework.beans.factory.annotation.Value(
      "${FOODIE_CUSTOMER_URL:http://localhost:5174}")
  private String customerUrl;

  @org.springframework.beans.factory.annotation.Value(
      "${FOODIE_MERCHANT_URL:http://localhost:5173}")
  private String merchantUrl;

  @org.springframework.beans.factory.annotation.Value("${FOODIE_DRIVER_URL:http://localhost:5175}")
  private String driverUrl;

  @org.springframework.beans.factory.annotation.Value("${FOODIE_ADMIN_URL:http://localhost:5176}")
  private String adminUrl;

  public UserService(
      AppUserRepository users,
      RestaurantRepository restaurants,
      DocumentRepository documents,
      PasswordEncoder passwords,
      NotificationService notes,
      org.springframework.security.core.session.SessionRegistry sessions,
      com.foodie.media.CloudinaryImages images) {
    this.images = images;
    this.sessions = sessions;
    this.users = users;
    this.restaurants = restaurants;
    this.documents = documents;
    this.passwords = passwords;
    this.notes = notes;
  }

  public AppUser current() {
    var a = SecurityContextHolder.getContext().getAuthentication();
    if (a == null || !a.isAuthenticated() || a.getName().equals("anonymousUser"))
      throw new SecurityException("Sign in required");
    var u = users.findByEmailIgnoreCase(a.getName()).orElseThrow(Inputs::missing);
    if (!u.getActive()) throw new SecurityException("Account suspended");
    return u;
  }

  public AppUser operational(String... roles) {
    var u = current();
    if (!Arrays.asList(roles).contains(u.getRole()) || !u.canOperate())
      throw new SecurityException("Role or approval does not permit this operation");
    return u;
  }

  public record Registration(
      String firstName,
      String lastName,
      String nationalId,
      String email,
      String phone,
      String address1,
      String address2,
      String address3,
      String password,
      String confirmPassword,
      boolean terms,
      String restaurantName,
      String restaurantAddress,
      String restaurantPhone) {}

  @Transactional
  public AppUser register(String role, Registration form) {
    AppUser u =
        switch (role) {
          case "CUSTOMER" -> new CustomerUser();
          case "MERCHANT" -> new MerchantUser();
          case "RIDER" -> new RiderUser();
          default -> throw new IllegalArgumentException("Public role unavailable");
        };
    u.setFirstName(Inputs.text(form.firstName(), 80));
    u.setLastName(Inputs.text(form.lastName(), 80));
    String nic = Inputs.text(form.nationalId(), 20).toUpperCase(Locale.ROOT);
    if (!nic.matches("(?:[0-9]{9}[VX]|[0-9]{12})"))
      throw new IllegalArgumentException("Invalid NIC");
    u.setNationalId(nic);
    String email = Inputs.text(form.email(), 150).toLowerCase(Locale.ROOT);
    if (!email.matches("[^\\s@]+@[^\\s@]+[.][^\\s@]+"))
      throw new IllegalArgumentException("Invalid email");
    u.setEmail(email);
    String phone =
        Inputs.text(role.equals("MERCHANT") ? form.restaurantPhone() : form.phone(), 30)
            .replaceAll("[^0-9]", "");
    if (phone.startsWith("94")) phone = phone.substring(2);
    if (phone.startsWith("0")) phone = phone.substring(1);
    if (!phone.matches("[0-9]{9}"))
      throw new IllegalArgumentException("Sri Lankan phone must contain nine digits after +94");
    u.setPhone(phone);
    if (users.findByEmailIgnoreCase(email).isPresent()
        || users.findByPhone(phone).isPresent()
        || users.existsByNationalId(nic))
      throw new IllegalStateException("Email, phone or NIC already registered");
    String password = form.password();
    if (password == null) throw new IllegalArgumentException("Password required");
    if (password.length() < 8
        || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72
        || !password.equals(form.confirmPassword()))
      throw new IllegalArgumentException("Matching passwords of 8–72 bytes required");
    if (role.equals("CUSTOMER")) {
      if (!form.terms()) throw new IllegalArgumentException("Terms acceptance required");
      u.setAddress1(Inputs.text(form.address1(), 255));
      u.setAddress2(Inputs.text(form.address2(), 255));
      u.setAddress3(Inputs.text(form.address3(), 255));
    }
    u.setPasswordHash(passwords.encode(password));
    u.setActive(true);
    u.setApprovalStatus(u.requiresApproval() ? "PENDING" : "APPROVED");
    u.setCreatedAt(Instant.now());
    users.saveAndFlush(u);
    if (role.equals("MERCHANT")) {
      Restaurant r = new Restaurant();
      r.setOwnerId(u.getId());
      r.setName(Inputs.text(form.restaurantName(), 150));
      r.setAddress(Inputs.text(form.restaurantAddress(), 500));
      r.setLocation(form.restaurantAddress());
      r.setPhone(Inputs.text(form.restaurantPhone(), 30));
      r.setCuisine("");
      r.setDescription("");
      r.setDelivery(true);
      r.setPickup(true);
      restaurants.save(r);
    }
    return u;
  }

  public record Profile(
      String name,
      String email,
      String phone,
      String address1,
      String address2,
      String address3,
      String city,
      String postalCode) {}

  @Transactional
  public AppUser profile(Profile f) {
    var u = users.lock(current().getId()).orElseThrow();
    String name = Inputs.text(f.name(), 161);
    String[] parts = name.split(" ", 2);
    u.setFirstName(Inputs.text(parts[0], 80));
    u.setLastName(parts.length > 1 ? Inputs.text(parts[1], 80) : "");
    if (f.email() != null && !f.email().equalsIgnoreCase(u.getEmail()))
      throw new IllegalArgumentException("Email changes require a separately verified address");
    if (f.phone() != null) {
      String digits = f.phone().replaceAll("[^0-9]", "");
      if (digits.startsWith("94")) digits = digits.substring(2);
      if (digits.startsWith("0")) digits = digits.substring(1);
      if (!digits.matches("[0-9]{9}")) throw new IllegalArgumentException("Valid phone required");
      u.setPhone(digits);
    }
    u.setAddress1(Inputs.text(f.address1(), 255));
    u.setAddress2(f.address2());
    u.setAddress3(f.address3());
    u.setCity(f.city());
    u.setPostalCode(f.postalCode());
    return u;
  }

  @Transactional
  public void password(String old, String fresh) {
    var u = users.lock(current().getId()).orElseThrow();
    if (old == null || !passwords.matches(old, u.getPasswordHash()))
      throw new IllegalArgumentException("Current password does not match");
    if (fresh == null
        || fresh.length() < 8
        || fresh.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new IllegalArgumentException("Password must contain 8–72 bytes");
    u.setPasswordHash(passwords.encode(fresh));
    expireSessions(u.getEmail());
  }

  public record DriverRegistration(
      String firstName,
      String lastName,
      String nationalId,
      String licenseNumber,
      java.time.LocalDate birthDate,
      String email,
      String phone,
      String address1,
      String address2,
      String address3,
      String registration) {}

  @Transactional
  public AppUser driverRegistration(DriverRegistration f) {
    if (f.birthDate() == null
        || !f.birthDate().isBefore(java.time.LocalDate.now())
        || f.birthDate().isBefore(java.time.LocalDate.now().minusYears(120)))
      throw new IllegalArgumentException("Valid date of birth required");
    String unavailablePassword = java.util.UUID.randomUUID().toString();
    var u =
        (RiderUser)
            register(
                "RIDER",
                new Registration(
                    f.firstName(),
                    f.lastName(),
                    f.nationalId(),
                    f.email(),
                    f.phone(),
                    f.address1(),
                    f.address2(),
                    f.address3(),
                    unavailablePassword,
                    unavailablePassword,
                    false,
                    null,
                    null,
                    null));
    u.setLicenseNumber(Inputs.text(f.licenseNumber(), 255));
    u.setBirthDate(f.birthDate());
    u.setAddress1(Inputs.text(f.address1(), 255));
    u.setAddress2(f.address2());
    u.setAddress3(f.address3());
    u.setPlate(Inputs.text(f.registration(), 40));
    u.setVehicle("MOTOR_VEHICLE");
    byte[] entropy = new byte[32];
    new java.security.SecureRandom().nextBytes(entropy);
    String token = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(entropy);
    u.setVerificationHash(digest(token));
    u.setVerificationExpires(java.time.Instant.now().plusSeconds(1800));
    notes.queue(
        u.getId(),
        u.getEmail(),
        "Verify Foodie email",
        "Account setup code (valid 30 minutes): "
            + token
            + "\nContinue: "
            + accountLink(u, token, false),
        "Delivery Riders");
    return u;
  }

  @Transactional
  public void setupPassword(String email, String token, String password) {
    var u =
        users
            .findByEmailIgnoreCase(email == null ? "" : email)
            .orElseThrow(() -> new IllegalArgumentException("Invalid or expired code"));
    u = users.lock(u.getId()).orElseThrow();
    if (token == null
        || u.getVerificationHash() == null
        || u.getVerificationExpires() == null
        || !u.getVerificationExpires().isAfter(java.time.Instant.now())
        || !java.security.MessageDigest.isEqual(
            u.getVerificationHash().getBytes(), digest(token).getBytes()))
      throw new IllegalArgumentException("Invalid or expired code");
    if (password == null
        || password.length() < 8
        || password.getBytes(java.nio.charset.StandardCharsets.UTF_8).length > 72)
      throw new IllegalArgumentException("Password must contain 8–72 bytes");
    u.setPasswordHash(passwords.encode(password));
    expireSessions(u.getEmail());
    u.setEmailVerified(true);
    u.setVerificationHash(null);
    u.setVerificationExpires(null);
  }

  @Transactional
  public Object driverProfile(java.util.Map<String, String> f) {
    var u = current();
    if (!u.getRole().equals("RIDER")) throw new SecurityException("Driver account required");
    if (f.size() != 1) throw new IllegalArgumentException("Change one field at a time");
    u = users.lock(u.getId()).orElseThrow();
    if (f.containsKey("phone")) {
      String phone = Inputs.text(f.get("phone"), 30).replaceAll("[^0-9]", "");
      if (phone.startsWith("94")) phone = phone.substring(2);
      if (phone.startsWith("0")) phone = phone.substring(1);
      if (!phone.matches("[0-9]{9}")) throw new IllegalArgumentException("Valid phone required");
      u.setPhone(phone);
    } else if (f.containsKey("address")) u.setAddress1(Inputs.text(f.get("address"), 255));
    else if (f.containsKey("email")) {
      String email = Inputs.text(f.get("email"), 150).toLowerCase(java.util.Locale.ROOT);
      if (!email.matches("[^\\s@]+@[^\\s@]+[.][^\\s@]+")
          || users.findByEmailIgnoreCase(email).isPresent())
        throw new IllegalArgumentException("Email invalid or already registered");
      var rider = (RiderUser) u;
      byte[] entropy = new byte[32];
      new java.security.SecureRandom().nextBytes(entropy);
      String token = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(entropy);
      rider.setPendingEmail(email);
      rider.setPendingEmailHash(digest(token));
      rider.setPendingEmailExpires(java.time.Instant.now().plusSeconds(1800));
      notes.queue(
          u.getId(),
          email,
          "Verify Foodie email",
          "Email change code (valid 30 minutes): "
              + token
              + "\nContinue: "
              + accountLink(u, token, true),
          "Delivery Riders");
    } else throw new IllegalArgumentException("Unsupported profile field");
    return u;
  }

  public java.util.List<AppUser> accounts() {
    operational("ADMIN");
    return users.findAll();
  }

  @Transactional
  public void active(Long id, boolean active) {
    var admin = operational("ADMIN");
    if (admin.getId().equals(id)) throw new IllegalStateException("Cannot suspend yourself");
    var u = users.lock(id).orElseThrow(Inputs::missing);
    u.setActive(active);
  }

  public String digest(String token) {
    try {
      return HexFormat.of()
          .formatHex(
              MessageDigest.getInstance("SHA-256")
                  .digest(token.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    } catch (NoSuchAlgorithmException e) {
      throw new IllegalStateException(e);
    }
  }

  @Transactional
  public void verification() {
    var u = users.lock(current().getId()).orElseThrow();
    if (u.getEmailVerified()) throw new IllegalStateException("Email already verified");
    byte[] entropy = new byte[32];
    new SecureRandom().nextBytes(entropy);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(entropy);
    u.setVerificationHash(digest(token));
    u.setVerificationExpires(Instant.now().plusSeconds(1800));
    notes.queue(
        u.getId(),
        u.getEmail(),
        "Verify Foodie email",
        "Verification code (valid 30 minutes): " + token,
        "Applications");
  }

  @Transactional
  public void verify(String token) {
    var u = users.lock(current().getId()).orElseThrow();
    if (token == null
        || u.getVerificationHash() == null
        || u.getVerificationExpires() == null
        || !u.getVerificationExpires().isAfter(Instant.now())
        || !MessageDigest.isEqual(u.getVerificationHash().getBytes(), digest(token).getBytes()))
      throw new IllegalArgumentException("Invalid or expired code");
    u.setEmailVerified(true);
    u.setVerificationHash(null);
    u.setVerificationExpires(null);
  }

  @Transactional
  public void onboarding(String area, String vehicle, String plate) {
    var u = current();
    if (!u.getRole().equals("RIDER")
        || u.getSubmitted()
        || !u.getApprovalStatus().equals("PENDING"))
      throw new IllegalStateException("Onboarding unavailable");
    u = users.lock(u.getId()).orElseThrow();
    u.setArea(Inputs.text(area, 120));
    if (!List.of("BICYCLE", "MOTORCYCLE", "CAR").contains(vehicle))
      throw new IllegalArgumentException("Invalid vehicle");
    u.setVehicle(vehicle);
    u.setPlate(vehicle.equals("BICYCLE") ? "" : Inputs.text(plate, 40));
  }

  @Transactional
  public void upload(String kind, MultipartFile file) throws java.io.IOException {
    var u = users.lock(current().getId()).orElseThrow();
    if (!u.requiresApproval() || u.getSubmitted() || !u.getApprovalStatus().equals("PENDING"))
      throw new IllegalStateException("Document upload unavailable");
    if (!List.of(
                "BUSINESS_FRONT",
                "BUSINESS_BACK",
                "IDENTITY",
                "LICENSE",
                "REGISTRATION",
                "INSURANCE",
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
                "VEHICLE_SIDE")
            .contains(kind)
        || file.isEmpty()
        || file.getSize() > 5 * 1024 * 1024) throw new IllegalArgumentException("Invalid document");
    byte[] b = file.getBytes();
    String media =
        b.length > 4 && b[0] == '%' && b[1] == 'P' && b[2] == 'D' && b[3] == 'F'
            ? "application/pdf"
            : b.length > 3 && (b[0] & 255) == 255 && (b[1] & 255) == 216
                ? "image/jpeg"
                : b.length > 8 && (b[0] & 255) == 137 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G'
                    ? "image/png"
                    : null;
    if (media == null || kind.startsWith("VEHICLE_") && !media.startsWith("image/"))
      throw new IllegalArgumentException(
          "PDF, PNG or JPEG required; vehicle photos must be images");
    var d = documents.findByUserIdAndKind(u.getId(), kind).orElseGet(Document::new);
    d.setUserId(u.getId());
    d.setKind(kind);
    d.setMediaType(media);
    d.setContent(b);
    documents.save(d);
  }

  public Document document(Long id) {
    var u = current();
    var d = documents.findById(id).orElseThrow(Inputs::missing);
    if (!u.getRole().equals("ADMIN") && !u.getId().equals(d.getUserId()))
      throw new SecurityException("Private document");
    return d;
  }

  @Transactional
  public void submit() {
    var u = users.lock(current().getId()).orElseThrow();
    Inputs.require(
        u.requiresApproval() && !u.getSubmitted() && u.getApprovalStatus().equals("PENDING"),
        "Application unavailable");
    var kinds = documents.findByUserId(u.getId()).stream().map(Document::getKind).toList();
    if (u.getRole().equals("MERCHANT"))
      Inputs.require(
          kinds.containsAll(List.of("BUSINESS_FRONT", "BUSINESS_BACK")),
          "Business registration front and back required");
    else {
      Inputs.require(
          u.getEmailVerified() && u.getVehicle() != null, "Verify email and complete onboarding");
      Inputs.require(
          kinds.containsAll(
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
                  "VEHICLE_SIDE")),
          "Upload both sides of identity, licence, registration, revenue and insurance documents,"
              + " plus front/back/side vehicle photos");
    }
    u.setSubmitted(true);
    notes.queue(
        u.getId(),
        u.getEmail(),
        "Foodie application submitted",
        "Your application is pending Admin review.",
        u.getRole().equals("RIDER") ? "Delivery Riders" : "Restaurants");
  }

  @Transactional
  public void decision(Long id, boolean approve, String reason) {
    operational("ADMIN");
    var u = users.lock(id).orElseThrow(Inputs::missing);
    Inputs.require(
        u.requiresApproval() && u.getSubmitted() && u.getApprovalStatus().equals("PENDING"),
        "Only submitted pending applications can be reviewed");
    u.setApprovalStatus(approve ? "APPROVED" : "REJECTED");
    if (u.getRole().equals("MERCHANT"))
      for (var restaurant : restaurants.findByOwnerId(u.getId())) restaurant.setOpen(approve);
    notes.queue(
        u.getId(),
        u.getEmail(),
        "Foodie application " + u.getApprovalStatus().toLowerCase(),
        "Application "
            + u.getApprovalStatus().toLowerCase()
            + (reason == null ? "" : ". Reason: " + Inputs.text(reason, 500)),
        u.getRole().equals("RIDER") ? "Delivery Riders" : "Restaurants");
  }

  @Transactional
  public void verifyEmailChange(String token) {
    var current = current();
    var u = users.lock(current.getId()).orElseThrow();
    if (token == null
        || u.getPendingEmailHash() == null
        || u.getPendingEmailExpires() == null
        || !u.getPendingEmailExpires().isAfter(java.time.Instant.now())
        || !java.security.MessageDigest.isEqual(
            u.getPendingEmailHash().getBytes(), digest(token).getBytes()))
      throw new IllegalArgumentException("Invalid or expired code");
    expireSessions(u.getEmail());
    u.setEmail(u.getPendingEmail());
    u.setPendingEmail(null);
    u.setPendingEmailHash(null);
    u.setPendingEmailExpires(null);
  }

  public Object documents(Long userId) {
    var u = current();
    if (!u.getId().equals(userId) && !u.getRole().equals("ADMIN"))
      throw new SecurityException("Private documents");
    return documents.findByUserId(userId).stream()
        .map(
            d ->
                java.util.Map.of(
                    "id",
                    d.getId(),
                    "name",
                    d.getKind(),
                    "url",
                    "/api/applications/documents/" + d.getId(),
                    "size",
                    d.getContent().length))
        .toList();
  }

  @Transactional
  public void recovery(String email) {
    if (email == null) return;
    var found = users.findByEmailIgnoreCase(email.trim());
    if (found.isEmpty()) return;
    var u = users.lock(found.get().getId()).orElseThrow();
    if (!u.getActive()
        || u.getVerificationExpires() != null
            && u.getVerificationExpires().isAfter(java.time.Instant.now().plusSeconds(1770)))
      return;
    byte[] bytes = new byte[32];
    new java.security.SecureRandom().nextBytes(bytes);
    String token = java.util.Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    u.setVerificationHash(digest(token));
    u.setVerificationExpires(java.time.Instant.now().plusSeconds(1800));
    notes.queue(
        u.getId(),
        u.getEmail(),
        "Verify Foodie email",
        "Password recovery code (valid 30 minutes): "
            + token
            + "\nContinue: "
            + accountLink(u, token, false),
        "Account");
  }

  private void expireSessions(String email) {
    for (Object principal : sessions.getAllPrincipals())
      if (principal instanceof org.springframework.security.core.userdetails.UserDetails details
          && details.getUsername().equalsIgnoreCase(email))
        for (var session : sessions.getAllSessions(principal, false)) session.expireNow();
  }

  @Transactional
  public void photo(String photo) {
    var account = users.lock(current().getId()).orElseThrow();
    var image =
        images.store(
            photo,
            account.getPhoto(),
            account.getPhotoPublicId(),
            "foodie/profiles/" + account.getId(),
            (int) (1.5 * 1024 * 1024));
    account.setPhoto(image.url());
    account.setPhotoPublicId(image.publicId());
  }

  public Object applicationRestaurant() {
    var account = current();
    if (!account.getRole().equals("MERCHANT")) throw new SecurityException("Merchant required");
    return restaurants.findByOwnerId(account.getId()).stream()
        .findFirst()
        .orElseThrow(Inputs::missing);
  }

  @Transactional
  public void requestEmailChange(String email, String password) {
    var account = users.lock(current().getId()).orElseThrow();
    if (password == null || !passwords.matches(password, account.getPasswordHash()))
      throw new IllegalArgumentException("Current password required");
    email = Inputs.text(email, 150).toLowerCase(Locale.ROOT);
    if (!email.matches("[^ @]+@[^ @]+[.][^ @]+") || users.findByEmailIgnoreCase(email).isPresent())
      throw new IllegalArgumentException("Email invalid or already registered");
    byte[] entropy = new byte[32];
    new SecureRandom().nextBytes(entropy);
    String token = Base64.getUrlEncoder().withoutPadding().encodeToString(entropy);
    account.setPendingEmail(email);
    account.setPendingEmailHash(digest(token));
    account.setPendingEmailExpires(Instant.now().plusSeconds(1800));
    notes.queue(
        account.getId(),
        email,
        "Verify Foodie email",
        "Email change code (valid 30 minutes): "
            + token
            + "\nContinue: "
            + accountLink(account, token, true),
        "Account");
  }

  private String accountLink(AppUser account, String token, boolean emailChange) {
    String base =
        switch (account.getRole()) {
          case "RIDER" -> driverUrl;
          case "MERCHANT" -> merchantUrl;
          case "ADMIN" -> adminUrl;
          default -> customerUrl;
        };
    return base
        + "/?"
        + (emailChange ? "emailToken=" : "setupToken=")
        + token
        + "&email="
        + java.net.URLEncoder.encode(account.getEmail(), java.nio.charset.StandardCharsets.UTF_8);
  }
}
