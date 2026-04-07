package com.example.fashionstore.repository.cart;

import com.example.fashionstore.module.cart.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, Long> {

    @Query("""
        SELECT c FROM Cart c
        LEFT JOIN FETCH c.items i
        LEFT JOIN FETCH i.variant v
        LEFT JOIN FETCH v.product p
        LEFT JOIN FETCH p.category
        WHERE c.user.id = :userId
    """)
    Optional<Cart> findByUserIdWithItems(@Param("userId") Integer userId);

    Optional<Cart> findByUserId(Integer userId);
}