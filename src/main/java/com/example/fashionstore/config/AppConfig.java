package com.example.fashionstore.config;

import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * AppConfig — Factory Pattern + Singleton Pattern
 *
 * ┌─────────────────────────────────────────────────────────────────┐
 * │  SINGLETON PATTERN trong Spring:                                │
 * │  @Bean + @Configuration → Spring IoC tạo ĐÚNG 1 instance       │
 * │  và tái sử dụng ở mọi nơi inject (mặc định scope = singleton)  │
 * │                                                                 │
 * │  FACTORY PATTERN:                                               │
 * │  AppConfig đóng vai "factory" tạo ra các bean:                 │
 * │  UserDetailsService, PasswordEncoder, AuthenticationProvider    │
 * │  → tách logic khởi tạo ra khỏi business logic (SRP)            │
 * └─────────────────────────────────────────────────────────────────┘
 *
 * SOLID áp dụng ở đây:
 * - S: AppConfig chỉ chịu trách nhiệm cấu hình security beans
 * - O: Muốn đổi encoder → tạo subclass / thay @Bean, không sửa code cũ
 * - D: Service inject UserDetailsService (interface), không phụ thuộc impl cụ thể
 */
@Configuration
@RequiredArgsConstructor
@org.springframework.scheduling.annotation.EnableAsync
public class AppConfig {

    private final UserRepository userRepository;

    /**
     * UserDetailsService — Interface (SOLID-D: phụ thuộc interface, không phụ thuộc class)
     * Lambda implementation → Strategy Pattern: có thể swap bằng impl khác
     */
    @Bean
    public UserDetailsService userDetailsService() {
        return username -> userRepository.findByEmail(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + username));
    }

    /**
     * BCrypt: hàm băm 1 chiều với salt ngẫu nhiên
     * cost factor mặc định = 10 → khoảng 100ms/hash → chống brute force
     * Singleton: chỉ 1 instance, thread-safe
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /**
     * DaoAuthenticationProvider — Strategy Pattern:
     * Spring Security dùng AuthenticationProvider interface,
     * swap được giữa Dao / LDAP / OAuth2 mà không đổi SecurityConfig
     */
    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService());
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(
            org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration config
    ) throws Exception {
        return config.getAuthenticationManager();
    }
}