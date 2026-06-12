package com.example.fashionstore.config;

import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    private static final String ADMIN_EMAIL    = "admin@gmail.com";
    private static final String ADMIN_PASSWORD = "Admin@123";
    private static final String ADMIN_NAME     = "Admin";
    private static final String ADMIN_PHONE    = "0000000000";

    @Override
    public void run(ApplicationArguments args) {
        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            User admin = User.builder()
                    .name(ADMIN_NAME)
                    .email(ADMIN_EMAIL)
                    .password(passwordEncoder.encode(ADMIN_PASSWORD))
                    .phone(ADMIN_PHONE)
                    .role(User.Role.ROLE_ADMIN)
                    .enabled(true)
                    .emailVerified(true)
                    .build();

            userRepository.save(admin);
            log.info("✅ Đã tạo tài khoản admin mặc định: {}", ADMIN_EMAIL);
        } else {
            log.info("ℹ️  Tài khoản admin đã tồn tại, bỏ qua khởi tạo.");
        }
    }
}