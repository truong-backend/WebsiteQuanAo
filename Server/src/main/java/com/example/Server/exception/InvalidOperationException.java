package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when an operation is invalid in the current context
 * Returns HTTP 400 BAD REQUEST
 *
 * Usage examples:
 * throw new InvalidOperationException("Cannot delete user with active orders");
 * throw new InvalidOperationException("Cannot approve a cancelled order");
 */
public class InvalidOperationException extends BaseException {

    /**
     * Constructor with error message
     *
     * @param message error message describing why the operation is invalid
     */
    public InvalidOperationException(String message) {
        super(message, "INVALID_OPERATION", HttpStatus.BAD_REQUEST);
    }
}