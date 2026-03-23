package com.example.Server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serve ảnh upload tĩnh từ thư mục local qua URL /images/**.
 *
 * ⚠️ LƯU Ý KHI DEPLOY TRÊN RENDER:
 * Render sử dụng ephemeral filesystem — mọi file upload vào thư mục local
 * sẽ bị XÓA sau mỗi lần redeploy hoặc restart.
 *
 * Giải pháp lâu dài: chuyển sang cloud storage (Cloudinary, AWS S3, v.v.)
 * và lưu URL ảnh vào database thay vì lưu file local.
 */
@Configuration
public class StaticResourceConfig implements WebMvcConfigurer {

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolutePath = Paths.get("uploads/images").toAbsolutePath().normalize() + "/";
        registry.addResourceHandler("/images/**")
                .addResourceLocations("file:" + absolutePath);
    }
}