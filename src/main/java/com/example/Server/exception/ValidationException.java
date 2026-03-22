package com.example.Server.exception;

import org.springframework.http.HttpStatus;
import java.util.Map;

/** Ném khi dữ liệu đầu vào không hợp lệ — HTTP 400. */
public class ValidationException extends BaseException {
    public ValidationException(String message) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
    }
    public ValidationException(String message, Map<String, String> fieldErrors) {
        super(message, "VALIDATION_ERROR", HttpStatus.BAD_REQUEST);
        addDetail("fieldErrors", fieldErrors);
    }
}
