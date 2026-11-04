package com.foodie.media;

import java.net.URI;
import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;

/** Uploads new images only. Existing assets are never overwritten or deleted. */
@Service
public class CloudinaryImages {
  private final RestClient client;
  private final boolean uploadsEnabled;
  private final boolean configured;
  private final String cloudName;

  public record ImageReference(String url, String publicId) {}

  public CloudinaryImages(
      RestClient.Builder builder,
      @Value("${CLOUDINARY_URL:}") String combined,
      @Value("${CLOUDINARY_CLOUD_NAME:}") String cloud,
      @Value("${CLOUDINARY_API_KEY:}") String key,
      @Value("${CLOUDINARY_API_SECRET:}") String secret,
      @Value("${CLOUDINARY_UPLOADS_ENABLED:false}") boolean enabled) {
    try {
      if (!combined.isBlank()) {
        URI uri = URI.create(combined);
        if (!"cloudinary".equals(uri.getScheme())
            || uri.getUserInfo() == null
            || uri.getHost() == null) throw new IllegalArgumentException();
        String[] credentials = uri.getUserInfo().split(":", 2);
        if (credentials.length != 2) throw new IllegalArgumentException();
        if (cloud.isBlank()) cloud = uri.getHost();
        if (key.isBlank()) key = credentials[0];
        if (secret.isBlank()) secret = credentials[1];
      }
      if (!cloud.isBlank() && !cloud.matches("[A-Za-z0-9_-]{1,100}"))
        throw new IllegalArgumentException();
    } catch (IllegalArgumentException invalid) {
      throw new IllegalStateException("Cloudinary environment configuration is invalid");
    }
    cloudName = cloud;
    configured = !cloud.isBlank() && !key.isBlank() && !secret.isBlank();
    uploadsEnabled = enabled;
    final String apiKey = key;
    final String apiSecret = secret;
    client =
        builder
            .baseUrl("https://api.cloudinary.com/v1_1/" + cloud + "/image")
            .defaultHeaders(
                headers -> {
                  headers.setBasicAuth(apiKey, apiSecret);
                })
            .build();
  }

  public ImageReference store(
      String image, String existingUrl, String existingPublicId, String scope, int maxBytes) {
    if (Objects.equals(image, existingUrl))
      return new ImageReference(existingUrl, existingPublicId);
    if (image == null || image.isBlank()) return new ImageReference("", null);
    // An arbitrary URL/public ID must not attach another restaurant's asset.
    if (!image.startsWith("data:image/"))
      throw new IllegalArgumentException(
          "Choose an image file. Existing image URLs may only be retained on their original"
              + " record.");
    if (image.length() > ((long) maxBytes * 4 / 3) + 100)
      throw new IllegalArgumentException("Image exceeds the allowed size");
    int separator = image.indexOf(",");
    if (separator < 0
        || !image.substring(0, separator).matches("data:image/(png|jpeg|webp);base64"))
      throw new IllegalArgumentException("PNG, JPEG or WEBP image required");
    byte[] bytes;
    try {
      bytes = Base64.getDecoder().decode(image.substring(separator + 1));
    } catch (IllegalArgumentException invalid) {
      throw new IllegalArgumentException("Invalid image encoding");
    }
    if (bytes.length == 0 || bytes.length > maxBytes)
      throw new IllegalArgumentException("Image exceeds the allowed size");
    boolean png =
        bytes.length >= 8
            && (bytes[0] & 255) == 137
            && bytes[1] == 'P'
            && bytes[2] == 'N'
            && bytes[3] == 'G'
            && bytes[4] == 13
            && bytes[5] == 10
            && bytes[6] == 26
            && bytes[7] == 10;
    boolean jpeg =
        bytes.length >= 3
            && (bytes[0] & 255) == 255
            && (bytes[1] & 255) == 216
            && (bytes[2] & 255) == 255;
    boolean webp =
        bytes.length >= 12
            && bytes[0] == 'R'
            && bytes[1] == 'I'
            && bytes[2] == 'F'
            && bytes[3] == 'F'
            && bytes[8] == 'W'
            && bytes[9] == 'E'
            && bytes[10] == 'B'
            && bytes[11] == 'P';
    if (!(png && image.startsWith("data:image/png;")
        || jpeg && image.startsWith("data:image/jpeg;")
        || webp && image.startsWith("data:image/webp;")))
      throw new IllegalArgumentException("Image content does not match a supported format");
    if (!scope.matches("foodie/(restaurants/[0-9]+/(logos|banners|menu/[0-9]+)|profiles/[0-9]+)"))
      throw new IllegalArgumentException("Invalid image ownership scope");
    if (!uploadsEnabled || !configured)
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "Cloudinary uploads require owner-approved backend configuration. No image was"
              + " uploaded.");
    String publicId = scope + "/" + UUID.randomUUID();
    var form = new LinkedMultiValueMap<String, Object>();
    form.add("file", image);
    form.add("public_id", publicId);
    form.add("overwrite", "false");
    try {
      Map<?, ?> result =
          client
              .post()
              .uri("/upload")
              .contentType(MediaType.MULTIPART_FORM_DATA)
              .body(form)
              .retrieve()
              .body(Map.class);
      if (result == null
          || !publicId.equals(result.get("public_id"))
          || Boolean.TRUE.equals(result.get("existing"))
          || !(result.get("secure_url") instanceof String url)
          || !url.startsWith("https://res.cloudinary.com/" + cloudName + "/"))
        throw new IllegalStateException("Unexpected image service response");
      return new ImageReference((String) result.get("secure_url"), publicId);
    } catch (RestClientException | IllegalStateException failure) {
      throw new ResponseStatusException(
          HttpStatus.SERVICE_UNAVAILABLE,
          "Cloudinary upload failed. Existing image references were preserved.");
    }
  }
}
