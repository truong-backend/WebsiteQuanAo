package com.example.fashionstore.dto.voucher;

import com.example.fashionstore.module.voucher.Voucher.VoucherType;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VoucherDto {
    private Long          id;
    private String        code;
    private String        description;
    private VoucherType   type;
    private BigDecimal    value;
    private BigDecimal    minOrderAmount;
    private BigDecimal    maxDiscount;
    private Integer       usageLimit;
    private int           usedCount;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private boolean       active;
    private LocalDateTime createdAt;
}