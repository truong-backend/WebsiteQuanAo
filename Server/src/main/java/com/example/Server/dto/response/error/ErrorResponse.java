package com.example.Server.dto.response.error;

import lombok.*;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor
public class ErrorResponse {
    private String errorCode;
    private String message;
    private int status;
    private LocalDateTime timestamp;
    private String path;
    private Map<String, Object> details;

    public ErrorResponse(String errorCode, String message, int status, String path) {
        this.errorCode = errorCode; this.message = message;
        this.status = status;       this.path = path;
        this.timestamp = LocalDateTime.now();
        this.details = new HashMap<>();
    }
}
