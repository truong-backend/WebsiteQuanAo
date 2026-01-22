package com.example.Server.exception;

import org.springframework.http.HttpStatus;

/**
 * Exception thrown when trying to create a resource that already exists
 * Returns HTTP 409 CONFLICT
 *
 * Usage example:
 * throw new ResourceAlreadyExistsException("User", "email", email);
 */
public class ResourceAlreadyExistsException extends BaseException {

    /**
     * Constructor with resource name, field name and field value
     *
     * @param resourceName name of the resource (e.g., "User", "Product")
     * @param fieldName name of the duplicate field (e.g., "email", "username")
     * @param fieldValue value that already exists
     */
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
