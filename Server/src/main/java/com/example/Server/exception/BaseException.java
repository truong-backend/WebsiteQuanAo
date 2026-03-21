package com.example.Server.exception;

import org.springframework.http.HttpStatus;

import java.util.HashMap;
import java.util.Map;

/**
 * Base exception cho toàn bộ custom exception trong ứng dụng.
 * Chứa errorCode, httpStatus và details để GlobalExceptionHandler xử lý nhất quán.
 */
public abstract class BaseException extends RuntimeException {

    private final String errorCode;
    private final HttpStatus httpStatus;
    private final Map<String, Object> details = new HashMap<>();

    protected BaseException(String message, String errorCode, HttpStatus httpStatus) {
        super(message);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    protected BaseException(String message, String errorCode, HttpStatus httpStatus, Throwable cause) {
        super(message, cause);
        this.errorCode = errorCode;
        this.httpStatus = httpStatus;
    }

    public BaseException addDetail(String key, Object value) {
        this.details.put(key, value);
        return this;
    }

    public String getErrorCode()           { return errorCode; }
    public HttpStatus getHttpStatus()      { return httpStatus; }
    public Map<String, Object> getDetails(){ return details; }
}
