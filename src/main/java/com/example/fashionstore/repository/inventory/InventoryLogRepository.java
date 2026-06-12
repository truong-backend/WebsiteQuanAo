package com.example.fashionstore.repository.inventory;

import com.example.fashionstore.module.inventory.InventoryLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryLogRepository extends JpaRepository<InventoryLog, Long> {

    Page<InventoryLog> findByVariantId(String variantId, Pageable pageable);

    /** Lịch sử kho theo product — join qua variant */
    @Query("""
        SELECT l FROM InventoryLog l
        WHERE l.variant.product.id = :productId
        ORDER BY l.createdAt DESC
    """)
    List<InventoryLog> findByProductId(@Param("productId") String productId);

    Page<InventoryLog> findAllByOrderByCreatedAtDesc(Pageable pageable);
}