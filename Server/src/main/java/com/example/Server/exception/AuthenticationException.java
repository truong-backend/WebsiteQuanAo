package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown for authentication failures
 * Returns HTTP 401 UNAUTHORIZED
 *
 * Usage examples:
 * throw new AuthenticationException("Invalid email or password");
 * throw new AuthenticationException("Token has expired");
 */
public class AuthenticationException extends BaseException {

    /**
     * Constructor with error message
     *
     * @param message error message
     */
    public AuthenticationException(String message) {
        super(message, "AUTHENTICATION_ERROR", HttpStatus.UNAUTHORIZED);
    }
}