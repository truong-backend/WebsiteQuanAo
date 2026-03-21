package com.example.Server.exception;

import com.example.Server.dto.response.error.ErrorResponse;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;

import java.util.HashMap;
import java.util.Map;

/**
 * Xử lý tập trung tất cả exception, trả về {@link ErrorResponse} chuẩn hóa.
 */
@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, WebRequest request) {
        log.error("BaseException: {}", ex.getMessage());
        ErrorResponse body = new ErrorResponse(
                ex.getErrorCode(), ex.getMessage(),
                ex.getHttpStatus().value(), getPath(request));
        body.setDetails(ex.getDetails());
        return new ResponseEntity<>(body, ex.getHttpStatus());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidation(
            MethodArgumentNotValidException ex, WebRequest request) {
        log.error("Validation error: {}", ex.getMessage());
        Map<String, String> fieldErrors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> fieldErrors.put(e.getField(), e.getDefaultMessage()));

        ErrorResponse body = new ErrorResponse(
                "VALIDATION_ERROR", "Validation failed",
                HttpStatus.BAD_REQUEST.value(), getPath(request));
        body.getDetails().put("fieldErrors", fieldErrors);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(
            ConstraintViolationException ex, WebRequest request) {
        log.error("Constraint violation: {}", ex.getMessage());
        Map<String, String> violations = new HashMap<>();
        ex.getConstraintViolations()
                .forEach(v -> violations.put(v.getPropertyPath().toString(), v.getMessage()));

        ErrorResponse body = new ErrorResponse(
                "CONSTRAINT_VIOLATION", "Constraint violation",
                HttpStatus.BAD_REQUEST.value(), getPath(request));
        body.getDetails().put("violations", violations);
        return new ResponseEntity<>(body, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGlobal(Exception ex, WebRequest request) {
        log.error("Unexpected error", ex);
        ErrorResponse body = new ErrorResponse(
                "INTERNAL_Server_ERROR", "An unexpected error occurred",
                HttpStatus.INTERNAL_SERVER_ERROR.value(), getPath(request));
        return new ResponseEntity<>(body, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    private String getPath(WebRequest request) {
        return ((ServletWebRequest) request).getRequest().getRequestURI();
    }
}
