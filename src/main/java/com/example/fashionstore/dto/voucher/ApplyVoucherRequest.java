package com.example.fashionstore.dto.voucher;

import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ApplyVoucherRequest {

    @NotBlank
    private String code;

    @NotNull
    @DecimalMin("0")
    private BigDecimal subtotal;
}