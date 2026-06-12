package com.example.fashionstore.service.auth;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.config.JwtService;
import com.example.fashionstore.dto.auth.AuthResponse;
import com.example.fashionstore.dto.auth.LoginRequest;
import com.example.fashionstore.dto.auth.RegisterRequest;
import com.example.fashionstore.module.auth.RefreshToken;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.auth.RefreshTokenRepository;
import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository         userRepository;
    private final PasswordEncoder        passwordEncoder;
    private final JwtService             jwtService;
    private final AuthenticationManager  authenticationManager;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.expiration-time}")
    private long accessExpirationMs;

    @Value("${security.jwt.refresh-expiration-time}")
    private long refreshExpirationMs;

    // ── Register ─────────────────────────────────────────────────────

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("Email '" + req.getEmail() + "' đã được sử dụng");

        User user = User.builder()
                .name(req.getName().trim())
                .email(req.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(User.Role.ROLE_USER)
                .build();

        User saved = userRepository.save(user);
        return buildResponse(saved);
    }

    // ── Login ────────────────────────────────────────────────────────

    public AuthResponse login(LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getEmail().toLowerCase().trim(),
                            req.getPassword()
                    )
            );
            User user = (User) auth.getPrincipal();
            // Revoke token cũ khi login lại (tránh nhiều session)
            refreshTokenRepository.revokeAllByUserId(user.getId());
            return buildResponse(user);
        } catch (BadCredentialsException e) {
            throw new BusinessException("Email hoặc mật khẩu không đúng");
        } catch (DisabledException e) {
            throw new BusinessException("Tài khoản của bạn đã bị khoá");
        }
    }

    // ── Refresh ──────────────────────────────────────────────────────

    public AuthResponse refresh(String rawRefreshToken) {
        RefreshToken rt = refreshTokenRepository.findByToken(rawRefreshToken)
                .orElseThrow(() -> new BusinessException("Refresh token không hợp lệ"));

        if (!rt.isValid()) {
            // Có thể là token replay attack — revoke tất cả của user đó
            refreshTokenRepository.revokeAllByUserId(rt.getUser().getId());
            throw new BusinessException("Refresh token đã hết hạn hoặc bị thu hồi. Vui lòng đăng nhập lại.");
        }

        // Token rotation: revoke cái cũ, cấp cái mới
        rt.setRevoked(true);
        refreshTokenRepository.save(rt);

        return buildResponse(rt.getUser());
    }

    // ── Logout ───────────────────────────────────────────────────────

    public void logout(String rawRefreshToken) {
        refreshTokenRepository.findByToken(rawRefreshToken)
                .ifPresent(rt -> {
                    rt.setRevoked(true);
                    refreshTokenRepository.save(rt);
                });
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private AuthResponse buildResponse(User user) {
        String accessToken  = jwtService.generateToken(user);
        String refreshToken = createRefreshToken(user);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(accessExpirationMs / 1000)
                .refreshExpiresIn(refreshExpirationMs / 1000)
                .requiresEmailVerification(false)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .avatarUrl(user.getAvatarUrl())
                        .emailVerified(user.isEmailVerified())
                        .build())
                .build();
    }

    private String createRefreshToken(User user) {
        RefreshToken rt = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .build();
        return refreshTokenRepository.save(rt).getToken();
    }

    /** Dọn DB mỗi ngày lúc 3 giờ sáng */
    @Scheduled(cron = "0 0 3 * * *")
    public void purgeExpiredTokens() {
        refreshTokenRepository.deleteExpiredAndRevoked(Instant.now());
    }
}