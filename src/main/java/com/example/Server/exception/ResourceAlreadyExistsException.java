package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/** Ném khi tạo resource đã tồn tại — HTTP 409. */
public class ResourceAlreadyExistsException extends BaseException {

    public ResourceAlreadyExistsException(String resourceName, String fieldName, Object fieldValue) {
        super(
                String.format("%s already exists with %s: '%s'", resourceName, fieldName, fieldValue),
                "RESOURCE_ALREADY_EXISTS",
                HttpStatus.CONFLICT
        );
        addDetail("resourceName", resourceName);
        addDetail("fieldName", fieldName);
        addDetail("fieldValue", fieldValue);
    }
}
