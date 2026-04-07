package com.example.fashionstore.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.*;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.*;
import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // Cho phép @PreAuthorize trên Controller
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final AuthenticationProvider authProvider;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ════════════════════════════════════════════════════════
                        //  PUBLIC — không cần token
                        // ════════════════════════════════════════════════════════

                        // Auth: register, login, verify-email, resend-otp,
                        //       forgot-password, verify-reset-otp, reset-password,
                        //       refresh, logout
                        .requestMatchers("/api/v1/auth/**").permitAll()

                        // Swagger UI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Static files served by Spring (images, uploads)
                        .requestMatchers("/images/**", "/uploads/**").permitAll()

                        // Products — browse (GET list, GET by id, GET by slug)
                        .requestMatchers(HttpMethod.GET, "/api/v1/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()   // /{id}, /slug/**, /*/variants, /*/variants/**, /*/reviews

                        // Categories — GET list, GET roots
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll() // /roots, /{id}

                        // Colors & Sizes — GET active list (public filter bar)
                        // NOTE: GET /colors/all và GET /sizes/all (admin) được chặn phía dưới
                        //       Spring Security đánh giá rule theo thứ tự → /all phải đứng TRƯỚC /**
                        .requestMatchers(HttpMethod.GET, "/api/v1/colors").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/sizes").permitAll()

                        // VNPay callbacks — VNPay server gọi trực tiếp, không mang token
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/vnpay/return").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/vnpay/ipn").permitAll()

                        // ════════════════════════════════════════════════════════
                        //  ADMIN ONLY — hasRole("ADMIN")
                        //  (defense-in-depth: controller đã có @PreAuthorize)
                        // ════════════════════════════════════════════════════════

                        // User management: GET/PUT/DELETE /admin/users/**,
                        //                  PATCH /admin/users/{id}/status|role
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // Colors — all (inactive included), CUD
                        .requestMatchers(HttpMethod.GET,    "/api/v1/colors/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/colors").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/colors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/colors/**").hasRole("ADMIN")

                        // Sizes — all (inactive included), CUD
                        .requestMatchers(HttpMethod.GET,    "/api/v1/sizes/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/sizes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/sizes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/sizes/**").hasRole("ADMIN")

                        // Categories — CUD (GET đã permit all bên trên)
                        .requestMatchers(HttpMethod.POST,   "/api/v1/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasRole("ADMIN")

                        // Products — CUD (GET đã permit all bên trên)
                        .requestMatchers(HttpMethod.POST,   "/api/v1/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasRole("ADMIN")

                        // Variants — CUD  (GET đã permit all qua /products/**)
                        .requestMatchers(HttpMethod.POST,   "/api/v1/products/*/variants").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/products/*/variants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/*/variants/**").hasRole("ADMIN")

                        // Upload image — admin only (FE comment: "Admin only")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/upload/**").hasRole("ADMIN")

                        // Orders — admin: GET all list, PATCH status
                        .requestMatchers(HttpMethod.GET,    "/api/v1/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/api/v1/orders/*/status").hasRole("ADMIN")

                        // Payments — admin: COD confirm, refund
                        .requestMatchers(HttpMethod.POST,   "/api/v1/payments/cod/confirm/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/payments/refund/**").hasRole("ADMIN")

                        // ════════════════════════════════════════════════════════
                        //  AUTHENTICATED — đã đăng nhập (user hoặc admin)
                        // ════════════════════════════════════════════════════════
                        // Cart:    GET/POST /cart, PUT/DELETE /cart/items/**, DELETE /cart
                        // Orders:  POST /orders, GET /orders/my, GET /orders/{id}, POST /orders/{id}/cancel
                        // Payments: GET /payments/order/{id}, GET /payments/{id},
                        //           POST /payments/vnpay/create/{id}
                        // Reviews: POST /products/*/reviews, DELETE /products/*/reviews/**
                        // Users:   GET/PUT /users/me, POST /users/me/change-password
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOriginPatterns(List.of("*"));
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}