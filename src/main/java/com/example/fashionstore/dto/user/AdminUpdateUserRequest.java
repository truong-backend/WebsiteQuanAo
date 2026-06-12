package com.example.fashionstore.dto.user;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class AdminUpdateUserRequest {
    @NotBlank
    @Size(max = 100)
    private String name;

    @Size(max = 15)
    private String phone;

    @Size(max = 500)
    private String avatarUrl;
}