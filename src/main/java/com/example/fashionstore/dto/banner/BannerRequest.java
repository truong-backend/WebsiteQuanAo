package com.example.fashionstore.dto.banner;

import com.example.fashionstore.module.banner.Banner;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BannerRequest {

    @NotNull
    private Banner.BannerType type;

    @NotBlank
    private String title;

    private String        subtitle;

    @NotBlank
    private String        imageUrl;

    private String        linkUrl;
    private String        ctaText;
    private Integer       discountPercent;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean       active;
    private Integer       sortOrder;
    private Integer       popupDelaySeconds;
    private String        voucherCode;
}