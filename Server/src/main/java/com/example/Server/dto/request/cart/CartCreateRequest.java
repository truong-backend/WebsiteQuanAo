package com.example.Server.dto.request.cart;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CartCreateRequest {

    private String id;

    @NotNull(message = "Account ID is required")
    private Integer accountId;
}
