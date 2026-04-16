package com.example.fashionstore.service.email;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.messaging.dto.EmailOtpMessage;
import com.example.fashionstore.messaging.publisher.MessagePublisher;
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

    private final JavaMailSender                    mailSender;
    private final EmailVerificationTokenRepository  evtRepository;
    private final PasswordResetTokenRepository      prtRepository;
    private final UserRepository                    userRepository;
    private final MessagePublisher                  messagePublisher;

    @Value("${app.mail.from}")
    private String mailFrom;

    @Value("${app.mail.from-name}")
    private String mailFromName;

    private static final int OTP_LENGTH     = 6;
    private static final int OTP_EXPIRE_MIN = 10;
    private static final int MAX_ATTEMPTS   = 5;

    // ── EMAIL VERIFICATION ──────────────────────────────────────────

    @Transactional
    public void sendVerificationOtp(User user) {
        evtRepository.deleteByUserId(user.getId());
        String otp = generateOtp();
        EmailVerificationToken token = EmailVerificationToken.builder()
                .user(user).token(otp)
                .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MIN))
                .build();
        evtRepository.save(token);
        messagePublisher.publishEmailOtp(
                EmailOtpMessage.builder().to(user.getEmail()).otp(otp).type("VERIFY").build());
    }

    @Transactional
    public User verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email không tồn tại"));
        if (user.isEmailVerified()) throw new BusinessException("Email đã được xác thực trước đó");
        EmailVerificationToken token = evtRepository.findByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại."));
        if (token.isVerified()) throw new BusinessException("Mã OTP đã được sử dụng");
        if (token.isExpired()) throw new BusinessException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");
        if (token.getAttemptCount() >= MAX_ATTEMPTS)
            throw new BusinessException("Bạn đã nhập sai quá " + MAX_ATTEMPTS + " lần. Vui lòng yêu cầu OTP mới.");
        if (!token.getToken().equals(otp.trim())) {
            token.setAttemptCount(token.getAttemptCount() + 1);
            evtRepository.save(token);
            throw new BusinessException("Mã OTP không đúng. Còn " + (MAX_ATTEMPTS - token.getAttemptCount()) + " lần thử.");
        }
        token.setVerifiedAt(LocalDateTime.now());
        evtRepository.save(token);
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    @Transactional
    public void resendVerificationOtp(String email) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email không tồn tại"));
        if (user.isEmailVerified()) throw new BusinessException("Email này đã được xác thực");
        sendVerificationOtp(user);
    }

    // ── PASSWORD RESET ──────────────────────────────────────────────

    @Transactional
    public void sendPasswordResetOtp(String email) {
        userRepository.findByEmail(email.toLowerCase().trim()).ifPresent(user -> {
            prtRepository.deleteByUserId(user.getId());
            String otp = generateOtp();
            PasswordResetToken token = PasswordResetToken.builder()
                    .user(user).token(otp)
                    .expiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRE_MIN))
                    .build();
            prtRepository.save(token);
            messagePublisher.publishResetPasswordOtp(
                    EmailOtpMessage.builder().to(user.getEmail()).otp(otp).type("RESET_PASSWORD").build());
        });
    }

    @Transactional
    public void validatePasswordResetOtp(String email, String otp) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new BusinessException("Email không tồn tại"));
        PasswordResetToken token = prtRepository.findLatestByUserId(user.getId())
                .orElseThrow(() -> new BusinessException("Không tìm thấy mã OTP. Vui lòng yêu cầu gửi lại."));
        if (token.isUsed()) throw new BusinessException("Mã OTP đã được sử dụng");
        if (token.isExpired()) throw new BusinessException("Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.");
        if (!token.getToken().equals(otp.trim())) throw new BusinessException("Mã OTP không đúng");
    }

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

    // ── INTERNAL: gửi email thực tế (dùng bởi EmailConsumer) ────────

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
            throw new RuntimeException("Email send failed", e);
        }
    }

    private String generateOtp() {
        return String.valueOf(new SecureRandom().nextInt(900000) + 100000);
    }
}
