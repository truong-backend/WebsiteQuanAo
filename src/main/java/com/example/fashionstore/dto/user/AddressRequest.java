package com.example.fashionstore.dto.user;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AddressRequest {

    @NotBlank
    @Size(max = 100)
    private String recipientName;

    @NotBlank
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @NotBlank
    @Size(max = 300)
    private String address;

    private boolean defaultAddress = false;
}