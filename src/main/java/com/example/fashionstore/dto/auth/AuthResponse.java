package com.example.fashionstore.dto.auth;

import lombok.*;

@Data
@Builder
public class AuthResponse {
    private String  accessToken;
    private String  tokenType;
    private long    expiresIn;
    /** true khi user vừa register và chưa verify email */
    private boolean requiresEmailVerification;
    private UserInfo user;

    @Data
    @Builder
    public static class UserInfo {
        private Integer id;
        private String  name;
        private String  email;
        private String  role;
        private String  avatarUrl;
        private boolean emailVerified;
    }
}