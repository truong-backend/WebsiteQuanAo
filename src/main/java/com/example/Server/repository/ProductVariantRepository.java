package com.example.Server.repository;

import com.example.Server.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String>, JpaSpecificationExecutor<ProductVariant> {
    boolean existsByProduct_IdAndColor_CodeAndSize_Id(String productId, String colorCode, String sizeId);
    boolean existsByProduct_IdAndColor_CodeAndSize_IdAndIdNot(String productId, String colorCode, String sizeId, String id);
    Optional<ProductVariant> findFirstByProduct_IdOrderByIdAsc(String productId);

    @Query("""
        SELECT v FROM ProductVariant v
        WHERE v.product.id = :productId AND v.color.code = :colorCode AND v.size.id = :sizeId
    """)
    Optional<ProductVariant> findByProductAndColorAndSize(
            @Param("productId") String productId,
            @Param("colorCode") String colorCode,
            @Param("sizeId") String sizeId);
}
