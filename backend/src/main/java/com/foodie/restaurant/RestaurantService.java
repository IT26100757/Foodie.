package com.foodie.restaurant;

import com.foodie.common.Inputs;
import com.foodie.restaurant.model.*;
import com.foodie.restaurant.repository.*;
import com.foodie.user.AppUserRepository;
import com.foodie.user.UserService;
import java.math.BigDecimal;
import java.util.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class RestaurantService {
  private final RestaurantRepository restaurants;
  private final com.foodie.media.CloudinaryImages images;
  private final MenuItemRepository items;
  private final MenuSizeRepository sizes;
  private final AppUserRepository accounts;
  private final UserService users;
  private final org.springframework.jdbc.core.JdbcTemplate db;

  public RestaurantService(
      RestaurantRepository restaurants,
      MenuItemRepository items,
      MenuSizeRepository sizes,
      AppUserRepository accounts,
      UserService users,
      org.springframework.jdbc.core.JdbcTemplate db,
      com.foodie.media.CloudinaryImages images) {
    this.images = images;
    this.restaurants = restaurants;
    this.items = items;
    this.sizes = sizes;
    this.accounts = accounts;
    this.users = users;
    this.db = db;
  }

  public Restaurant get(Long id) {
    return restaurants.findById(id).orElseThrow(Inputs::missing);
  }

  public boolean published(Restaurant r) {
    return accounts.findById(r.getOwnerId()).map(u -> u.canOperate()).orElse(false);
  }

  public Restaurant own(Long id) {
    var u = users.operational("MERCHANT", "ADMIN");
    var r = get(id);
    if (!u.getRole().equals("ADMIN") && !u.getId().equals(r.getOwnerId()))
      throw new SecurityException("Restaurant ownership required");
    return r;
  }

  public List<Restaurant> list(String location, String mode, String search) {
    return restaurants.findAll().stream()
        .filter(this::published)
        .filter(
            r ->
                location == null
                    || location.isBlank()
                    || location.equalsIgnoreCase(r.getLocation()))
        .filter(r -> !"DELIVERY".equals(mode) || r.getDelivery())
        .filter(r -> !"PICKUP".equals(mode) || r.getPickup())
        .filter(
            r ->
                search == null
                    || (r.getName() + " " + r.getCuisine())
                        .toLowerCase()
                        .contains(search.toLowerCase()))
        .toList();
  }

  public List<Restaurant> mine() {
    var u = users.operational("MERCHANT", "ADMIN");
    return u.getRole().equals("ADMIN")
        ? restaurants.findAll()
        : restaurants.findByOwnerId(u.getId());
  }

  public record Settings(
      String name,
      String address,
      String phone,
      String location,
      String cuisine,
      String description,
      String logoImage,
      String bannerImage,
      boolean open,
      boolean delivery,
      boolean pickup) {}

  @Transactional
  public Restaurant save(Long id, Settings f) {
    Restaurant r;
    if (id == null) {
      var u = users.operational("MERCHANT");
      accounts.lock(u.getId()).orElseThrow();
      Inputs.require(
          restaurants.findByOwnerId(u.getId()).stream()
              .noneMatch(
                  x ->
                      x.getName().equalsIgnoreCase(f.name())
                          && Objects.equals(x.getAddress(), f.address())),
          "Restaurant already exists at this address");
      r = new Restaurant();
      r.setOwnerId(u.getId());
    } else r = own(id);
    r.setName(Inputs.text(f.name(), 150));
    r.setAddress(Inputs.text(f.address(), 500));
    r.setPhone(Inputs.text(f.phone(), 30));
    r.setLocation(Inputs.text(f.location(), 120));
    r.setCuisine(f.cuisine() == null || f.cuisine().isBlank() ? "" : Inputs.text(f.cuisine(), 120));
    r.setDescription(
        f.description() == null || f.description().isBlank()
            ? ""
            : Inputs.text(f.description(), 1000));

    r.setOpen(f.open());
    r.setDelivery(f.delivery());
    r.setPickup(f.pickup());
    restaurants.saveAndFlush(r);
    if (f.logoImage() != null) {
      var logo =
          images.store(
              f.logoImage(),
              r.getLogoImage(),
              r.getLogoPublicId(),
              "foodie/restaurants/" + r.getId() + "/logos",
              8 * 1024 * 1024);
      r.setLogoImage(logo.url());
      r.setLogoPublicId(logo.publicId());
    }
    if (f.bannerImage() != null) {
      var banner =
          images.store(
              f.bannerImage(),
              r.getBannerImage(),
              r.getBannerPublicId(),
              "foodie/restaurants/" + r.getId() + "/banners",
              8 * 1024 * 1024);
      r.setBannerImage(banner.url());
      r.setBannerPublicId(banner.publicId());
    }
    return r;
  }

  public record Size(String name, BigDecimal price, boolean selected) {}

  public record Item(
      Long restaurantId,
      String name,
      String category,
      String description,
      String image,
      BigDecimal price,
      boolean available,
      boolean sizesEnabled,
      BigDecimal zoom,
      BigDecimal focalX,
      BigDecimal focalY,
      List<Size> sizes) {}

  @Transactional
  public MenuItem saveItem(Long id, Item f) {
    own(f.restaurantId());
    MenuItem m = id == null ? new MenuItem() : items.lock(id).orElseThrow(Inputs::missing);
    if (id != null && !m.getRestaurantId().equals(f.restaurantId()))
      throw new SecurityException("Wrong restaurant");
    m.setRestaurantId(f.restaurantId());
    m.setName(Inputs.text(f.name(), 150));
    m.setCategory(Inputs.text(f.category(), 100));
    m.setDescription(
        f.description() == null || f.description().isBlank()
            ? ""
            : Inputs.text(f.description(), 1000));

    m.setPrice(Inputs.money(f.price() == null && f.sizesEnabled() ? BigDecimal.ZERO : f.price()));
    m.setAvailable(f.available());
    m.setSizesEnabled(f.sizesEnabled());
    m.setZoom(f.zoom());
    m.setFocalX(f.focalX());
    m.setFocalY(f.focalY());
    items.saveAndFlush(m);
    sizes.deleteByItemId(m.getId());
    sizes.flush();
    if (f.sizesEnabled()) {
      if (f.sizes() == null || f.sizes().isEmpty() || f.sizes().size() > 3)
        throw new IllegalArgumentException("One to three sizes required");
      Set<String> names = new HashSet<>();
      boolean selected = false;
      for (Size v : f.sizes()) {
        if (!List.of("Small", "Medium", "Large").contains(v.name()) || !names.add(v.name()))
          throw new IllegalArgumentException("Invalid or duplicate size");
        MenuSize s = new MenuSize();
        s.setItemId(m.getId());
        s.setName(v.name());
        s.setPrice(Inputs.money(v.price()));
        s.setSelected(v.selected());
        selected |= v.selected();
        sizes.save(s);
      }
      Inputs.require(selected, "Select at least one size");
    }
    if (f.image() != null) {
      var image =
          images.store(
              f.image(),
              m.getImage(),
              m.getImagePublicId(),
              "foodie/restaurants/" + m.getRestaurantId() + "/menu/" + m.getId(),
              8 * 1024 * 1024);
      m.setImage(image.url());
      m.setImagePublicId(image.publicId());
    }
    return m;
  }

  public List<Map<String, Object>> menu(Long restaurantId) {
    var visible =
        items.findAll().stream()
            .filter(item -> restaurantId == null || item.getRestaurantId().equals(restaurantId))
            .filter(item -> published(get(item.getRestaurantId())))
            .toList();
    return menuRows(visible);
  }

  public List<Map<String, Object>> managedMenu(Long restaurantId) {
    own(restaurantId);
    return menuRows(items.findByRestaurantId(restaurantId));
  }

  private List<Map<String, Object>> menuRows(List<MenuItem> records) {
    return records.stream()
        .map(
            m -> {
              Map<String, Object> row = new LinkedHashMap<>();
              row.put("id", m.getId());
              row.put("restaurantId", m.getRestaurantId());
              row.put("restaurant", get(m.getRestaurantId()).getName());
              row.put("name", m.getName());
              row.put("category", m.getCategory());
              row.put("description", m.getDescription());
              row.put("image", m.getImage());
              row.put("imagePublicId", m.getImagePublicId());
              row.put("price", m.getPrice());
              row.put("available", m.getAvailable());
              row.put("sizesEnabled", m.getSizesEnabled());
              row.put("zoom", m.getZoom());
              row.put("focalX", m.getFocalX());
              row.put("focalY", m.getFocalY());
              Map<String, Object> variants = new LinkedHashMap<>();
              for (MenuSize s : sizes.findByItemId(m.getId()))
                variants.put(
                    s.getName(), Map.of("selected", s.getSelected(), "price", s.getPrice()));
              row.put("sizes", variants);
              return row;
            })
        .toList();
  }

  @Transactional
  public void archiveItem(Long id) {
    var m = items.lock(id).orElseThrow(Inputs::missing);
    own(m.getRestaurantId());
    m.setAvailable(false);
  }

  @Transactional
  public void delete(Long id) {
    own(id);
    Inputs.require(
        db.queryForObject("SELECT COUNT(*) FROM nf_orders WHERE restaurant_id=?", Long.class, id)
            == 0,
        "Restaurant has order history; close it instead");
    for (var m : items.findByRestaurantId(id)) {
      sizes.deleteByItemId(m.getId());
      items.delete(m);
    }
    restaurants.deleteById(id);
  }

  @Transactional
  public Object browserItem(String clientId, Map<String, Object> body) {
    clientId = Inputs.text(clientId, 80);
    var existing =
        clientId.matches("[0-9]+")
            ? items.findById(Long.valueOf(clientId))
            : items.findByClientId(clientId);
    if (clientId.matches("[0-9]+") && existing.isEmpty()) throw Inputs.missing();
    Long restaurantId = null;
    if (existing.isPresent()) restaurantId = existing.get().getRestaurantId();
    else if (body.get("restaurantId") != null)
      restaurantId = Long.valueOf(body.get("restaurantId").toString());
    else {
      var owned = mine();
      if (owned.size() != 1) throw new IllegalArgumentException("Choose an owned restaurantId");
      restaurantId = owned.get(0).getId();
    }
    List<Size> variants = new ArrayList<>();
    if (body.get("sizes") instanceof Map<?, ?> variantMap)
      for (var entry : variantMap.entrySet()) {
        if (!(entry.getValue() instanceof Map<?, ?> values))
          throw new IllegalArgumentException("Invalid sizes");
        if (Boolean.TRUE.equals(values.get("selected")))
          variants.add(
              new Size(
                  entry.getKey().toString(), new BigDecimal(values.get("price").toString()), true));
      }
    boolean sized = Boolean.TRUE.equals(body.get("sizesEnabled"));
    BigDecimal price =
        body.get("price") == null || body.get("price").toString().isBlank()
            ? BigDecimal.ZERO
            : new BigDecimal(body.get("price").toString());
    var item =
        saveItem(
            existing.map(MenuItem::getId).orElse(null),
            new Item(
                restaurantId,
                (String) body.get("name"),
                (String) body.get("category"),
                (String) body.get("description"),
                (String) body.get("image"),
                price,
                Boolean.TRUE.equals(body.get("available")),
                sized,
                new BigDecimal((body.get("zoom") == null ? "1" : body.get("zoom").toString())),
                new BigDecimal((body.get("focalX") == null ? "50" : body.get("focalX").toString())),
                new BigDecimal((body.get("focalY") == null ? "50" : body.get("focalY").toString())),
                variants));
    if (!clientId.matches("[0-9]+")) item.setClientId(clientId);
    return item;
  }
}
