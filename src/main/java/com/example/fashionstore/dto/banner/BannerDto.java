package com.example.fashionstore.dto.banner;

import com.example.fashionstore.module.banner.Banner;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BannerDto {
    private Long              id;
    private Banner.BannerType type;
    private String            title;
    private String            subtitle;
    private String            imageUrl;
    private String            linkUrl;
    private String            ctaText;
    private Integer           discountPercent;
    private LocalDateTime     startDate;
    private LocalDateTime     endDate;
    private Boolean           active;
    private Integer           sortOrder;
    private Long              impressions;
    private Long              clicks;
    private Double            ctr;           // clicks / impressions * 100
    private Integer           popupDelaySeconds;
    private String            voucherCode;
    private LocalDateTime     createdAt;
    private LocalDateTime     updatedAt;
}