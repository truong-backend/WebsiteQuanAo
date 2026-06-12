package com.example.fashionstore.dto.voucher;

import lombok.*;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ApplyVoucherResponse {
    private Long       voucherId;
    private String     code;
    private BigDecimal discountAmount;
    private String     message;
}