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
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter       jwtAuthFilter;
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

                        // Auth
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/health").permitAll()

                        // Swagger UI
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Static files
                        .requestMatchers("/images/**", "/uploads/**").permitAll()

                        // Products — browse
                        .requestMatchers(HttpMethod.GET, "/api/v1/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/products/**").permitAll()

                        // Categories — GET
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()

                        // Colors & Sizes — active list only (public)
                        .requestMatchers(HttpMethod.GET, "/api/v1/colors").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/sizes").permitAll()

                        // VNPay callbacks
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/vnpay/return").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/payments/vnpay/ipn").permitAll()

                        // ════════════════════════════════════════════════════════
                        //  ADMIN ONLY
                        // ════════════════════════════════════════════════════════

                        // Dashboard
                        .requestMatchers("/api/v1/admin/dashboard/**").hasRole("ADMIN")

                        // Reviews — admin management
                        .requestMatchers("/api/v1/admin/reviews/**").hasRole("ADMIN")

                        // User management
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        // Colors — all + CUD
                        .requestMatchers(HttpMethod.GET,    "/api/v1/colors/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/colors").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/colors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/colors/**").hasRole("ADMIN")

                        // Sizes — all + CUD
                        .requestMatchers(HttpMethod.GET,    "/api/v1/sizes/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/sizes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/sizes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/sizes/**").hasRole("ADMIN")

                        // Categories — CUD
                        .requestMatchers(HttpMethod.POST,   "/api/v1/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasRole("ADMIN")

                        // Products — CUD
                        .requestMatchers(HttpMethod.POST,   "/api/v1/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasRole("ADMIN")

                        // Variants — CUD
                        .requestMatchers(HttpMethod.POST,   "/api/v1/products/*/variants").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/products/*/variants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/*/variants/**").hasRole("ADMIN")

                        // Upload
                        .requestMatchers(HttpMethod.POST, "/api/v1/upload/**").hasRole("ADMIN")

                        // Orders — admin list + status update
                        .requestMatchers(HttpMethod.GET,   "/api/v1/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/orders/*/status").hasRole("ADMIN")

                        // Payments — admin actions
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/cod/confirm/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/refund/**").hasRole("ADMIN")

                        // Vouchers — GET all list và CUD chỉ admin
                        //  POST /vouchers/apply (user dùng) được xử lý bên dưới (authenticated)
                        .requestMatchers(HttpMethod.GET,    "/api/v1/vouchers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/v1/vouchers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/vouchers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/vouchers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/vouchers/**").hasRole("ADMIN")

                        // ════════════════════════════════════════════════════════
                        //  AUTHENTICATED — đã đăng nhập
                        // ════════════════════════════════════════════════════════
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