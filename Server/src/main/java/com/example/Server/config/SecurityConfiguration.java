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
 * Cấu hình Spring Security cho toàn bộ ứng dụng.
 *
 * <p>Chiến lược phân quyền:
 * <ul>
 *   <li><b>PUBLIC</b>: Auth, Swagger, ảnh tĩnh, xem sản phẩm/danh mục/màu/size, callback thanh toán</li>
 *   <li><b>USER + ADMIN</b>: Profile cá nhân, giỏ hàng, tạo/xem đơn hàng, khởi tạo thanh toán</li>
 *   <li><b>ADMIN only</b>: Quản lý tài khoản, CUD sản phẩm/danh mục/màu/size/variant, quản lý đơn hàng</li>
 * </ul>
 *
 * <p><b>Lưu ý:</b> Hiện tại security đang mở toàn bộ ({@code .anyRequest().permitAll()})
 * để phục vụ giai đoạn development. Bật lại bằng cách comment block hiện tại
 * và bỏ comment block bên dưới khi deploy production.
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
        this.authenticationProvider = authenticationProvider;
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    /**
     * DEV MODE: Tất cả request đều được phép (dùng trong development).
     * Thay bằng {@link #productionFilterChain} khi deploy.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
        return http.build();
    }

    /**
     * PRODUCTION MODE: Bật block này khi deploy thực tế.
     * Đổi tên method thành {@code securityFilterChain} và xóa method dev ở trên.
     */
    private SecurityFilterChain productionFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ── PUBLIC ──────────────────────────────────────────────────────
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Xem sản phẩm
                        .requestMatchers(HttpMethod.GET, "/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/listing").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/options").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/path/**").permitAll()

                        // Xem danh mục
                        .requestMatchers(HttpMethod.GET, "/categories/**").permitAll()

                        // Xem màu, size, variant
                        .requestMatchers(HttpMethod.GET, "/colors/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sizes/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/product-variants/**").permitAll()

                        // Callback thanh toán (không có JWT)
                        .requestMatchers("/payments/vnpay/return").permitAll()
                        .requestMatchers("/payments/vnpay/ipn").permitAll()
                        .requestMatchers("/payments/momo/ipn").permitAll()

                        // ── USER + ADMIN ─────────────────────────────────────────────
                        .requestMatchers(HttpMethod.GET, "/accounts/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/accounts/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/accounts/me/password").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/carts/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/cart-items/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/orders").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orders/{id}").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/payments/vnpay/create").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/payments/momo/create").hasAnyRole("USER", "ADMIN")

                        // ── ADMIN only ──────────────────────────────────────────────
                        .requestMatchers("/accounts/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/colors").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/colors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/colors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/sizes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/sizes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/sizes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/product-variants").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/product-variants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/product-variants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/orders/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/orders/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/orders/**").hasRole("ADMIN")
                        .requestMatchers("/order-items/**").hasRole("ADMIN")
                        .requestMatchers("/payments/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/uploads/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/uploads/**").hasRole("ADMIN")

                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * Cấu hình CORS — cho phép frontend {@code localhost:5173} gọi API.
     * Cập nhật {@code allowedOrigins} khi deploy production.
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
