package com.example.fashionstore.dto.voucher;

import com.example.fashionstore.module.voucher.Voucher.VoucherType;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherRequest {

    @NotBlank
    @Size(min = 3, max = 50)
    private String code;

    @Size(max = 300)
    private String description;

    @NotNull
    private VoucherType type;

    @NotNull
    @DecimalMin("0")
    private BigDecimal value;

    @DecimalMin("0")
    private BigDecimal minOrderAmount = BigDecimal.ZERO;

    @DecimalMin("0")
    private BigDecimal maxDiscount;

    @Min(1)
    private Integer usageLimit;

    private LocalDateTime startDate;
    private LocalDateTime endDate;

    private boolean active = true;
}