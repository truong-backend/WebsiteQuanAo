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

    /** Tìm theo product + color entity + size entity */
    @Query("SELECT v FROM ProductVariant v WHERE v.product.id = :productId AND v.color.id = :colorId AND v.size.id = :sizeId")
    Optional<ProductVariant> findByProductAndColorAndSize(
            @Param("productId") String productId,
            @Param("colorId")   Long colorId,
            @Param("sizeId")    Long sizeId);
}