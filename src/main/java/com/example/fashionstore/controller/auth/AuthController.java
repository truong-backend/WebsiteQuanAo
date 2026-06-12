package com.example.fashionstore.controller.auth;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.config.JwtService;
import com.example.fashionstore.dto.auth.*;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.service.auth.AuthService;
import com.example.fashionstore.service.email.EmailService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService    authService;
    private final EmailService   emailService;
    private final JwtService     jwtService;
    private final PasswordEncoder passwordEncoder;

    /** POST /api/v1/auth/register */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest req) {
        AuthResponse res = authService.register(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                ApiResponse.ok("Đăng ký thành công. Vui lòng kiểm tra email để xác thực tài khoản.", res)
        );
    }

    /** POST /api/v1/auth/login */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Đăng nhập thành công", authService.login(req)));
    }

    /** POST /api/v1/auth/refresh — Cấp access token mới từ refresh token */
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<AuthResponse>> refresh(
            @Valid @RequestBody RefreshRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Token đã được làm mới", authService.refresh(req.getRefreshToken())));
    }

    /** POST /api/v1/auth/logout — Revoke refresh token */
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(
            @Valid @RequestBody RefreshRequest req) {
        authService.logout(req.getRefreshToken());
        return ResponseEntity.ok(ApiResponse.ok("Đăng xuất thành công", null));
    }

    // ── Email Verification ───────────────────────────────────────────

    /**
     * POST /api/v1/auth/verify-email
     * Body: { "email": "...", "otp": "123456" }
     * Trả về JWT token sau khi xác thực thành công
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<AuthResponse>> verifyEmail(@Valid @RequestBody VerifyEmailRequest req) {
        User verified = emailService.verifyEmail(req.getEmail(), req.getOtp());
        String token  = jwtService.generateToken(verified);

        AuthResponse res = AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(3600)
                .requiresEmailVerification(false)
                .user(AuthResponse.UserInfo.builder()
                        .id(verified.getId())
                        .name(verified.getName())
                        .email(verified.getEmail())
                        .role(verified.getRole().name())
                        .avatarUrl(verified.getAvatarUrl())
                        .emailVerified(true)
                        .build())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Xác thực email thành công", res));
    }

    /**
     * POST /api/v1/auth/resend-otp
     * Body: { "email": "..." }
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<Void>> resendOtp(@Valid @RequestBody ResendOtpRequest req) {
        emailService.resendVerificationOtp(req.getEmail());
        return ResponseEntity.ok(ApiResponse.ok("Mã OTP đã được gửi lại. Vui lòng kiểm tra email.", null));
    }

    // ── Password Reset ───────────────────────────────────────────────

    /**
     * POST /api/v1/auth/forgot-password
     * Body: { "email": "..." }
     * Luôn trả 200 để không tiết lộ email có tồn tại hay không
     */
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest req) {
        emailService.sendPasswordResetOtp(req.getEmail());
        return ResponseEntity.ok(ApiResponse.ok(
                "Nếu email tồn tại, mã OTP đã được gửi. Vui lòng kiểm tra hộp thư.", null
        ));
    }

    /**
     * POST /api/v1/auth/verify-reset-otp
     * Xác thực OTP trước khi cho phép đặt lại mật khẩu
     */
    @PostMapping("/verify-reset-otp")
    public ResponseEntity<ApiResponse<Void>> verifyResetOtp(@Valid @RequestBody VerifyEmailRequest req) {
        emailService.validatePasswordResetOtp(req.getEmail(), req.getOtp());
        return ResponseEntity.ok(ApiResponse.ok("Mã OTP hợp lệ. Bạn có thể đặt lại mật khẩu.", null));
    }

    /**
     * POST /api/v1/auth/reset-password
     * Body: { "email": "...", "otp": "...", "newPassword": "..." }
     */
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest req) {
        emailService.resetPassword(
                req.getEmail(),
                req.getOtp(),
                passwordEncoder.encode(req.getNewPassword())
        );
        return ResponseEntity.ok(ApiResponse.ok("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.", null));
    }
}