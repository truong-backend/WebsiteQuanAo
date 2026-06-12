// Chỗ cần paste: thay toàn bộ file Voucher.java
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

    /** Optimistic Lock — tránh race condition khi nhiều user dùng voucher cùng lúc */
    @Version
    private Long version;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @Column(length = 300)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private VoucherType type;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal value;

    @Column(name = "min_order_amount", nullable = false, precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @Column(name = "max_discount", precision = 15, scale = 2)
    private BigDecimal maxDiscount;

    @Column(name = "usage_limit")
    private Integer usageLimit;

    @Column(name = "used_count", nullable = false)
    @Builder.Default
    private int usedCount = 0;

    @Column(name = "start_date")
    private LocalDateTime startDate;

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

    @Column(name = "deleted", nullable = false)
    @Builder.Default
    private boolean deleted = false;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    public void softDelete() {
        this.deleted   = true;
        this.deletedAt = LocalDateTime.now();
        this.active    = false;
    }

    public void restore() {
        this.deleted   = false;
        this.deletedAt = null;
        this.active    = true;
    }

    public boolean isValid() {
        if (!active) return false;
        LocalDateTime now = LocalDateTime.now();
        if (startDate != null && now.isBefore(startDate)) return false;
        if (endDate   != null && now.isAfter(endDate))    return false;
        if (usageLimit != null && usedCount >= usageLimit) return false;
        return true;
    }

    public BigDecimal calculateDiscount(BigDecimal subtotal, BigDecimal shippingFee) {
        return switch (type) {
            case PERCENTAGE -> {
                BigDecimal discount = subtotal.multiply(value).divide(BigDecimal.valueOf(100));
                if (maxDiscount != null && discount.compareTo(maxDiscount) > 0)
                    discount = maxDiscount;
                yield discount;
            }
            case FIXED_AMOUNT -> value.min(subtotal);
            case FREE_SHIPPING -> shippingFee;
        };
    }

    public enum VoucherType {
        PERCENTAGE,
        FIXED_AMOUNT,
        FREE_SHIPPING
    }
}