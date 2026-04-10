package com.example.fashionstore.module.voucher;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "vouchers",
        indexes = {
                @Index(name = "idx_vouchers_code",   columnList = "code", unique = true),
                @Index(name = "idx_vouchers_active",  columnList = "active"),
                @Index(name = "idx_vouchers_end_date", columnList = "end_date")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Voucher {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Mã voucher — VD: SUMMER20, FREESHIP, NEWUSER100K */
    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VoucherType type;

    /**
     * Giá trị giảm:
     *  - PERCENTAGE:   0..100 (phần trăm)
     *  - FIXED_AMOUNT: số tiền (VND)
     *  - FREE_SHIPPING: không dùng (= 0)
     */
    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal value;

    /** Giá trị đơn hàng tối thiểu để áp dụng */
    @Column(name = "min_order_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    /** Giảm tối đa (dùng cho PERCENTAGE để tránh giảm quá lớn) — null = không giới hạn */
    @Column(name = "max_discount", precision = 15, scale = 2)
    private BigDecimal maxDiscount;

    /** Số lần sử dụng tối đa — null = không giới hạn */
    @Column(name = "usage_limit")
    private Integer usageLimit;

    /** Số lần đã sử dụng */
    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private int usedCount = 0;

    /** Ngày bắt đầu hiệu lực — null = không giới hạn */
    @Column(name = "start_date")
    private LocalDateTime startDate;

    /** Ngày hết hạn — null = không giới hạn */
    @Column(name = "end_date")
    private LocalDateTime endDate;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    // ── Business logic ───────────────────────────────────────────────

    /** Kiểm tra voucher có hợp lệ không (active, còn hạn, còn lượt dùng) */
    public boolean isValid() {
        if (!active) return false;
        LocalDateTime now = LocalDateTime.now();
        if (startDate != null && now.isBefore(startDate)) return false;
        if (endDate   != null && now.isAfter(endDate))    return false;
        if (usageLimit != null && usedCount >= usageLimit) return false;
        return true;
    }

    /**
     * Tính số tiền được giảm dựa trên subtotal.
     * @param subtotal tổng tiền hàng (chưa ship)
     * @param shippingFee phí ship
     */
    public BigDecimal calculateDiscount(BigDecimal subtotal, BigDecimal shippingFee) {
        return switch (type) {
            case PERCENTAGE -> {
                BigDecimal discount = subtotal.multiply(value).divide(BigDecimal.valueOf(100));
                if (maxDiscount != null && discount.compareTo(maxDiscount) > 0)
                    discount = maxDiscount;
                yield discount;
            }
            case FIXED_AMOUNT -> value.min(subtotal); // không giảm quá subtotal
            case FREE_SHIPPING -> shippingFee;
        };
    }

    public enum VoucherType {
        PERCENTAGE,   // Giảm theo %
        FIXED_AMOUNT, // Giảm số tiền cố định
        FREE_SHIPPING // Miễn phí ship
    }
}