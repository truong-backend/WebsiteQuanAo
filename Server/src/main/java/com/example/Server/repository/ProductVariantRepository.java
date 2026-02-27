package com.example.Server.repository;

import com.example.Server.entity.ProductVariant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface ProductVariantRepository extends JpaRepository<ProductVariant, String>, JpaSpecificationExecutor<ProductVariant> {

    boolean existsByProduct_IdAndColor_CodeAndSize_Id(String productId, String colorCode, String sizeId);

    boolean existsByProduct_IdAndColor_CodeAndSize_IdAndIdNot(String productId, String colorCode, String sizeId, String id);

    /** Lấy variant đầu tiên của sản phẩm (theo id) để tạo OrderItem khi client chỉ gửi productId. */
    java.util.Optional<ProductVariant> findFirstByProduct_IdOrderByIdAsc(String productId);
}
