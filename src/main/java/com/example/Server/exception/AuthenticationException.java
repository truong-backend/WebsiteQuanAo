package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/** Ném khi xác thực thất bại — HTTP 401. */
public class AuthenticationException extends BaseException {
    public AuthenticationException(String message) {
        super(message, "AUTHENTICATION_ERROR", HttpStatus.UNAUTHORIZED);
    }
}
