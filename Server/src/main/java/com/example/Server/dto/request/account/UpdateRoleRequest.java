package com.example.Server.dto.request.account;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class UpdateRoleRequest {
    @NotBlank(message = "Role is required")
    private String role;
}
