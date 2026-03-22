package com.example.Server.dto.request.auth;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class AuthRequest {
    private String email;
    private String password;
}
