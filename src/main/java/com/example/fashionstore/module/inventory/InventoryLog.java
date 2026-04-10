package com.example.fashionstore.module.inventory;

import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.variant.ProductVariant;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Lịch sử nhập/xuất kho theo từng variant.
 * Mỗi lần thay đổi tồn kho đều tạo 1 bản ghi log.
 */
@Entity
@Table(name = "inventory_logs",
        indexes = {
                @Index(name = "idx_inv_log_variant",    columnList = "variant_id"),
                @Index(name = "idx_inv_log_created_at", columnList = "created_at"),
                @Index(name = "idx_inv_log_type",       columnList = "change_type")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "variant_id", nullable = false)
    private ProductVariant variant;

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false, length = 20)
    private ChangeType changeType;

    /** Số lượng thay đổi (luôn dương — chiều được xác định bởi changeType) */
    @Column(nullable = false)
    private int quantity;

    /** Tồn kho SAU KHI thay đổi */
    @Column(name = "quantity_after", nullable = false)
    private int quantityAfter;

    /** Ghi chú (VD: "Nhập hàng Q1 2025", "Hoàn kho do hủy order #ABC") */
    @Column(length = 500)
    private String note;

    /** Liên kết đến order nếu xuất kho do bán hàng / hoàn kho do hủy */
    @Column(name = "order_id", length = 36)
    private String orderId;

    /** Admin/System thực hiện thao tác */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    public enum ChangeType {
        IMPORT,       // Nhập hàng (admin nhập thủ công)
        EXPORT_SALE,  // Xuất do bán hàng (order)
        RETURN,       // Hoàn kho (hủy đơn)
        ADJUST        // Điều chỉnh thủ công (admin)
    }
}