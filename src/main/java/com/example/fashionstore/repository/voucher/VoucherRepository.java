// Chỗ cần paste: thay toàn bộ file VoucherRepository.java
package com.example.fashionstore.repository.voucher;

import com.example.fashionstore.module.voucher.Voucher;
import jakarta.persistence.LockModeType;
import jakarta.persistence.QueryHint;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface VoucherRepository extends JpaRepository<Voucher, Long> {

    Optional<Voucher> findByCodeIgnoreCaseAndDeletedFalse(String code);

    default Optional<Voucher> findByCodeIgnoreCase(String code) {
        return findByCodeIgnoreCaseAndDeletedFalse(code);
    }

    boolean existsByCodeIgnoreCase(String code);

    List<Voucher> findAllByDeletedFalseOrderByCreatedAtDesc();

    @Query("""
        SELECT v FROM Voucher v
        WHERE (:includeDeleted = true OR v.deleted = false)
        ORDER BY v.createdAt DESC
    """)
    List<Voucher> findAllAdmin(@Param("includeDeleted") boolean includeDeleted);

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

    /**
     * Pessimistic Lock — dùng khi tạo order để tránh race condition usedCount.
     * SELECT ... FOR UPDATE: lock row voucher cho đến khi transaction commit.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @QueryHints(@QueryHint(name = "jakarta.persistence.lock.timeout", value = "3000"))
    @Query("SELECT v FROM Voucher v WHERE v.id = :id AND v.deleted = false")
    Optional<Voucher> findByIdForUpdate(@Param("id") Long id);
}