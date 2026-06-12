package com.example.fashionstore.messaging.consumer;

import com.example.fashionstore.config.RabbitMQConfig;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.core.Message;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

/**
 * Lắng nghe Dead Letter Queue — log tất cả message bị reject/lỗi.
 * Trong production, có thể mở rộng để: alert, retry có kiểm soát, lưu DB, v.v.
 */
@Slf4j
@Component
public class DeadLetterConsumer {

    @RabbitListener(queues = RabbitMQConfig.DLX_QUEUE)
    public void handleDeadLetter(Message message) {
        String routingKey  = message.getMessageProperties().getReceivedRoutingKey();
        String exchange    = message.getMessageProperties().getReceivedExchange();
        String body        = new String(message.getBody());
        String deathReason = message.getMessageProperties().getHeader("x-death") != null
                ? message.getMessageProperties().getHeader("x-death").toString()
                : "unknown";

        log.error("[DLX] Dead letter received — exchange={}, routingKey={}, reason={}, body={}",
                exchange, routingKey, deathReason, body);

        // TODO (production): ghi vào bảng failed_messages, gửi alert, v.v.
    }
}
