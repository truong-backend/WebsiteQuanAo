package com.example.fashionstore.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.config.SimpleRabbitListenerContainerFactory;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // ════════════════════════════════════════════════════════════════
    // CONSTANTS — Exchange / Queue / Routing key names
    // ════════════════════════════════════════════════════════════════

    // ── Email ────────────────────────────────────────────────────────
    public static final String EMAIL_EXCHANGE        = "email.exchange";
    public static final String EMAIL_QUEUE_OTP       = "email.otp.queue";
    public static final String EMAIL_QUEUE_ORDER     = "email.order.queue";
    public static final String EMAIL_QUEUE_RESET_PWD = "email.reset-password.queue";
    public static final String EMAIL_RK_OTP          = "email.otp";
    public static final String EMAIL_RK_ORDER        = "email.order";
    public static final String EMAIL_RK_RESET_PWD    = "email.reset-password";

    // ── Order ────────────────────────────────────────────────────────
    public static final String ORDER_EXCHANGE        = "order.exchange";
    public static final String ORDER_QUEUE_CREATED   = "order.created.queue";
    public static final String ORDER_QUEUE_STATUS    = "order.status-changed.queue";
    public static final String ORDER_RK_CREATED      = "order.created";
    public static final String ORDER_RK_STATUS       = "order.status-changed";

    // ── Dead-Letter (DLX) ────────────────────────────────────────────
    public static final String DLX_EXCHANGE          = "dlx.exchange";
    public static final String DLX_QUEUE             = "dlx.queue";

    // ════════════════════════════════════════════════════════════════
    // MESSAGE CONVERTER (JSON)
    // ════════════════════════════════════════════════════════════════

    @Bean
    public MessageConverter messageConverter() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return new Jackson2JsonMessageConverter(mapper);
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(messageConverter());
        return template;
    }

    @Bean
    public SimpleRabbitListenerContainerFactory rabbitListenerContainerFactory(
            ConnectionFactory connectionFactory) {
        SimpleRabbitListenerContainerFactory factory = new SimpleRabbitListenerContainerFactory();
        factory.setConnectionFactory(connectionFactory);
        factory.setMessageConverter(messageConverter());
        factory.setDefaultRequeueRejected(false); // route to DLX on failure
        return factory;
    }

    // ════════════════════════════════════════════════════════════════
    // DEAD-LETTER EXCHANGE + QUEUE
    // ════════════════════════════════════════════════════════════════

    @Bean
    public DirectExchange dlxExchange() {
        return new DirectExchange(DLX_EXCHANGE, true, false);
    }

    @Bean
    public Queue dlxQueue() {
        return QueueBuilder.durable(DLX_QUEUE).build();
    }

    @Bean
    public Binding dlxBinding() {
        return BindingBuilder.bind(dlxQueue()).to(dlxExchange()).with(DLX_QUEUE);
    }

    // ════════════════════════════════════════════════════════════════
    // EMAIL EXCHANGE + QUEUES
    // ════════════════════════════════════════════════════════════════

    @Bean
    public TopicExchange emailExchange() {
        return new TopicExchange(EMAIL_EXCHANGE, true, false);
    }

    @Bean
    public Queue emailOtpQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE_OTP)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_QUEUE)
                .build();
    }

    @Bean
    public Queue emailOrderQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE_ORDER)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_QUEUE)
                .build();
    }

    @Bean
    public Queue emailResetPwdQueue() {
        return QueueBuilder.durable(EMAIL_QUEUE_RESET_PWD)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_QUEUE)
                .build();
    }

    @Bean
    public Binding emailOtpBinding()      { return BindingBuilder.bind(emailOtpQueue()).to(emailExchange()).with(EMAIL_RK_OTP); }
    @Bean
    public Binding emailOrderBinding()    { return BindingBuilder.bind(emailOrderQueue()).to(emailExchange()).with(EMAIL_RK_ORDER); }
    @Bean
    public Binding emailResetPwdBinding() { return BindingBuilder.bind(emailResetPwdQueue()).to(emailExchange()).with(EMAIL_RK_RESET_PWD); }

    // ════════════════════════════════════════════════════════════════
    // ORDER EXCHANGE + QUEUES
    // ════════════════════════════════════════════════════════════════

    @Bean
    public TopicExchange orderExchange() {
        return new TopicExchange(ORDER_EXCHANGE, true, false);
    }

    @Bean
    public Queue orderCreatedQueue() {
        return QueueBuilder.durable(ORDER_QUEUE_CREATED)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_QUEUE)
                .build();
    }

    @Bean
    public Queue orderStatusQueue() {
        return QueueBuilder.durable(ORDER_QUEUE_STATUS)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLX_QUEUE)
                .build();
    }

    @Bean
    public Binding orderCreatedBinding() {
        return BindingBuilder.bind(orderCreatedQueue()).to(orderExchange()).with(ORDER_RK_CREATED);
    }

    @Bean
    public Binding orderStatusBinding() {
        return BindingBuilder.bind(orderStatusQueue()).to(orderExchange()).with(ORDER_RK_STATUS);
    }
}
