package com.example.fashionstore.repository.product;

import com.example.fashionstore.module.product.Product;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String>,
        JpaSpecificationExecutor<Product> {

    boolean existsBySlug(String slug);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants v
        LEFT JOIN FETCH v.color
        LEFT JOIN FETCH v.size
        LEFT JOIN FETCH p.category
        WHERE p.id = :id AND p.active = true
    """)
    Optional<Product> findByIdWithVariants(@Param("id") String id);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants v
        LEFT JOIN FETCH v.color
        LEFT JOIN FETCH v.size
        LEFT JOIN FETCH p.category
        WHERE p.slug = :slug AND p.active = true
    """)
    Optional<Product> findBySlugWithVariants(@Param("slug") String slug);
}