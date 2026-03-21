package com.example.Server.dto.response.auth;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class LoginResponse {
    private String token;
    private long expiresIn;
}
