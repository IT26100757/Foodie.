package com.foodie.review;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {
  private final ReviewService service;

  public ReviewController(ReviewService service) {
    this.service = service;
  }

  @GetMapping("/restaurant/{id}")
  public Object list(@PathVariable Long id) {
    return service.list(id);
  }

  @PostMapping
  public Object create(@RequestBody ReviewService.Feedback f) {
    return service.create(f);
  }

  @PutMapping("/{id}")
  public Object edit(@PathVariable Long id, @RequestBody ReviewService.Feedback f) {
    return service.edit(id, f);
  }

  @DeleteMapping("/{id}")
  public void remove(@PathVariable Long id) {
    service.remove(id);
  }
}
