package com.example.fashionstore.messaging.consumer;

import com.example.fashionstore.config.RabbitMQConfig;
import com.example.fashionstore.messaging.dto.OrderStatusChangedMessage;
import com.example.fashionstore.service.email.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Consumer xử lý các sự kiện liên quan đến trạng thái đơn hàng.
 * Gửi email thông báo khi trạng thái thay đổi.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class OrderConsumer {

    private final EmailService emailService;

    @RabbitListener(queues = RabbitMQConfig.ORDER_QUEUE_STATUS)
    public void handleOrderStatusChanged(OrderStatusChangedMessage message) {
        log.info("[Consumer] OrderStatus changed: orderId={} {} → {}",
                message.getOrderId(), message.getOldStatus(), message.getNewStatus());
        try {
            String shortId  = message.getOrderId().substring(0, 8).toUpperCase();
            String subject  = "Cập nhật đơn hàng #" + shortId;
            String html     = buildStatusChangedHtml(
                    message.getCustomerName(), shortId,
                    translateStatus(message.getOldStatus()),
                    translateStatus(message.getNewStatus())
            );
            emailService.sendEmailAsync(message.getCustomerEmail(), subject, html);
        } catch (Exception e) {
            log.error("[Consumer] Failed to process OrderStatusChanged for orderId={}: {}",
                    message.getOrderId(), e.getMessage());
            throw e; // rethrow → message vào DLX
        }
    }

    // ── Helpers ─────────────────────────────────────────────────────

    private String translateStatus(String status) {
        return switch (status) {
            case "PENDING"    -> "Chờ xác nhận";
            case "CONFIRMED"  -> "Đã xác nhận";
            case "SHIPPING"   -> "Đang giao hàng";
            case "DELIVERED"  -> "Đã giao hàng";
            case "CANCELLED"  -> "Đã huỷ";
            default           -> status;
        };
    }

    private String buildStatusChangedHtml(String name, String shortOrderId,
                                          String oldStatus, String newStatus) {
        String badgeColor = newStatus.contains("Đã giao") ? "#27ae60"
                : newStatus.contains("huỷ")              ? "#e74c3c"
                : "#3498db";

        return """
                <!DOCTYPE html>
                <html lang="vi">
                <head><meta charset="UTF-8"></head>
                <body style="font-family:Arial,sans-serif;background:#f4f4f4;padding:20px">
                  <div style="max-width:500px;margin:auto;background:#fff;border-radius:8px;padding:32px">
                    <h2 style="color:#1a1a2e">🔔 Cập nhật đơn hàng</h2>
                    <p>Chào <strong>%s</strong>,</p>
                    <p>Đơn hàng <strong>#%s</strong> của bạn vừa được cập nhật trạng thái.</p>
                    <table style="width:100%%;border-collapse:collapse;margin:16px 0">
                      <tr style="background:#f8f8f8">
                        <td style="padding:10px;border:1px solid #eee">Trạng thái cũ</td>
                        <td style="padding:10px;border:1px solid #eee;color:#999">%s</td>
                      </tr>
                      <tr>
                        <td style="padding:10px;border:1px solid #eee">Trạng thái mới</td>
                        <td style="padding:10px;border:1px solid #eee">
                          <span style="background:%s;color:#fff;padding:4px 12px;border-radius:4px">%s</span>
                        </td>
                      </tr>
                    </table>
                    <p>Nếu bạn có thắc mắc, vui lòng liên hệ bộ phận hỗ trợ.</p>
                  </div>
                </body>
                </html>
                """.formatted(name, shortOrderId, oldStatus, badgeColor, newStatus);
    }
}
