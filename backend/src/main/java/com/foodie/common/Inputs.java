package com.foodie.common;

import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

public final class Inputs {
  private Inputs() {}

  public static String text(String s, int limit) {
    if (s == null || s.isBlank() || s.trim().length() > limit)
      throw new IllegalArgumentException("Required text, maximum " + limit + " characters");
    return s.trim();
  }

  public static BigDecimal money(BigDecimal n) {
    if (n == null || n.signum() < 0 || n.scale() > 2 || n.compareTo(new BigDecimal("10000000")) > 0)
      throw new IllegalArgumentException("Invalid money amount");
    return n;
  }

  public static void require(boolean condition, String message) {
    if (!condition) throw new IllegalStateException(message);
  }

  public static ResponseStatusException missing() {
    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Record not found");
  }
}
