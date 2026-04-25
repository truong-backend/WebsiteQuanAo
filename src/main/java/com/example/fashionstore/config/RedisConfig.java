package com.example.fashionstore.config;

import com.fasterxml.jackson.annotation.JsonTypeInfo;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.databind.jsontype.impl.LaissezFaireSubTypeValidator;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.Cache;
import org.springframework.cache.annotation.CachingConfigurerSupport;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.interceptor.CacheErrorHandler;
import org.springframework.cache.interceptor.SimpleCacheErrorHandler;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import org.springframework.data.redis.serializer.StringRedisSerializer;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@Configuration
@EnableCaching
@Slf4j
public class RedisConfig extends CachingConfigurerSupport {

    /**
     * ObjectMapper CHỈ dùng nội bộ cho Redis serialization.
     * KHÔNG đăng ký làm @Bean để tránh Spring MVC inject nhầm vào
     * HttpMessageConverter, gây lỗi "missing type id property '@class'"
     * khi deserialize request body thông thường.
     */
    private static ObjectMapper buildRedisObjectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        mapper.activateDefaultTyping(
                LaissezFaireSubTypeValidator.instance,
                ObjectMapper.DefaultTyping.NON_FINAL,
                JsonTypeInfo.As.PROPERTY
        );
        return mapper;
    }

    // ── RedisTemplate<String, Object> ───────────────────────────────
    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory factory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(factory);

        StringRedisSerializer strSerializer = new StringRedisSerializer();
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(buildRedisObjectMapper());

        template.setKeySerializer(strSerializer);
        template.setHashKeySerializer(strSerializer);
        template.setValueSerializer(jsonSerializer);
        template.setHashValueSerializer(jsonSerializer);
        template.afterPropertiesSet();
        return template;
    }

    // ── CacheManager với TTL tuỳ chỉnh theo từng cache name ─────────
    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory factory) {
        GenericJackson2JsonRedisSerializer jsonSerializer =
                new GenericJackson2JsonRedisSerializer(buildRedisObjectMapper());

        RedisCacheConfiguration defaultConfig = RedisCacheConfiguration.defaultCacheConfig()
                .entryTtl(Duration.ofHours(1))
                .serializeKeysWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(new StringRedisSerializer()))
                .serializeValuesWith(
                        RedisSerializationContext.SerializationPair.fromSerializer(jsonSerializer))
                .disableCachingNullValues();

        Map<String, RedisCacheConfiguration> configs = new HashMap<>();
        configs.put("products",        defaultConfig.entryTtl(Duration.ofMinutes(30)));
        configs.put("product-detail",  defaultConfig.entryTtl(Duration.ofMinutes(30)));
        configs.put("categories",      defaultConfig.entryTtl(Duration.ofHours(6)));
        configs.put("dashboard-stats", defaultConfig.entryTtl(Duration.ofMinutes(5)));
        configs.put("vouchers",        defaultConfig.entryTtl(Duration.ofMinutes(10)));

        return RedisCacheManager.builder(factory)
                .cacheDefaults(defaultConfig)
                .withInitialCacheConfigurations(configs)
                .build();
    }

    /**
     * FIX: CacheErrorHandler — khi Redis lỗi (down, timeout, serialization fail)
     * chỉ log warning thay vì ném exception gây HTTP 500.
     * API vẫn hoạt động bình thường, fallback xuống DB.
     */
    @Override
    public CacheErrorHandler errorHandler() {
        return new SimpleCacheErrorHandler() {
            @Override
            public void handleCacheGetError(RuntimeException e, Cache cache, Object key) {
                log.warn("Redis GET error [cache={}] [key={}]: {}", cache.getName(), key, e.getMessage());
                // Không throw — fallback xuống DB
            }

            @Override
            public void handleCachePutError(RuntimeException e, Cache cache, Object key, Object value) {
                log.warn("Redis PUT error [cache={}] [key={}]: {}", cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCacheEvictError(RuntimeException e, Cache cache, Object key) {
                log.warn("Redis EVICT error [cache={}] [key={}]: {}", cache.getName(), key, e.getMessage());
            }

            @Override
            public void handleCacheClearError(RuntimeException e, Cache cache) {
                log.warn("Redis CLEAR error [cache={}]: {}", cache.getName(), e.getMessage());
            }
        };
    }
}