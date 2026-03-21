package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/** Ném khi resource không tồn tại — HTTP 404. */
public class ResourceNotFoundException extends BaseException {

    public ResourceNotFoundException(String resourceName, String fieldName, Object fieldValue) {
        super(
                String.format("%s not found with %s: '%s'", resourceName, fieldName, fieldValue),
                "RESOURCE_NOT_FOUND",
                HttpStatus.NOT_FOUND
        );
        addDetail("resourceName", resourceName);
        addDetail("fieldName", fieldName);
        addDetail("fieldValue", fieldValue);
    }
}
