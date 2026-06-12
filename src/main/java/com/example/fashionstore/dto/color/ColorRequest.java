package com.example.fashionstore.dto.color;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ColorRequest {

    @NotBlank(message = "Mã màu không được để trống")
    @Pattern(regexp = "^#[0-9A-Fa-f]{3,6}$", message = "Mã màu phải là dạng hex, ví dụ: #FF0000")
    @Size(max = 20)
    private String code;

    @NotBlank(message = "Tên màu không được để trống")
    @Size(max = 100)
    private String name;

    @Size(max = 100)
    private String nameEn;

    private boolean active = true;
}