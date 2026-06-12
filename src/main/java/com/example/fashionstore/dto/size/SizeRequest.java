package com.example.fashionstore.dto.size;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SizeRequest {

    @NotBlank(message = "Mã size không được để trống")
    @Size(max = 20, message = "Mã size tối đa 20 ký tự")
    private String code;

    @NotBlank(message = "Tên size không được để trống")
    @Size(max = 100)
    private String name;

    @NotNull(message = "Thứ tự hiển thị không được để trống")
    @Min(value = 0, message = "Thứ tự phải >= 0")
    private Integer sortOrder;

    private boolean active = true;
}