package com.example.Server.repository;

import com.example.Server.entity.Cart;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface CartRepository extends JpaRepository<Cart, String>, JpaSpecificationExecutor<Cart> {

    boolean existsByAccount_Id(Integer accountId);

    boolean existsByAccount_IdAndIdNot(Integer accountId, String id);
}
