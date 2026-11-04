package com.foodie.settings;

import java.math.BigDecimal;
import java.util.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@Transactional(readOnly = true)
public class BusinessPolicyService {
  private final BusinessPolicyRepository repository;

  public BusinessPolicyService(BusinessPolicyRepository repository) {
    this.repository = repository;
  }

  public BigDecimal amount(String key) {
    return repository
        .findById(key)
        .orElseThrow(
            () ->
                new ResponseStatusException(
                    HttpStatus.SERVICE_UNAVAILABLE,
                    "Administrator must configure business policy: " + key))
        .getAmount();
  }

  public Map<String, BigDecimal> list() {
    Map<String, BigDecimal> values = new LinkedHashMap<>();
    for (BusinessPolicy policy : repository.findAll())
      values.put(policy.getPolicyKey(), policy.getAmount());
    return values;
  }

  @Transactional
  public void save(Map<String, BigDecimal> values) {
    Set<String> allowed =
        Set.of(
            "delivery_fee",
            "commission_rate",
            "driver_service_rate",
            "reward_discount_rate",
            "reward_minimum_points",
            "reward_tier_one",
            "reward_tier_two",
            "reward_tier_three",
            "reward_points_base",
            "reward_points_one",
            "reward_points_two",
            "reward_points_three");
    for (var entry : values.entrySet()) {
      if (!allowed.contains(entry.getKey())
          || entry.getValue() == null
          || entry.getValue().signum() < 0
          || entry.getValue().compareTo(new BigDecimal("1000000")) > 0)
        throw new IllegalArgumentException("Invalid policy");
      if (entry.getKey().endsWith("rate") && entry.getValue().compareTo(BigDecimal.ONE) > 0)
        throw new IllegalArgumentException("Rate must be between zero and one");
      if ((entry.getKey().equals("reward_minimum_points")
              || entry.getKey().startsWith("reward_points"))
          && entry.getValue().stripTrailingZeros().scale() > 0)
        throw new IllegalArgumentException("Points must be whole numbers");
      if ((entry.getKey().equals("reward_minimum_points")
              || entry.getKey().startsWith("reward_points"))
          && entry.getValue().intValueExact() < 1)
        throw new IllegalArgumentException("Minimum points must be positive");
      BusinessPolicy policy = new BusinessPolicy();
      policy.setPolicyKey(entry.getKey());
      policy.setAmount(entry.getValue());
      repository.save(policy);
    }
  }
}
