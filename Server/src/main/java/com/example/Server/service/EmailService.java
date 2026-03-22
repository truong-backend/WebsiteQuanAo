package com.example.Server.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

/**
 * Service gửi email thông qua JavaMailSender (Spring Mail).
 *
 * <p>Cấu hình trong {@code application.properties}:
 * <pre>
 * spring.mail.host=smtp.gmail.com
 * spring.mail.port=587
 * spring.mail.username=your-email@gmail.com
 * spring.mail.password=your-app-password
 * spring.mail.properties.mail.smtp.auth=true
 * spring.mail.properties.mail.smtp.starttls.enable=true
 * app.mail.from=your-email@gmail.com
 * app.mail.from-name=Shop Support
 * </pre>
 */
@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.from}")
    private String fromEmail;

    @Value("${app.mail.from-name:Shop Support}")
    private String fromName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Gửi email HTML đơn giản.
     *
     * @param toEmail   địa chỉ email người nhận
     * @param toName    tên người nhận (dùng trong greeting)
     * @param subject   tiêu đề email
     * @param htmlBody  nội dung HTML của email
     * @throws RuntimeException nếu gửi thất bại
     */
    public void sendHtml(String toEmail, String toName, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = HTML

            mailSender.send(message);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            throw new RuntimeException("Gửi email thất bại: " + e.getMessage(), e);
        }
    }

    /**
     * Xây dựng HTML template cho email phản hồi liên hệ.
     *
     * @param recipientName tên người nhận
     * @param replyBody     nội dung phản hồi (plain text, sẽ được wrap trong HTML)
     * @return chuỗi HTML hoàn chỉnh
     */
    public String buildReplyTemplate(String recipientName, String replyBody) {
        // Convert newline → <br> để hiển thị đúng trong email HTML
        String formattedBody = replyBody
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\n", "<br>");

        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                  <div style="border-bottom: 3px solid #2563eb; padding-bottom: 16px; margin-bottom: 24px;">
                    <h2 style="color: #2563eb; margin: 0;">Phản hồi liên hệ</h2>
                  </div>
                  <p>Xin chào <strong>%s</strong>,</p>
                  <div style="background: #f9fafb; border-left: 4px solid #2563eb; padding: 16px; border-radius: 4px; margin: 20px 0;">
                    %s
                  </div>
                  <p style="color: #6b7280; font-size: 0.875rem; margin-top: 32px; border-top: 1px solid #e5e7eb; padding-top: 16px;">
                    Email này được gửi tự động từ hệ thống. Vui lòng không trả lời email này.
                  </p>
                </body>
                </html>
                """.formatted(recipientName, formattedBody);
    }
}
