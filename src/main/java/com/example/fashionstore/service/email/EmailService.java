package com.example.fashionstore.service.email;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.module.email.EmailVerificationToken;
import com.example.fashionstore.module.email.PasswordResetToken;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.email.EmailVerificationTokenRepository;
import com.example.fashionstore.repository.email.PasswordResetTokenRepository;
import com.example.fashionstore.repository.user.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;
import java.security.SecureRandom;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender            mailSender;
    private final EmailVerificationTokenRepository evtRepository;
    private final PasswordResetTokenRepository prtRepository;
    private final UserRepository            userRepository;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.mail.from-name}")
    private String mailFromName;

    private static final int OTP_LENGTH       = 6;
    private static final int OTP_EXPIRE_MIN   = 10;   // 10 phút
    private static final int MAX_ATTEMPTS     = 5;

    // ────────────────────────────────────────────────────────────────
    // EMAIL VERIFICATION
    // ────────────────────────────────────────────────────────────────

    /**
     * Tạo OTP mới, lưu DB và gửi email.
     * Gọi sau khi register hoặc khi user yêu cầu gửi lại.
     */
    @Transactional
    public void sendVerificationOtp(User user) {
        // Xoá token cũ nếu có
        evtRepository.deleteByUserId(user.getId());

        String otp = generateOtp();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(user)
                .token(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MIN))
                .build();
        evtRepository.save(token);

        sendEmailAsync(
                user.getEmail(),
                "Xác thực tài khoản – Mã OTP của bạn",
                buildVerificationEmailHtml(user.getName(), otp)
        );
    }

    /**
     * Xác thực OTP email.
     * @return User đã được verify
     */
    @Transactional
    public User verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email không tồn tại"));

        if (user.isEmailVerified())
            throw new BusinessException("Email đã được xác thực trước đó");

        EmailVerificationToken token = evtRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại."));

        if (token.isVerified())
            throw new BusinessException("Mã OTP đã được sử dụng");

        if (token.isExpired())
            throw new BusinessException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");

        if (token.getAttemptCount() >= MAX_ATTEMPTS)
            throw new BusinessException("Bạn đã nhập sai quá " + MAX_ATTEMPTS + " lần. Vui lòng yêu cầu OTP mới.");

        if (!token.getToken().equals(otp.trim())) {
            token.setAttemptCount(token.getAttemptCount() + 1);
            evtRepository.save(token);
            int remaining = MAX_ATTEMPTS - token.getAttemptCount();
            throw new BusinessException("Mã OTP không đúng. Còn " + remaining + " lần thử.");
        }

        // Mark verified
        token.setVerifiedAt(LocalDateTime.now());
        evtRepository.save(token);

        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    /**
     * Gửi lại OTP xác thực email
     */
    @Transactional
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email không tồn tại"));

        if (user.isEmailVerified())
            throw new BusinessException("Email này đã được xác thực");

        sendVerificationOtp(user);
    }

    // ────────────────────────────────────────────────────────────────
    // PASSWORD RESET
    // ────────────────────────────────────────────────────────────────

    /**
     * Gửi OTP reset password.
     * Không tiết lộ email có tồn tại hay không (security best-practice).
     */
    @Transactional
    public void sendPasswordResetOtp(String email) {
        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            // Xoá token cũ
            prtRepository.deleteByUserId(user.getId());

            String otp = generateOtp();
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user)
                    .token(otp)
                    .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MIN))
                    .build();
            prtRepository.save(token);

            sendEmailAsync(
                    user.getEmail(),
                    "Đặt lại mật khẩu – Mã OTP của bạn",
                    buildPasswordResetEmailHtml(user.getName(), otp)
            );
        });
    }

    /**
     * Xác thực OTP reset password — chỉ validate, chưa dùng token.
     */
    @Transactional
    public void validatePasswordResetOtp(String email, String otp) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email không tồn tại"));

        PasswordResetToken token = prtRepository.findLatestByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại."));

        if (token.isUsed())
            throw new BusinessException("Mã OTP đã được sử dụng");

        if (token.isExpired())
            throw new BusinessException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");

        if (!token.getToken().equals(otp.trim()))
            throw new BusinessException("Mã OTP không đúng");
    }

    /**
     * Đặt lại mật khẩu sau khi xác thực OTP thành công.
     */
    @Transactional
    public void resetPassword(String email, String otp, String newEncodedPassword) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email không tồn tại"));

        PasswordResetToken token = prtRepository.findLatestByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy mã OTP"));

        if (token.isUsed() || token.isExpired() || !token.getToken().equals(otp.trim()))
            throw new BusinessException("Mã OTP không hợp lệ hoặc đã hết hạn");

        token.setUsedAt(LocalDateTime.now());
        prtRepository.save(token);

        user.setPassword(newEncodedPassword);
        userRepository.save(user);
    }

    // ────────────────────────────────────────────────────────────────
    // HELPERS
    // ────────────────────────────────────────────────────────────────

    private String generateOtp() {
        SecureRandom rnd = new SecureRandom();
        int num = rnd.nextInt(900000) + 100000; // 100000 – 999999
        return String.valueOf(num);
    }

    @Async
    public void sendEmailAsync(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(mailFrom, mailFromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("Email sent to {}: {}", to, subject);
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    private String buildVerificationEmailHtml(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"><title>Xác thực email</title></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
                  <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;padding:32px">
                    <h2 style="color:#1a1a2e">Xác thực tài khoản</h2>
                    <p>Chào <strong>%s</strong>,</p>
                    <p>Mã OTP xác thực email của bạn là:</p>
                    <div style="text-align:center;margin:24px 0">
                      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#e94560;
                                   background:#fef2f2;padding:12px 24px;border-radius:8px">%s</span>
                    </div>
                    <p>Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
                    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                    <p style="font-size:12px;color:#999">Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.</p>
                  </div>
                </body>
                </html>
                """.formatted(name, otp);
    }

    private String buildPasswordResetEmailHtml(String name, String otp) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"><title>Đặt lại mật khẩu</title></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
                  <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;padding:32px">
                    <h2 style="color:#1a1a2e">Đặt lại mật khẩu</h2>
                    <p>Chào <strong>%s</strong>,</p>
                    <p>Mã OTP để đặt lại mật khẩu của bạn là:</p>
                    <div style="text-align:center;margin:24px 0">
                      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#e94560;
                                   background:#fef2f2;padding:12px 24px;border-radius:8px">%s</span>
                    </div>
                    <p>Mã có hiệu lực trong <strong>10 phút</strong>.</p>
                    <p style="color:#e74c3c"><strong>Quan trọng:</strong> Không chia sẻ mã này với bất kỳ ai, kể cả nhân viên hỗ trợ.</p>
                    <hr style="border:none;border-top:1px solid #eee;margin:24px 0">
                    <p style="font-size:12px;color:#999">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Tài khoản của bạn vẫn an toàn.</p>
                  </div>
                </body>
                </html>
                """.formatted(name, otp);
    }
}