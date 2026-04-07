package com.example.fashionstore.repository.variant;

import com.example.fashionstore.module.variant.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String> {

    List<ProductVariant> findByProductId(String productId);

    boolean existsBySku(String sku);

    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.colorCode = :color AND v.sizeCode = :size")
    Optional<ProductVariant> findByProductAndColorAndSize(
            @Param("productId") String productId,
            @Param("color") String colorCode,
            @Param("size") String sizeCode);
}