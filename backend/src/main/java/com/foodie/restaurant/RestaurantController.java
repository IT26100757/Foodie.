package com.foodie.restaurant;

import org.springframework.web.bind.annotation.*;

@RestController
public class RestaurantController {
  private final RestaurantService service;

  public RestaurantController(RestaurantService service) {
    this.service = service;
  }

  @GetMapping("/api/restaurants")
  public Object list(
      @RequestParam(required = false) String location,
      @RequestParam(required = false) String type,
      @RequestParam(required = false) String q) {
    return service.list(location, type, q);
  }

  @GetMapping("/api/restaurants/mine")
  public Object mine() {
    return service.mine();
  }

  @GetMapping("/api/restaurants/{id}")
  public Object get(@PathVariable Long id) {
    var r = service.get(id);
    if (!service.published(r)) throw com.foodie.common.Inputs.missing();
    return r;
  }

  @PostMapping("/api/restaurants")
  public Object create(@RequestBody RestaurantService.Settings p) {
    return service.save(null, p);
  }

  @PutMapping("/api/restaurants/{id}")
  public Object update(@PathVariable Long id, @RequestBody RestaurantService.Settings p) {
    return service.save(id, p);
  }

  @DeleteMapping("/api/restaurants/{id}")
  public void delete(@PathVariable Long id) {
    service.delete(id);
  }

  @GetMapping("/api/restaurants/{id}/menu/manage")
  public Object managedMenu(@PathVariable Long id) {
    return service.managedMenu(id);
  }

  @GetMapping("/api/menu-items")
  public Object menu(@RequestParam(required = false) Long restaurantId) {
    return service.menu(restaurantId);
  }

  @PostMapping("/api/menu-items")
  public Object add(@RequestBody RestaurantService.Item p) {
    return service.saveItem(null, p);
  }

  @PutMapping("/api/menu-items/{id}")
  public Object edit(@PathVariable Long id, @RequestBody RestaurantService.Item p) {
    return service.saveItem(id, p);
  }

  @DeleteMapping("/api/menu-items/{id}")
  public void archive(@PathVariable Long id) {
    service.archiveItem(id);
  }

  @PostMapping("/api/menu-items/{id}")
  public Object browserItem(@PathVariable String id, @RequestBody java.util.Map<String, Object> p) {
    return service.browserItem(id, p);
  }
}
