package com.example.Server.dto.request.productvariant;

import jakarta.validation.constraints.*;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class ProductVariantCreateRequest {
    @NotNull @Min(0) private Integer quantity;
    @NotBlank private String img;
    @NotNull  private String productId;
    @NotNull  private String colorCode;
    @NotNull  private String sizeId;
}
