// JwtService.java — HIỆN TẠI ĐÃ ĐÚNG, chỉ thêm comment giải thích
package com.example.fashionstore.config;

import io.jsonwebtoken.*;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

/**
 * JWT — JSON Web Token gồm 3 phần: Header.Payload.Signature (Base64URL encoded)
 *
 * ┌─────────────────────────────────────────────────────────────┐
 * │  Header: {"alg":"HS256","typ":"JWT"}                        │
 * │  Payload: {"sub":"user@email.com","iat":...,"exp":...}      │
 * │  Signature: HMAC-SHA256(header+payload, secretKey)         │
 * └─────────────────────────────────────────────────────────────┘
 *
 * - Stateless: server không lưu session → phù hợp kiến trúc scale ngang
 * - secretKey lưu dưới dạng BASE64 trong .env → decode ra byte[] để tạo HMAC key
 * - Access token TTL ngắn (15-60 phút) + Refresh token rotation để bảo mật
 *
 * Singleton: @Service → Spring IoC container quản lý, chỉ tạo 1 instance
 */
@Service
public class JwtService {

    @Value("${security.jwt.secret-key}")
    private String secretKey;

    @Value("${security.jwt.expiration-time}")
    private long expirationMs;

    public String generateToken(UserDetails user) {
        return generateToken(new HashMap<>(), user);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails user) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(user.getUsername())          // sub = email
                .setIssuedAt(new Date())                  // iat
                .setExpiration(new Date(System.currentTimeMillis() + expirationMs)) // exp
                .signWith(getSignKey(), SignatureAlgorithm.HS256) // HMAC-SHA256
                .compact();
    }

    /**
     * Validate: kiểm tra username khớp VÀ token chưa hết hạn
     * Deadlock-safe: method này chỉ đọc, không có lock
     */
    public boolean isTokenValid(String token, UserDetails user) {
        return extractUsername(token).equals(user.getUsername()) && !isTokenExpired(token);
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    /**
     * extractClaim dùng Function<Claims, T> — Strategy Pattern:
     * caller tự truyền vào hàm xử lý Claims, không cần method riêng cho từng field
     */
    private <T> T extractClaim(String token, Function<Claims, T> fn) {
        return fn.apply(Jwts.parserBuilder()
                .setSigningKey(getSignKey()).build()
                .parseClaimsJws(token).getBody());
    }

    private Key getSignKey() {
        // Decode BASE64 → byte[] → tạo HMAC key
        return Keys.hmacShaKeyFor(Decoders.BASE64.decode(secretKey));
    }
}