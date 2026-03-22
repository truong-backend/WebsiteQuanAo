package com.example.Server.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

/**
 * Service xử lý upload và xóa ảnh local.
 * Ảnh được lưu vào thư mục {@code uploads/images/} và serve qua {@code /images/**}.
 */
@Service
public class UploadService {

    private static final String UPLOAD_DIR = "uploads/images/";

    /**
     * Upload ảnh lên Server.
     *
     * @param file file ảnh cần upload
     * @return URL public để truy cập ảnh (VD: /images/uuid_filename.jpg)
     */
    public String uploadImage(MultipartFile file) {
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Files.write(Paths.get(UPLOAD_DIR + fileName), file.getBytes());
            return "/images/" + fileName;
        } catch (IOException e) {
            throw new RuntimeException("Upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa ảnh khỏi Server theo đường dẫn.
     *
     * @param imagePath đường dẫn ảnh (VD: /images/uuid_filename.jpg)
     */
    public void deleteImage(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) return;
        try {
            String fileName = Paths.get(imagePath).getFileName().toString();
            Files.deleteIfExists(Paths.get(UPLOAD_DIR + fileName));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
