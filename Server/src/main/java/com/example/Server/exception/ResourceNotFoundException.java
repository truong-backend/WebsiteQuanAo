package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when a requested resource is not found
 * Returns HTTP 404 NOT FOUND
 *
 * Usage example:
 * throw new ResourceNotFoundException("User", "id", userId);
 */
public class ResourceNotFoundException extends BaseException {

    /**
     * Constructor with resource name, field name and field value
     *
     * @param resourceName name of the resource (e.g., "User", "Product")
     * @param fieldName name of the field used for search (e.g., "id", "email")
     * @param fieldValue value of the field
     */
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