package com.example.fashionstore.repository.voucher;

import com.example.fashionstore.module.voucher.Voucher;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    // ================= FIND BY CODE =================

    // Chỉ lấy voucher chưa bị xóa
    Optional<Voucher> findByCodeIgnoreCaseAndDeletedFalse(String code);

    // Backward compatibility
    default Optional<Voucher> findByCodeIgnoreCase(String code) {
        return findByCodeIgnoreCaseAndDeletedFalse(code);
    }

    // Kiểm tra tồn tại (không filter deleted để tránh trùng code)
    boolean existsByCodeIgnoreCase(String code);

    // ================= ADMIN LIST =================

    // Danh sách chưa xóa
    List<Voucher> findAllByDeletedFalseOrderByCreatedAtDesc();

    // Danh sách có thể include deleted
    @Query("""
        SELECT v FROM Voucher v
        WHERE (:includeDeleted = true OR v.deleted = false)
        ORDER BY v.createdAt DESC
    """)
    List<Voucher> findAllAdmin(@Param("includeDeleted") boolean includeDeleted);

    // ================= VALID VOUCHER =================

    /** Voucher hợp lệ (dùng cho user) */
    @Query("""
        SELECT v FROM Voucher v
        WHERE v.deleted = false
          AND v.active = true
          AND (v.startDate IS NULL OR v.startDate <= :now)
          AND (v.endDate IS NULL OR v.endDate > :now)
          AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit)
        ORDER BY v.createdAt DESC
    """)
    List<Voucher> findAllValid(@Param("now") LocalDateTime now);
}