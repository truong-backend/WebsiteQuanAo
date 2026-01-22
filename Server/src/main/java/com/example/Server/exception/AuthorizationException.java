package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown for authorization failures (insufficient permissions)
 * Returns HTTP 403 FORBIDDEN
 *
 * Usage examples:
 * throw new AuthorizationException("You don't have permission to access this resource");
 * throw new AuthorizationException("You can only edit your own posts");
 */
public class AuthorizationException extends BaseException {

    /**
     * Constructor with error message
     *
     * @param message error message
     */
    public AuthorizationException(String message) {
        super(message, "AUTHORIZATION_ERROR", HttpStatus.FORBIDDEN);
    }
}
