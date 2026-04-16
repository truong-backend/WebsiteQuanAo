package com.example.fashionstore.messaging.consumer;

import com.example.fashionstore.config.RabbitMQConfig;
import com.example.fashionstore.messaging.dto.EmailOtpMessage;
import com.example.fashionstore.messaging.dto.OrderCreatedMessage;
import com.example.fashionstore.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.text.NumberFormat;
import java.util.Locale;

/**
 * Consumer lắng nghe các queue email và gửi email thực tế.
 * Tất cả việc gửi email đều được thực hiện bất đồng bộ qua RabbitMQ,
 * không block request của user.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmailConsumer {

    private final EmailService emailService;

    // ── OTP xác thực email ───────────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE_OTP)
    public void handleEmailOtp(EmailOtpMessage message) {
        log.info("[Consumer] Received EmailOtp for: {}", message.getTo());
        try {
            String subject = "Xác thực tài khoản – Mã OTP của bạn";
            String html    = buildOtpHtml(message.getOtp(), "xác thực tài khoản");
            emailService.sendEmailAsync(message.getTo(), subject, html);
        } catch (Exception e) {
            log.error("[Consumer] Failed to process EmailOtp for {}: {}", message.getTo(), e.getMessage());
            throw e; // rethrow → message vào DLX
        }
    }

    // ── OTP reset mật khẩu ──────────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE_RESET_PWD)
    public void handleResetPasswordOtp(EmailOtpMessage message) {
        log.info("[Consumer] Received ResetPasswordOtp for: {}", message.getTo());
        try {
            String subject = "Đặt lại mật khẩu – Mã OTP của bạn";
            String html    = buildOtpHtml(message.getOtp(), "đặt lại mật khẩu");
            emailService.sendEmailAsync(message.getTo(), subject, html);
        } catch (Exception e) {
            log.error("[Consumer] Failed to process ResetPasswordOtp for {}: {}", message.getTo(), e.getMessage());
            throw e;
        }
    }

    // ── Email xác nhận đơn hàng ──────────────────────────────────────
    @RabbitListener(queues = RabbitMQConfig.EMAIL_QUEUE_ORDER)
    public void handleOrderEmail(OrderCreatedMessage message) {
        log.info("[Consumer] Received OrderCreated email for orderId={}", message.getOrderId());
        try {
            String formattedAmount = NumberFormat.getNumberInstance(new Locale("vi", "VN"))
                    .format(message.getTotalAmount()) + "₫";

            String subject = "Xác nhận đơn hàng #" + message.getOrderId().substring(0, 8).toUpperCase();
            String html    = buildOrderConfirmationHtml(
                    message.getCustomerName(),
                    message.getOrderId().substring(0, 8).toUpperCase(),
                    formattedAmount
            );
            emailService.sendEmailAsync(message.getCustomerEmail(), subject, html);
        } catch (Exception e) {
            log.error("[Consumer] Failed to process Order email for orderId={}: {}", message.getOrderId(), e.getMessage());
            throw e;
        }
    }

    // ════════════════════════════════════════════════════════════════
    // HTML builders
    // ════════════════════════════════════════════════════════════════

    private String buildOtpHtml(String otp, String purpose) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
                  <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;padding:32px">
                    <h2 style="color:#1a1a2e">Mã OTP %s</h2>
                    <p>Mã OTP của bạn là:</p>
                    <div style="text-align:center;margin:24px 0">
                      <span style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#e94560;
                                   background:#fef2f2;padding:12px 24px;border-radius:8px">%s</span>
                    </div>
                    <p>Mã có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với bất kỳ ai.</p>
                  </div>
                </body>
                </html>
                """.formatted(purpose, otp);
    }

    private String buildOrderConfirmationHtml(String customerName, String shortOrderId, String totalAmount) {
        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
                  <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;padding:32px">
                    <h2 style="color:#1a1a2e">✅ Đặt hàng thành công!</h2>
                    <p>Chào <strong>%s</strong>,</p>
                    <p>Đơn hàng <strong>#%s</strong> của bạn đã được xác nhận.</p>
                    <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                      <tr style="background:#f8f8f8">
                        <td style="padding:10px;border:1px solid #eee">Mã đơn hàng</td>
                        <td style="padding:10px;border:1px solid #eee"><strong>#%s</strong></td>
                      </tr>
                      <tr>
                        <td style="padding:10px;border:1px solid #eee">Tổng tiền</td>
                        <td style="padding:10px;border:1px solid #eee;color:#e94560"><strong>%s</strong></td>
                      </tr>
                    </table>
                    <p>Chúng tôi sẽ thông báo khi đơn hàng được xử lý và vận chuyển.</p>
                    <p>Cảm ơn bạn đã mua sắm tại <strong>Fashion Store</strong>!</p>
                  </div>
                </body>
                </html>
                """.formatted(customerName, shortOrderId, shortOrderId, totalAmount);
    }
}
