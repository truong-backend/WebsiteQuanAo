package com.example.Server.controller;

import com.example.Server.dto.response.upload.UploadResponse;
import com.example.Server.service.UploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;

/**
 * Controller upload và xóa ảnh.
 * Base path: /uploads
 */
@RestController
@RequestMapping("/uploads")
public class UploadController {

    private final UploadService uploadService;
    public UploadController(UploadService uploadService) { this.uploadService = uploadService; }

    /** POST /uploads/image — upload ảnh, trả về URL public */
    @PostMapping("/image")
    public ResponseEntity<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(new UploadResponse(uploadService.uploadImage(file)));
    }

    /** DELETE /uploads/images?fileName=abc.jpg — xóa ảnh theo tên file */
    @DeleteMapping("/images")
    public ResponseEntity<String> deleteImage(@RequestParam String fileName) {
        try {
            Path path = Paths.get("uploads/images/" + fileName);
            boolean deleted = Files.deleteIfExists(path);
            return ResponseEntity.ok(deleted ? "Deleted" : "File not found");
        } catch (IOException e) {
            return ResponseEntity.status(500).body("Cannot delete: " + e.getMessage());
        }
    }
}
