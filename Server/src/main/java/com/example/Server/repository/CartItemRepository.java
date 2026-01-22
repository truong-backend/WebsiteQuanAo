package com.example.Server.repository;

import com.example.Server.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String>, JpaSpecificationExecutor<CartItem> {

    Optional<CartItem> findByCart_IdAndProductVariant_Id(String cartId, String productVariantId);

    boolean existsByCart_IdAndProductVariant_Id(String cartId, String productVariantId);
}
