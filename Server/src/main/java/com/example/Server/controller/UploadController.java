package com.example.Server.controller;

import com.example.Server.dto.response.Upload.UploadResponse;
import com.example.Server.services.UploadService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/uploads")
@CrossOrigin(origins = "*") // Thêm CORS
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    /**
     * POST /uploads/image
     */
    @PostMapping("/image")
    public ResponseEntity<UploadResponse> uploadImage(
            @RequestParam("file") MultipartFile file
    ) {
        String imageUrl = uploadService.uploadImage(file);
        return ResponseEntity.ok(new UploadResponse(imageUrl));
    }

    /**
     * DELETE /uploads/images?fileName=abc.jpg
     */
    @DeleteMapping("/images")
    public ResponseEntity<?> deleteImage(@RequestParam String fileName) {
        System.out.println("Deleting image: " + fileName); // Log để debug

        // Đường dẫn tới file
        Path path = Paths.get("uploads/images/" + fileName);

        System.out.println("File path: " + path.toAbsolutePath()); // Log path đầy đủ

        try {
            boolean deleted = Files.deleteIfExists(path);
            if (deleted) {
                System.out.println("File deleted successfully");
                return ResponseEntity.ok("Deleted");
            } else {
                System.out.println("File not found");
                return ResponseEntity.ok("File not found, but OK"); // Vẫn trả về OK
            }
        } catch (IOException e) {
            System.err.println("Error deleting file: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(500).body("Cannot delete: " + e.getMessage());
        }
    }
}