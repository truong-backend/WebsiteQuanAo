package com.example.fashionstore.repository.order;

import com.example.fashionstore.module.order.Order;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>,
        JpaSpecificationExecutor<Order> {

    @Query("""
        SELECT o FROM Order o
        LEFT JOIN FETCH o.items i
        LEFT JOIN FETCH i.productVariant
        LEFT JOIN FETCH o.payment
        WHERE o.id = :id
    """)
    Optional<Order> findByIdWithDetails(@Param("id") String id);

    @Query("""
        SELECT DISTINCT o FROM Order o
        LEFT JOIN FETCH o.items
        LEFT JOIN FETCH o.payment
        WHERE o.user.id = :userId
        ORDER BY o.orderTime DESC
    """)
    List<Order> findByUserIdOrderByOrderTimeDesc(@Param("userId") Integer userId);

    boolean existsByIdAndUserIdAndItemsProductVariantProductId(
            String orderId, Integer userId, String productId);

    Page<Order> findAll(Specification<Order> spec, Pageable pageable);
}