package com.example.fashionstore.repository.review;

import com.example.fashionstore.module.review.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Integer> {

    Page<Review> findByProductIdAndApprovedTrue(String productId, Pageable pageable);

    Page<Review> findByApproved(boolean approved, Pageable pageable);

    boolean existsByUserIdAndProductIdAndOrderId(Integer userId, String productId, String orderId);

    @Query("SELECT r.rating FROM Review r WHERE r.product.id = :productId AND r.approved = true")
    List<Integer> findRatingsByProductId(@Param("productId") String productId);

    /** Đếm review chưa duyệt — dùng cho dashboard */
    long countByApproved(boolean approved);
}