package com.example.fashionstore.config;

import io.minio.MinioClient;
import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.stereotype.Component;

@Configuration
public class MinioConfig {

    @Bean
    public MinioClient minioClient(MinioProperties props) {
        return MinioClient.builder()
                .endpoint(props.getEndpoint())
                .credentials(props.getAccessKey(), props.getSecretKey())
                .build();
    }

    @Component
    @ConfigurationProperties(prefix = "minio")
    @Data
    public static class MinioProperties {
        private String endpoint   = "http://localhost:9000";
        private String accessKey  = "minioadmin";
        private String secretKey  = "minioadmin";
        private String bucket     = "fashion-store";
        private String publicUrl  = "http://localhost:9000";
    }
}