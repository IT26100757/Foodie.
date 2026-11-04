package com.foodie;

import static org.junit.jupiter.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(
    webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
    properties = {
      "spring.datasource.url=jdbc:h2:mem:httpnewfoodie;MODE=MySQL;DB_CLOSE_DELAY=-1;NON_KEYWORDS=USER",
      "foodie.mail.enabled=false",
      "CLOUDINARY_UPLOADS_ENABLED=false",
      "CLOUDINARY_URL="
    })
@ActiveProfiles("test")
class HttpStartupTest {
  @Autowired TestRestTemplate http;

  @Test
  void actualTomcatServesPublicContractsAndProtectsPrivateOnes() {
    for (String endpoint :
        new String[] {"/api/restaurants", "/api/menu-items", "/api/customer/offers"}) {
      var response = http.getForEntity(endpoint, String.class);
      assertEquals(200, response.getStatusCode().value());
      assertEquals("[]", response.getBody());
    }
    assertEquals(401, http.getForEntity("/api/admin/test", String.class).getStatusCode().value());
    assertEquals(
        401, http.getForEntity("/api/driver/profile", String.class).getStatusCode().value());
    var login = http.getForEntity("/login", String.class);
    assertEquals(200, login.getStatusCode().value());
    assertTrue(login.getBody().contains("<html"));
  }

  @Test
  void oneServerServesOriginalBuildsAndCustomerDeepLinks() {
    for (String route :
        new String[] {
          "/",
          "/login",
          "/store/1",
          "/checkout",
          "/track-order",
          "/merchant/",
          "/driver/",
          "/admin/"
        }) {
      var response = http.getForEntity(route, String.class);
      assertEquals(200, response.getStatusCode().value(), route);
      assertTrue(response.getBody().contains("<html"), route);
      var assets =
          java.util.regex.Pattern.compile("(?:src|href)=\"([^\"]+\\.(?:js|css))\"")
              .matcher(response.getBody());
      while (assets.find()) {
        var asset = http.getForEntity(assets.group(1), String.class);
        assertEquals(200, asset.getStatusCode().value(), route + " " + assets.group(1));
        assertFalse(
            asset.getBody().contains("<!doctype html>"), "Asset must not be an SPA fallback");
      }
    }
  }
}
