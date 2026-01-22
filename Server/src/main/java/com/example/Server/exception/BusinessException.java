package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown for business logic violations
 * Returns HTTP 400 BAD REQUEST
 *
 * Usage examples:
 * throw new BusinessException("Insufficient balance");
 * throw new BusinessException("User must be at least 18 years old", "AGE_REQUIREMENT");
 */
public class BusinessException extends BaseException {

    /**
     * Constructor with custom message and error code
     *
     * @param message error message
     * @param errorCode custom error code
     */
    public BusinessException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.BAD_REQUEST);
    }

    /**
     * Constructor with message only (uses default error code)
     *
     * @param message error message
     */
    public BusinessException(String message) {
        super(message, "BUSINESS_ERROR", HttpStatus.BAD_REQUEST);
    }
}
