package com.example.fashionstore.dto.user;

import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AddressDto {
    private Long          id;
    private String        recipientName;
    private String        phone;
    private String        address;
    private boolean       defaultAddress;
    private LocalDateTime createdAt;
}