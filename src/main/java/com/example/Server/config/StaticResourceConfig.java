package com.example.Server.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serve ảnh upload tĩnh từ thư mục local qua URL /images/**.
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
