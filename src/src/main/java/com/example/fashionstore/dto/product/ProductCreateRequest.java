package com.example.fashionstore.dto.product;


import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class ProductCreateRequest {
    @NotBlank(message = "Tên sản phẩm không được để trống")
    @Size(max = 200)
    private String name;

    @NotBlank(message = "Slug không được để trống")
    @Pattern(regexp = "^[a-z0-9-]+$", message = "Slug chỉ chứa chữ thường, số và dấu gạch ngang")
    @Size(max = 220)
    private String slug;

    private String description;

    @NotNull(message = "Giá không được để trống")
    @DecimalMin(value = "0", inclusive = false, message = "Giá phải lớn hơn 0")
    private BigDecimal basePrice;

    @DecimalMin(value = "0", message = "Giá sale không được âm")
    private BigDecimal salePrice;

    @NotBlank(message = "Ảnh chính không được để trống")
    private String mainImage;

    private String hoverImage;

    @NotNull(message = "Danh mục không được để trống")
    private Long categoryId;
}