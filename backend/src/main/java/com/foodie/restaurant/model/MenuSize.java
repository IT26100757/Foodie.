package com.foodie.restaurant.model;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_menu_sizes")
public class MenuSize extends DomainEntity {
  private Long itemId;

  public Long getItemId() {
    return itemId;
  }

  public void setItemId(Long value) {
    this.itemId = value;
  }

  @Column(length = 20, unique = false)
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String value) {
    this.name = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal price;

  public BigDecimal getPrice() {
    return price;
  }

  public void setPrice(BigDecimal value) {
    this.price = value;
  }

  private boolean selected;

  public boolean getSelected() {
    return selected;
  }

  public void setSelected(boolean value) {
    this.selected = value;
  }
}
