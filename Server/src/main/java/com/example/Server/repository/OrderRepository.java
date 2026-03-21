package com.example.Server.repository;

import com.example.Server.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface OrderRepository extends JpaRepository<Order, String>, JpaSpecificationExecutor<Order> {
    @Query("SELECT DISTINCT o FROM Order o LEFT JOIN FETCH o.orderItems oi LEFT JOIN FETCH oi.productVariant pv LEFT JOIN FETCH pv.product WHERE o.id = :id")
    Optional<Order> findByIdWithItems(@Param("id") String id);
    List<Order> findByAccountIdOrderByOrderTimeDesc(int accountId);
}
