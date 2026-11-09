package com.foodie.payment;

import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class BankCipher {
  private final String configured;

  public BankCipher(@Value("${foodie.bank-key}") String key) {
    configured = key;
  }

  public String encrypt(String number) {
    try {
      byte[] key = Base64.getDecoder().decode(configured);
      if (key.length != 32) throw new IllegalArgumentException();
      byte[] nonce = new byte[12];
      new SecureRandom().nextBytes(nonce);
      Cipher cipher = Cipher.getInstance("AES/GCM/NoPadding");
      cipher.init(
          Cipher.ENCRYPT_MODE, new SecretKeySpec(key, "AES"), new GCMParameterSpec(128, nonce));
      return Base64.getEncoder().encodeToString(nonce)
          + ":"
          + Base64.getEncoder()
              .encodeToString(
                  cipher.doFinal(number.getBytes(java.nio.charset.StandardCharsets.UTF_8)));
    } catch (Exception e) {
      throw new org.springframework.web.server.ResponseStatusException(
          org.springframework.http.HttpStatus.SERVICE_UNAVAILABLE,
          "Configure BANK_ENCRYPTION_KEY as a base64-encoded 32-byte key before saving bank"
              + " details");
    }
  }
}
