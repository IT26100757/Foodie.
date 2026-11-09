package com.foodie.user.controller;

import com.foodie.user.UserService;
import java.util.Map;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
  private final UserService users;

  public ApplicationController(UserService users) {
    this.users = users;
  }

  @GetMapping("/restaurant")
  public Object restaurant() {
    return users.applicationRestaurant();
  }

  @GetMapping
  public Object status() {
    return users.current();
  }

  @PostMapping("/verification")
  public Object send() {
    users.verification();
    return Map.of(
        "message", "Verification request recorded. SMTP delivery requires configured credentials.");
  }

  @PostMapping("/verify")
  public void verify(@RequestBody Map<String, String> p) {
    users.verify(p.get("token"));
  }

  @PutMapping
  public void draft(@RequestBody Map<String, String> p) {
    users.onboarding(p.get("area"), p.get("vehicle"), p.get("plate"));
  }

  @PostMapping("/submit")
  public void submit() {
    users.submit();
  }

  @PostMapping("/documents/{kind}")
  public void upload(@PathVariable String kind, @RequestParam("file") MultipartFile file)
      throws Exception {
    users.upload(kind, file);
  }

  @GetMapping("/documents")
  public Object documents() {
    return users.documents(users.current().getId());
  }

  @GetMapping("/documents/{id}")
  public ResponseEntity<byte[]> download(@PathVariable Long id) {
    var d = users.document(id);
    return ResponseEntity.ok()
        .header("X-Content-Type-Options", "nosniff")
        .header("Content-Disposition", "attachment; filename=document-" + id)
        .contentType(MediaType.parseMediaType(d.getMediaType()))
        .body(d.getContent());
  }
}
