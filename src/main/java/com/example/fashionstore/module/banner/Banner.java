package com.example.fashionstore.module.banner;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "banners",
        indexes = {
                @Index(name = "idx_banners_type",       columnList = "type"),
                @Index(name = "idx_banners_active",     columnList = "active"),
                @Index(name = "idx_banners_sort_order", columnList = "sort_order")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(of = "id")
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BannerType type;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 500)
    private String subtitle;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "link_url", length = 500)
    private String linkUrl;

    // CTA button
    @Column(name = "cta_text", length = 100)
    private String ctaText;

    // Khuyến mãi
    @Column(name = "discount_percent")
    private Integer discountPercent;

    // Sự kiện / Countdown
    @Column(name = "start_date")
    private LocalDateTime startDate;

    @Column(name = "end_date")
    private LocalDateTime endDate;

    // Hiển thị
    @Column(nullable = false)
    @Builder.Default
    private Boolean active = true;

    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    // Thống kê
    @Column(name = "impressions", nullable = false)
    @Builder.Default
    private Long impressions = 0L;

    @Column(name = "clicks", nullable = false)
    @Builder.Default
    private Long clicks = 0L;

    // Popup settings
    @Column(name = "popup_delay_seconds")
    private Integer popupDelaySeconds;

    @Column(name = "voucher_code", length = 50)
    private String voucherCode;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    public void preUpdate() { this.updatedAt = LocalDateTime.now(); }

    public enum BannerType {
        HERO,           // Banner chính slider
        PROMOTION,      // Khuyến mãi
        CATEGORY,       // Danh mục
        COLLECTION,     // Bộ sưu tập
        BRAND,          // Thương hiệu
        FEATURED,       // Sản phẩm nổi bật
        EVENT,          // Sự kiện (Tết, Noel...)
        SERVICE,        // Freeship, cam kết
        POPUP,          // Popup banner
        COUNTDOWN       // Đếm ngược flash sale
    }
}