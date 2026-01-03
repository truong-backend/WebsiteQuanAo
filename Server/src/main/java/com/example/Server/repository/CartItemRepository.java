package com.example.Server.repository;

import com.example.Server.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, String> {
    void deleteCartItemById(String id);
}