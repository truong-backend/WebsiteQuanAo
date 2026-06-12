package com.example.fashionstore.repository.variant;

import com.example.fashionstore.module.variant.ProductVariant;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

    List<ProductVariant> findByProductId(String productId);

    boolean existsBySku(String sku);

    /** Tìm theo product + color entity + size entity */
    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.color.id = :colorId AND v.size.id = :sizeId")
    Optional<ProductVariant> findByProductAndColorAndSize(
            @Param("productId") String productId,
            @Param("colorId")   Long colorId,
            @Param("sizeId")    Long sizeId);

    /**
     * SELECT FOR UPDATE — dùng khi tạo order để tránh oversell.
     * Khoá row variant cho đến khi transaction commit.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("SELECT v FROM ProductVariant v WHERE v.id = :id")
    Optional<ProductVariant> findByIdForUpdate(@Param("id") String id);


    boolean existsByColorId(Long colorId);

    boolean existsBySizeId(Long sizeId);
}