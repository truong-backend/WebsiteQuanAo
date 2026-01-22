package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when an external service fails
 * Returns HTTP 503 SERVICE UNAVAILABLE
 *
 * Usage examples:
 * throw new ExternalServiceException("PaymentGateway", "Payment processing failed");
 * throw new ExternalServiceException("EmailService", "Failed to send email", cause);
 */
public class ExternalServiceException extends BaseException {

    /**
     * Constructor with service name and message
     *
     * @param serviceName name of the external service
     * @param message error message
     */
    public ExternalServiceException(String serviceName, String message) {
        super(
                String.format("External service '%s' error: %s", serviceName, message),
                "EXTERNAL_SERVICE_ERROR",
                HttpStatus.SERVICE_UNAVAILABLE
        );
        addDetail("serviceName", serviceName);
    }

    /**
     * Constructor with service name, message and cause
     *
     * @param serviceName name of the external service
     * @param message error message
     * @param cause the underlying cause
     */
    public ExternalServiceException(String serviceName, String message, Throwable cause) {
        super(
                String.format("External service '%s' error: %s", serviceName, message),
                "EXTERNAL_SERVICE_ERROR",
                HttpStatus.SERVICE_UNAVAILABLE,
                cause
        );
        addDetail("serviceName", serviceName);
    }
}
