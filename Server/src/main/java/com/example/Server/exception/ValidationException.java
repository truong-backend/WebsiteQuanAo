package com.example.Server.exception;

import org.springframework.http.HttpStatus;
import java.util.Map;

/**
 * Exception thrown for validation errors
 * Returns HTTP 400 BAD REQUEST
 *
 * Usage examples:
 * throw new ValidationException("Validation failed");
 * throw new ValidationException("Validation failed", fieldErrors);
 */
public class ValidationException extends BaseException {

    /**
     * Constructor with message only
     *
     * @param message error message
     */
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
    }

    /**
     * Constructor with message and field errors
     *
     * @param message error message
     * @param fieldErrors map of field names to error messages
     */
    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
        addDetail("fieldErrors", fieldErrors);
    }
}
