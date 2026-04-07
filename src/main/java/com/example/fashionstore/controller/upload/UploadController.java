package com.example.fashionstore.controller.upload;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.upload.UploadResponse;
import com.example.fashionstore.service.upload.MinioUploadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/upload")
@RequiredArgsConstructor
public class UploadController {

    private final MinioUploadService uploadService;

    /**
     * POST /api/v1/upload/image
     *
     * Upload ảnh lên MinIO. Yêu cầu đăng nhập (ADMIN hoặc USER).
     * - folder = "products"  → ảnh sản phẩm (Admin)
     * - folder = "avatars"   → ảnh đại diện người dùng
     *
     * Params:
     *   file    — MultipartFile (JPEG/PNG/WebP/GIF, tối đa 5MB)
     *   folder  — subfolder trong bucket (mặc định: "products")
     *
     * Response:
     *   { url, filename, size, contentType }
     */
    @PostMapping(value = "/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UploadResponse>> uploadImage(
            @RequestParam("file")                  MultipartFile file,
            @RequestParam(defaultValue = "products") String        folder) {

        UploadResponse result = uploadService.uploadImage(file, folder);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(result));
    }
}