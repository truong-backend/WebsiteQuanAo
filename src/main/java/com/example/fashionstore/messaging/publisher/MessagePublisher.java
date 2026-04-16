package com.example.fashionstore.messaging.publisher;

import com.example.fashionstore.config.RabbitMQConfig;
import com.example.fashionstore.messaging.dto.EmailOtpMessage;
import com.example.fashionstore.messaging.dto.OrderCreatedMessage;
import com.example.fashionstore.messaging.dto.OrderStatusChangedMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Component;

/**
 * Tập trung toàn bộ logic publish message lên RabbitMQ.
 * Các service khác chỉ cần inject MessagePublisher và gọi phương thức tương ứng.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class MessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    // ── Email: OTP xác thực ─────────────────────────────────────────
    public void publishEmailOtp(EmailOtpMessage message) {
        log.info("[RabbitMQ] Publish EmailOtp → {}", message.getTo());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_EXCHANGE,
                RabbitMQConfig.EMAIL_RK_OTP,
                message
        );
    }

    // ── Email: OTP reset mật khẩu ───────────────────────────────────
    public void publishResetPasswordOtp(EmailOtpMessage message) {
        log.info("[RabbitMQ] Publish ResetPasswordOtp → {}", message.getTo());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.EMAIL_EXCHANGE,
                RabbitMQConfig.EMAIL_RK_RESET_PWD,
                message
        );
    }

    // ── Order: đơn hàng mới tạo ─────────────────────────────────────
    public void publishOrderCreated(OrderCreatedMessage message) {
        log.info("[RabbitMQ] Publish OrderCreated → orderId={}", message.getOrderId());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_EXCHANGE,
                RabbitMQConfig.ORDER_RK_CREATED,
                message
        );
    }

    // ── Order: thay đổi trạng thái ──────────────────────────────────
    public void publishOrderStatusChanged(OrderStatusChangedMessage message) {
        log.info("[RabbitMQ] Publish OrderStatusChanged → orderId={}, {} → {}",
                message.getOrderId(), message.getOldStatus(), message.getNewStatus());
        rabbitTemplate.convertAndSend(
                RabbitMQConfig.ORDER_EXCHANGE,
                RabbitMQConfig.ORDER_RK_STATUS,
                message
        );
    }
}
