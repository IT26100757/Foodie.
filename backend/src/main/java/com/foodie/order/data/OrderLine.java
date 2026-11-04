package com.foodie.order.data;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_order_lines")
public class OrderLine extends DomainEntity {
  private Long orderId;

  public Long getOrderId() {
    return orderId;
  }

  public void setOrderId(Long value) {
    this.orderId = value;
  }

  private Long menuItemId;

  public Long getMenuItemId() {
    return menuItemId;
  }

  public void setMenuItemId(Long value) {
    this.menuItemId = value;
  }

  @Column(length = 150, unique = false)
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String value) {
    this.name = value;
  }

  @Column(length = 20, unique = false)
  private String size;

  public String getSize() {
    return size;
  }

  public void setSize(String value) {
    this.size = value;
  }

  private int quantity;

  public int getQuantity() {
    return quantity;
  }

  public void setQuantity(int value) {
    this.quantity = value;
  }

  @Column(precision = 14, scale = 2)
  private BigDecimal unitPrice;

  public BigDecimal getUnitPrice() {
    return unitPrice;
  }

  public void setUnitPrice(BigDecimal value) {
    this.unitPrice = value;
  }

  @Column(length = 240)
  private String specialInstructions;

  public String getSpecialInstructions() {
    return specialInstructions;
  }

  public void setSpecialInstructions(String instructions) {
    this.specialInstructions = instructions;
  }
}
