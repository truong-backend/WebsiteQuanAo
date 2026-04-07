package com.example.fashionstore.dto.auth;

import lombok.*;

@Data
@Builder
public class AuthResponse {
    private String  accessToken;
    private String  refreshToken;
    private String  tokenType;
    private long    expiresIn;
    /** Thời gian hết hạn của refresh token (giây) */
    private long    refreshExpiresIn;
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