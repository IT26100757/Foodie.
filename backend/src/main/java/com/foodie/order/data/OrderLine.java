package com.foodie.order.data;

import com.foodie.common.DomainEntity;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.*;

@Entity
@Table(name = "nf_order_lines")
public class OrderLine extends DomainEntity {

    // Fields

    private Long orderId;

    private Long menuItemId;

    @Column(length = 150, unique = false)
    private String name;

    @Column(length = 20, unique = false)
    private String size;

    private int quantity;

    @Column(precision = 14, scale = 2)
    private BigDecimal unitPrice;

    @Column(length = 240)
    private String specialInstructions;

    // Constructors

    /** Required by JPA; service methods enforce business validation. */
    public OrderLine() {}

    /** Initialize supplied values without fixed business records or credentials. */
    public OrderLine(Long orderId, Long menuItemId, String name, int quantity, java.math.BigDecimal unitPrice) {
        setOrderId(orderId);
        setMenuItemId(menuItemId);
        setName(name);
        setQuantity(quantity);
        setUnitPrice(unitPrice);
    }

    // Getters and setters

    public Long getOrderId() {
        return orderId;
    }

    public void setOrderId(Long orderId) {
        this.orderId = orderId;
    }

    public Long getMenuItemId() {
        return menuItemId;
    }

    public void setMenuItemId(Long menuItemId) {
        this.menuItemId = menuItemId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSize() {
        return size;
    }

    public void setSize(String size) {
        this.size = size;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public String getSpecialInstructions() {
        return specialInstructions;
    }

    public void setSpecialInstructions(String specialInstructions) {
        this.specialInstructions = specialInstructions;
    }

    // Business methods

    /** Identity-only description: avoids logging personal or financial details. */
    @Override
    public String toString() {
        return "OrderLine{id=" + getId() + "}";
    }
}
