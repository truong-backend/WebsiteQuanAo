package com.example.Server.services;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
public class UploadService {

    private final String UPLOAD_DIR = "uploads/images/";

    public String uploadImage(MultipartFile file) {
        try {
            File dir = new File(UPLOAD_DIR);
            if (!dir.exists()) dir.mkdirs();

            String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
            Path path = Paths.get(UPLOAD_DIR + fileName);

            Files.write(path, file.getBytes());

            // 🔥 Trả URL public
            return "/images/" + fileName;

        } catch (IOException e) {
            throw new RuntimeException("Upload failed");
        }
    }

    public void deleteImage(String imagePath) {
        if (imagePath == null || imagePath.isBlank()) return;

        try {
            String fileName = Paths.get(imagePath).getFileName().toString();
            Path fullPath = Paths.get(UPLOAD_DIR + fileName);

            Files.deleteIfExists(fullPath);

        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
