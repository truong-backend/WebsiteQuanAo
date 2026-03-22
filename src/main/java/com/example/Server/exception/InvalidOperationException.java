package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/** Ném khi thao tác không hợp lệ trong ngữ cảnh hiện tại — HTTP 400. */
public class InvalidOperationException extends com.example.Server.exception.BaseException {

    public InvalidOperationException(String message) {
        super(message, "INVALID_OPERATION", HttpStatus.BAD_REQUEST);
    }
}
