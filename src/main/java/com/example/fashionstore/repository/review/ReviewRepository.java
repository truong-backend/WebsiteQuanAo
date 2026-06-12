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

    // ================= STORE (USER) =================

    // Chỉ lấy review đã duyệt + chưa xóa
    Page<Review> findByProductIdAndApprovedTrueAndDeletedFalse(String productId, Pageable pageable);

    // Backward compatibility
    default Page<Review> findByProductIdAndApprovedTrue(String productId, Pageable pageable) {
        return findByProductIdAndApprovedTrueAndDeletedFalse(productId, pageable);
    }

    // ================= ADMIN =================

    // Theo trạng thái approved + chưa xóa
    Page<Review> findByApprovedAndDeletedFalse(boolean approved, Pageable pageable);

    // Tất cả chưa xóa
    Page<Review> findByDeletedFalse(Pageable pageable);

    // Có thể include deleted
    @Query("""
        SELECT r FROM Review r
        WHERE (:approved IS NULL OR r.approved = :approved)
          AND (:includeDeleted = true OR r.deleted = false)
    """)
    Page<Review> findAllAdmin(
            @Param("approved") Boolean approved,
            @Param("includeDeleted") boolean includeDeleted,
            Pageable pageable
    );

    // ================= BUSINESS =================

    boolean existsByUserIdAndProductIdAndOrderId(Integer userId, String productId, String orderId);

    // Lấy rating để tính trung bình (chỉ lấy approved + chưa xóa)
    @Query("""
        SELECT r.rating FROM Review r
        WHERE r.product.id = :productId
          AND r.approved = true
          AND r.deleted = false
    """)
    List<Integer> findRatingsByProductId(@Param("productId") String productId);

    // ================= COUNT =================

    long countByApprovedAndDeletedFalse(boolean approved);

    // Backward compatibility
    default long countByApproved(boolean approved) {
        return countByApprovedAndDeletedFalse(approved);
    }
}