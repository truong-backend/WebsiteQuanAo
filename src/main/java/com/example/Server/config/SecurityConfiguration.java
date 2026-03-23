package com.example.Server.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

/**
 * Cấu hình Spring Security.
 *
 * <p>Để chuyển môi trường:
 * <ul>
 *   <li>DEV  → giữ {@code @Bean} trên {@code securityFilterChain}</li>
 *   <li>PROD → xóa {@code @Bean} trên {@code securityFilterChain},
 *              thêm {@code @Bean} lên {@code productionFilterChain}</li>
 * </ul>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfiguration {

    private final AuthenticationProvider authenticationProvider;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfiguration(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            AuthenticationProvider authenticationProvider
    ) {
        this.authenticationProvider  = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEV — mở toàn bộ endpoint, JWT filter vẫn chạy để set SecurityContext
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * DEV MODE: anyRequest().permitAll() nhưng JWT filter vẫn được đăng ký.
     * Quan trọng: nếu thiếu addFilterBefore thì mọi endpoint gọi
     * SecurityContextHolder.getCurrentUser() sẽ lỗi "User not authenticated"
     * dù FE đã gửi token đúng.
     */
    // @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .anyRequest().permitAll()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRODUCTION — đổi thành @Bean và xóa @Bean ở method trên khi deploy
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public SecurityFilterChain productionFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC: CORS preflight ────────────────────────────────────
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // ── PUBLIC: Auth ──────────────────────────────────────────────
                        .requestMatchers("/auth/**").permitAll()

                        // ── PUBLIC: Docs ──────────────────────────────────────────────
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // ── PUBLIC: Static files ──────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // ── PUBLIC: Sản phẩm ─────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/listing").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/options").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/path/**").permitAll()

                        // ── PUBLIC: Danh mục ─────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()

                        // ── PUBLIC: Màu, size, variant ────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/colors/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sizes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/product-variants/**").permitAll()

                        // ── PUBLIC: Payment callbacks ─────────────────────────────────
                        .requestMatchers(HttpMethod.GET,  "/payments/vnpay/return").permitAll()
                        .requestMatchers(HttpMethod.GET,  "/payments/vnpay/ipn").permitAll()
                        .requestMatchers(HttpMethod.POST, "/payments/momo/ipn").permitAll()

                        // ── PUBLIC: Liên hệ ───────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/contacts").permitAll()

                        // ── USER + ADMIN: Profile cá nhân ─────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/accounts/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/accounts/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/accounts/me/password").hasAnyRole("USER", "ADMIN")

                        // ── USER + ADMIN: Giỏ hàng ───────────────────────────────────
                        .requestMatchers("/carts/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/cart-items/**").hasAnyRole("USER", "ADMIN")

                        // ── USER + ADMIN: Đặt hàng ───────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/orders").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET,  "/orders/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET,  "/orders/{id}").hasAnyRole("USER", "ADMIN")

                        // ── USER + ADMIN: Thanh toán ─────────────────────────────────
                        .requestMatchers(HttpMethod.POST, "/payments/vnpay/create").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/payments/momo/create").hasAnyRole("USER", "ADMIN")

                        // ── ADMIN: Tài khoản ─────────────────────────────────────────
                        .requestMatchers("/accounts/**").hasRole("ADMIN")

                        // ── ADMIN: Sản phẩm CUD ───────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/products/**").hasRole("ADMIN")

                        // ── ADMIN: Danh mục CUD ───────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/categories/**").hasRole("ADMIN")

                        // ── ADMIN: Màu sắc CUD ────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/colors").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/colors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/colors/**").hasRole("ADMIN")

                        // ── ADMIN: Kích thước CUD ─────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/sizes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/sizes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/sizes/**").hasRole("ADMIN")

                        // ── ADMIN: Biến thể sản phẩm CUD ─────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/product-variants").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/product-variants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/product-variants/**").hasRole("ADMIN")

                        // ── ADMIN: Đơn hàng full ──────────────────────────────────────
                        .requestMatchers(HttpMethod.GET,    "/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/orders/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/orders/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/orders/**").hasRole("ADMIN")

                        // ── ADMIN: OrderItem ──────────────────────────────────────────
                        .requestMatchers("/order-items/**").hasRole("ADMIN")

                        // ── ADMIN: Payment CRUD ───────────────────────────────────────
                        .requestMatchers(HttpMethod.GET,    "/payments").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/payments/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/payments").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/payments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/payments/**").hasRole("ADMIN")

                        // ── ADMIN: Upload ─────────────────────────────────────────────
                        .requestMatchers(HttpMethod.POST,   "/uploads/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/uploads/**").hasRole("ADMIN")

                        // ── ADMIN: Liên hệ ────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET,    "/contacts/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH,  "/contacts/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/contacts/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/contacts/*/reply").hasRole("ADMIN")

                        // ── Mọi request còn lại phải đăng nhập ───────────────────────
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // CORS
    // ─────────────────────────────────────────────────────────────────────────

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}