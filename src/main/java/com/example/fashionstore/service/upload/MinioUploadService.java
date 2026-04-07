package com.example.fashionstore.service.upload;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.config.MinioConfig.MinioProperties;
import com.example.fashionstore.dto.upload.UploadResponse;
import io.minio.*;
import io.minio.errors.MinioException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MinioUploadService {

    private static final long MAX_FILE_SIZE   = 5 * 1024 * 1024L; // 5 MB
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif"
    );

    private final MinioClient     minioClient;
    private final MinioProperties props;

    /**
     * Upload ảnh lên MinIO và trả về URL public.
     * Không lưu file vào DB — chỉ trả URL để caller lưu.
     */
    public UploadResponse uploadImage(MultipartFile file, String folder) {
        validateFile(file);

        String originalFilename = file.getOriginalFilename();
        String extension        = extractExtension(originalFilename);
        String storedName       = folder + "/" + UUID.randomUUID() + "." + extension;

        try {
            ensureBucketExists();

            InputStream inputStream = file.getInputStream();

            minioClient.putObject(
                    PutObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(storedName)
                            .stream(inputStream, file.getSize(), -1)
                            .contentType(file.getContentType())
                            .build()
            );

            String publicUrl = buildUrl(storedName);
            log.info("Uploaded file to MinIO: {}", publicUrl);

            return UploadResponse.builder()
                    .url(publicUrl)
                    .filename(storedName)
                    .size(file.getSize())
                    .contentType(file.getContentType())
                    .build();

        } catch (MinioException e) {
            log.error("MinIO error uploading file: {}", e.getMessage(), e);
            throw new BusinessException("Upload thất bại: " + e.getMessage());
        } catch (Exception e) {
            log.error("Unexpected error uploading file: {}", e.getMessage(), e);
            throw new BusinessException("Upload thất bại");
        }
    }

    /** Xóa file khỏi MinIO (gọi khi cập nhật/xóa sản phẩm) */
    public void deleteFile(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) return;
        try {
            // Extract object name từ URL
            String objectName = fileUrl.replace(props.getPublicUrl() + "/" + props.getBucket() + "/", "");
            minioClient.removeObject(
                    RemoveObjectArgs.builder()
                            .bucket(props.getBucket())
                            .object(objectName)
                            .build()
            );
            log.info("Deleted file from MinIO: {}", objectName);
        } catch (Exception e) {
            log.warn("Could not delete file from MinIO: {} — {}", fileUrl, e.getMessage());
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty())
            throw new BusinessException("File không được để trống");

        if (file.getSize() > MAX_FILE_SIZE)
            throw new BusinessException("File quá lớn. Tối đa 5MB");

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_TYPES.contains(contentType))
            throw new BusinessException("Chỉ chấp nhận ảnh: JPEG, PNG, WebP, GIF");
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    private String buildUrl(String objectName) {
        return props.getPublicUrl() + "/" + props.getBucket() + "/" + objectName;
    }

    private void ensureBucketExists() throws Exception {
        boolean exists = minioClient.bucketExists(
                BucketExistsArgs.builder().bucket(props.getBucket()).build()
        );
        if (!exists) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder().bucket(props.getBucket()).build()
            );
            // Set bucket public read policy
            String policy = """
                    {
                      "Version": "2012-10-17",
                      "Statement": [
                        {
                          "Effect": "Allow",
                          "Principal": {"AWS": ["*"]},
                          "Action": ["s3:GetObject"],
                          "Resource": ["arn:aws:s3:::%s/*"]
                        }
                      ]
                    }
                    """.formatted(props.getBucket());
            minioClient.setBucketPolicy(
                    SetBucketPolicyArgs.builder()
                            .bucket(props.getBucket())
                            .config(policy)
                            .build()
            );
            log.info("Created MinIO bucket: {}", props.getBucket());
        }
    }
}