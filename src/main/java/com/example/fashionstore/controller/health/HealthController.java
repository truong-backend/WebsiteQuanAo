package com.example.fashionstore.controller.health;

import lombok.RequiredArgsConstructor;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

/**
 * Endpoint kiểm tra trạng thái kết nối Redis và RabbitMQ.
 * GET /api/v1/health
 */
@RestController
@RequestMapping("/api/v1/health")
@RequiredArgsConstructor
public class HealthController {

    private final RedisTemplate<String, Object> redisTemplate;
    private final RabbitTemplate                rabbitTemplate;

    @GetMapping
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> status = new HashMap<>();

        // ── Redis ping ───────────────────────────────────────────────
        try {
            String pong = (String) redisTemplate.getConnectionFactory()
                    .getConnection().ping();
            status.put("redis", Map.of("status", "UP", "response", pong));
        } catch (Exception e) {
            status.put("redis", Map.of("status", "DOWN", "error", e.getMessage()));
        }

        // ── RabbitMQ ping ────────────────────────────────────────────
        try {
            rabbitTemplate.getConnectionFactory().createConnection().close();
            status.put("rabbitmq", Map.of("status", "UP"));
        } catch (Exception e) {
            status.put("rabbitmq", Map.of("status", "DOWN", "error", e.getMessage()));
        }

        status.put("app", "UP");
        return ResponseEntity.ok(status);
    }
}
