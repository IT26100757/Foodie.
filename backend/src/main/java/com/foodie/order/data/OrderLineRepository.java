package com.foodie.order.data;

import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderLineRepository extends JpaRepository<OrderLine, Long> {
    java.util.List<OrderLine> findByOrderId(Long orderId);

    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select x from OrderLine x where x.id=:id")
    java.util.Optional<OrderLine> lock(
            @org.springframework.data.repository.query.Param("id") Long id);
}
