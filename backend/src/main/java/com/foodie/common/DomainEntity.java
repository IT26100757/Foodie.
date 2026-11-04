package com.foodie.common;

import jakarta.persistence.*;

@MappedSuperclass
public abstract class DomainEntity {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Version private long version;

  public Long getId() {
    return id;
  }
}
