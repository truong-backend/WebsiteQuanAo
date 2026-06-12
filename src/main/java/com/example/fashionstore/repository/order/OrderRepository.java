package com.example.fashionstore.repository.order;

import com.example.fashionstore.module.order.Order;
import com.example.fashionstore.module.order.Order.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    /** Tìm các đơn hàng DELIVERED hoặc COMPLETED của user có chứa sản phẩm đó */
    @Query("""
        SELECT DISTINCT o FROM Order o
        JOIN o.items i
        WHERE o.user.id = :userId
        AND i.productVariant.product.id = :productId
        AND o.status IN ('DELIVERED', 'COMPLETED')
        ORDER BY o.orderTime DESC
    """)
    List<Order> findReviewableOrdersByUserAndProduct(
            @Param("userId")    Integer userId,
            @Param("productId") String  productId
    );

    // ── Dashboard queries ─────────────────────────────────────────────

    /** Tổng doanh thu từ các đơn COMPLETED */
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.status IN ('COMPLETED', 'DELIVERED')
    """)
    BigDecimal sumTotalRevenue();

    /** Doanh thu trong khoảng thời gian */
    @Query("""
        SELECT COALESCE(SUM(o.totalAmount), 0)
        FROM Order o
        WHERE o.status IN ('COMPLETED', 'DELIVERED')
        AND o.orderTime BETWEEN :from AND :to
    """)
    BigDecimal sumRevenueInRange(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    /** Số đơn trong khoảng thời gian */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.orderTime BETWEEN :from AND :to")
    long countCreatedBetween(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    /** Số đơn theo trạng thái */
    @Query("SELECT COUNT(o) FROM Order o WHERE o.status = :status")
    long countByStatus(@Param("status") OrderStatus status);

    /**
     * Doanh thu theo ngày — trả về [date_str, revenue, count]
     * Dùng DATE_FORMAT cho MySQL
     */
    @Query(value = """
        SELECT DATE_FORMAT(o.order_time, '%Y-%m-%d') AS day,
               COALESCE(SUM(o.total_amount), 0),
               COUNT(o.id)
        FROM orders o
        WHERE o.status IN ('COMPLETED','DELIVERED')
        AND o.order_time BETWEEN :from AND :to
        GROUP BY day
        ORDER BY day
    """, nativeQuery = true)
    List<Object[]> revenueByDay(
            @Param("from") LocalDateTime from,
            @Param("to")   LocalDateTime to
    );

    /**
     * Top sản phẩm bán chạy — trả về [productId, productName, mainImage, totalSold, totalRevenue]
     */
    @Query(value = """
        SELECT p.id, p.name, p.main_image,
               SUM(oi.quantity) AS total_sold,
               SUM(oi.unit_price * oi.quantity) AS total_revenue
        FROM order_items oi
        JOIN product_variants pv ON oi.product_variant_id = pv.id
        JOIN products p ON pv.product_id = p.id
        JOIN orders o ON oi.order_id = o.id
        WHERE o.status IN ('COMPLETED','DELIVERED')
        GROUP BY p.id, p.name, p.main_image
        ORDER BY total_sold DESC
        LIMIT :limit
    """, nativeQuery = true)
    List<Object[]> topProductsBySold(@Param("limit") int limit);
}