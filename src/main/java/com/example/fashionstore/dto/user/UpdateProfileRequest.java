package com.example.fashionstore.dto.user;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    @NotBlank(message = "Tên không được để trống")
    @Size(max = 100)
    private String name;

    @Size(max = 15)
    @Pattern(regexp = "^[0-9]{10,11}$|^$", message = "Số điện thoại không hợp lệ")
    private String phone;

    @Size(max = 500)
    private String avatarUrl;
}