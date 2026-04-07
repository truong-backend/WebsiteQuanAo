package com.example.fashionstore.dto.upload;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UploadResponse {
    /** Full public URL để lưu vào DB */
    private String  url;
    private String  filename;
    private long    size;
    private String  contentType;
}