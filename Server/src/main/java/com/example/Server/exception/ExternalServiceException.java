package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/** Ném khi external service (VNPAY, MoMo, email...) lỗi — HTTP 503. */
public class ExternalServiceException extends BaseException {
    public ExternalServiceException(String serviceName, String message) {
        super(String.format("External service '%s' error: %s", serviceName, message),
                "EXTERNAL_SERVICE_ERROR", HttpStatus.SERVICE_UNAVAILABLE);
        addDetail("serviceName", serviceName);
    }
    public ExternalServiceException(String serviceName, String message, Throwable cause) {
        super(String.format("External service '%s' error: %s", serviceName, message),
                "EXTERNAL_SERVICE_ERROR", HttpStatus.SERVICE_UNAVAILABLE, cause);
        addDetail("serviceName", serviceName);
    }
}
