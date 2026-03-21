package com.example.Server.repository;

import com.example.Server.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<Cart, String>, JpaSpecificationExecutor<Cart> {
    boolean existsByAccount_Id(Integer accountId);
    boolean existsByAccount_IdAndIdNot(Integer accountId, String id);
    Optional<Cart> findByAccountId(int accountId);

    @Query("""
        SELECT c FROM Cart c
        LEFT JOIN FETCH c.cartItems ci
        LEFT JOIN FETCH ci.productVariant v
        LEFT JOIN FETCH v.product
        LEFT JOIN FETCH v.color
        LEFT JOIN FETCH v.size
        WHERE c.account.id = :accountId
    """)
    Optional<Cart> findByAccountIdWithItems(@Param("accountId") int accountId);
}
