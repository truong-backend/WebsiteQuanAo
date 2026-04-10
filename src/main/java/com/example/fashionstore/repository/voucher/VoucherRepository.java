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

    Optional<Voucher> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    /** Tìm tất cả voucher đang active và chưa hết hạn */
    @Query("""
        SELECT v FROM Voucher v
        WHERE v.active = true
        AND (v.startDate IS NULL OR v.startDate <= :now)
        AND (v.endDate IS NULL OR v.endDate > :now)
        AND (v.usageLimit IS NULL OR v.usedCount < v.usageLimit)
        ORDER BY v.createdAt DESC
    """)
    List<Voucher> findAllValid(@Param("now") LocalDateTime now);
}