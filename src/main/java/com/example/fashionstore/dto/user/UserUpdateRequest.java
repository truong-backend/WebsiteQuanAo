package com.example.fashionstore.dto.user;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotBlank @Size(min = 2, max = 100)
    private String name;

    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phone;

    private String avatarUrl;
}