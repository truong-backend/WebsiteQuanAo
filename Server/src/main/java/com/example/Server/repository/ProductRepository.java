package com.example.Server.repository;

import com.example.Server.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, String>, JpaSpecificationExecutor<Product> {
    Optional<Product> findByPath(String path);
    boolean existsByPath(String path);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants v
        LEFT JOIN FETCH v.color
        LEFT JOIN FETCH v.size
        LEFT JOIN FETCH p.parentCategory
        WHERE p.id = :id
    """)
    Optional<Product> findByIdWithVariants(@Param("id") String id);

    @Query("""
        SELECT DISTINCT p FROM Product p
        LEFT JOIN FETCH p.variants v
        LEFT JOIN FETCH v.color
        LEFT JOIN FETCH v.size
        LEFT JOIN FETCH p.parentCategory
        WHERE p.path = :path
    """)
    Optional<Product> findByPathWithVariants(@Param("path") String path);
}
