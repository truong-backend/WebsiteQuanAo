package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/** Ném khi vi phạm business logic — HTTP 400. */
public class BusinessException extends BaseException {
    public BusinessException(String message) {
        super(message, "BUSINESS_ERROR", HttpStatus.BAD_REQUEST);
    }
    public BusinessException(String message, String errorCode) {
        super(message, errorCode, HttpStatus.BAD_REQUEST);
    }
}
