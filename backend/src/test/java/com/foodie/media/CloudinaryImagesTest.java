package com.foodie.media;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;

import org.junit.jupiter.api.Test;
import org.springframework.http.*;
import org.springframework.mock.http.client.MockClientHttpRequest;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.web.client.RestClient;
import org.springframework.web.server.ResponseStatusException;

class CloudinaryImagesTest {
  static final String PNG =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j6v8AAAAASUVORK5CYII=";

  @Test
  void uploadUsesServerCredentialsUniqueOwnershipIdAndNeverOverwrites() {
    var builder = RestClient.builder();
    var server = MockRestServiceServer.bindTo(builder).build();
    server
        .expect(requestTo("https://api.cloudinary.com/v1_1/test-cloud/image/upload"))
        .andExpect(method(HttpMethod.POST))
        .andExpect(content().contentTypeCompatibleWith(MediaType.MULTIPART_FORM_DATA))
        .andRespond(
            request -> {
              String body = ((MockClientHttpRequest) request).getBodyAsString();
              assertFalse(body.contains("test-secret"));
              assertTrue(body.contains("name=\"overwrite\""));
              assertTrue(body.contains("false"));
              var matcher =
                  java.util.regex.Pattern.compile("foodie/restaurants/11/menu/22/[a-f0-9-]{36}")
                      .matcher(body);
              assertTrue(matcher.find());
              String id = matcher.group();
              return withSuccess(
                      "{\"secure_url\":\"https://res.cloudinary.com/test-cloud/image/upload/"
                          + id
                          + ".png\",\"public_id\":\""
                          + id
                          + "\"}",
                      MediaType.APPLICATION_JSON)
                  .createResponse(request);
            });
    var service = new CloudinaryImages(builder, "", "test-cloud", "test-key", "test-secret", true);
    var result = service.store(PNG, null, null, "foodie/restaurants/11/menu/22", 1024);
    assertTrue(result.publicId().startsWith("foodie/restaurants/11/menu/22/"));
    assertTrue(result.url().contains(result.publicId()));
    server.verify();
  }

  @Test
  void unchangedLegacyReferencesNeedNoCloudWriteAndCannotBeAttachedToAnotherRecord() {
    var builder = RestClient.builder();
    var server = MockRestServiceServer.bindTo(builder).build();
    var service = new CloudinaryImages(builder, "", "test-cloud", "test-key", "test-secret", false);
    String url = "https://res.cloudinary.com/test-cloud/image/upload/legacy.png";
    assertEquals(url, service.store(url, url, null, "foodie/restaurants/1/logos", 1024).url());
    assertThrows(
        IllegalArgumentException.class,
        () -> service.store(url, null, null, "foodie/restaurants/2/logos", 1024));
    server.verify();
  }

  @Test
  void disabledUploadsAndInvalidFilesNeverContactCloudinary() {
    var builder = RestClient.builder();
    var server = MockRestServiceServer.bindTo(builder).build();
    var service = new CloudinaryImages(builder, "", "test-cloud", "test-key", "test-secret", false);
    assertThrows(
        ResponseStatusException.class,
        () -> service.store(PNG, null, null, "foodie/profiles/1", 1024));
    assertThrows(
        IllegalArgumentException.class,
        () ->
            service.store("data:image/png;base64,SGVsbG8=", null, null, "foodie/profiles/1", 1024));
    server.verify();
  }
}
