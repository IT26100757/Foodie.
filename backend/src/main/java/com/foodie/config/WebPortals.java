package com.foodie.config;

import java.nio.file.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.*;
import org.springframework.http.*;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.config.annotation.*;

/** Serves the four independent Vite builds from one Spring Boot application. */
@Controller
public class WebPortals implements WebMvcConfigurer {
  private final Path frontend;

  public WebPortals(@Value("${FOODIE_FRONTEND_ROOT:../frontend}") String root) {
    frontend = Path.of(root).toAbsolutePath().normalize();
  }

  @Override
  public void addResourceHandlers(ResourceHandlerRegistry registry) {
    registry
        .addResourceHandler("/assets/**")
        .addResourceLocations(location("customer") + "assets/");
    for (String portal : new String[] {"merchant", "driver", "admin"})
      registry.addResourceHandler("/" + portal + "/**").addResourceLocations(location(portal));
    registry.addResourceHandler("/rider-scooter-v2.png").addResourceLocations(location("driver"));
  }

  private String location(String portal) {
    return frontend.resolve(portal).resolve("build").toUri().toString() + "/";
  }

  private ResponseEntity<Resource> page(String portal) {
    Resource index = new FileSystemResource(frontend.resolve(portal).resolve("build/index.html"));
    if (!index.exists()) return ResponseEntity.status(503).build();
    return ResponseEntity.ok()
        .contentType(MediaType.TEXT_HTML)
        .cacheControl(CacheControl.noStore())
        .body(index);
  }

  @GetMapping({
    "/",
    "/login",
    "/register",
    "/home",
    "/restaurants",
    "/store/{id}",
    "/offers",
    "/cart",
    "/checkout",
    "/track-order"
  })
  public ResponseEntity<Resource> customer() {
    return page("customer");
  }

  @GetMapping({"/merchant", "/merchant/"})
  public ResponseEntity<Resource> merchant() {
    return page("merchant");
  }

  @GetMapping({"/driver", "/driver/"})
  public ResponseEntity<Resource> driver() {
    return page("driver");
  }

  @GetMapping({"/admin", "/admin/"})
  public ResponseEntity<Resource> admin() {
    return page("admin");
  }
}
