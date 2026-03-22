package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/** Ném khi không đủ quyền truy cập — HTTP 403. */
public class AuthorizationException extends BaseException {
    public AuthorizationException(String message) {
        super(message, "AUTHORIZATION_ERROR", HttpStatus.FORBIDDEN);
    }
}
