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

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth

                        // ─── PUBLIC ───────────────────────────────────────────────────────────

                        // Auth: đăng ký, đăng nhập
                        .requestMatchers("/auth/**").permitAll()

                        // Swagger
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // Static images
                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll()

                        // Upload ảnh - chỉ ADMIN thao tác, nhưng GET ảnh public
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Xem sản phẩm (public - khách hàng duyệt shop)
                        .requestMatchers(HttpMethod.GET, "/products").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/listing").permitAll()
                        .requestMatchers(HttpMethod.GET, "/products/options").permitAll()

                        // Xem danh mục (public)
                        .requestMatchers(HttpMethod.GET, "/categories").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/tree").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/options").permitAll()
                        .requestMatchers(HttpMethod.GET, "/categories/options/root").permitAll()

                        // Xem màu sắc, kích thước (public - cần cho filter sản phẩm)
                        .requestMatchers(HttpMethod.GET, "/colors").permitAll()
                        .requestMatchers(HttpMethod.GET, "/colors/{code}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/colors/options").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sizes").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sizes/{id}").permitAll()
                        .requestMatchers(HttpMethod.GET, "/sizes/options").permitAll()

                        // Xem biến thể sản phẩm (public)
                        .requestMatchers(HttpMethod.GET, "/product-variants").permitAll()
                        .requestMatchers(HttpMethod.GET, "/product-variants/{id}").permitAll()

                        // VNPay / MoMo return & IPN (callback từ cổng thanh toán - không có token)
                        .requestMatchers("/payments/vnpay/return").permitAll()
                        .requestMatchers("/payments/vnpay/ipn").permitAll()
                        .requestMatchers("/payments/momo/ipn").permitAll()

                        // ─── ROLE_USER + ROLE_ADMIN ───────────────────────────────────────────

                        // Profile cá nhân
                        .requestMatchers(HttpMethod.GET, "/accounts/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/accounts/me").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/accounts/me/password").hasAnyRole("USER", "ADMIN")

                        // Giỏ hàng - USER tự quản lý giỏ hàng của mình
                        .requestMatchers("/carts/**").hasAnyRole("USER", "ADMIN")
                        .requestMatchers("/cart-items/**").hasAnyRole("USER", "ADMIN")

                        // Đơn hàng - USER tạo đơn, xem đơn của mình
                        .requestMatchers(HttpMethod.POST, "/orders").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.GET, "/orders/{id}").hasAnyRole("USER", "ADMIN")

                        // Thanh toán - USER khởi tạo thanh toán
                        .requestMatchers(HttpMethod.POST, "/payments/vnpay/create").hasAnyRole("USER", "ADMIN")
                        .requestMatchers(HttpMethod.POST, "/payments/momo/create").hasAnyRole("USER", "ADMIN")

                        // ─── ROLE_ADMIN only ──────────────────────────────────────────────────

                        // Quản lý tài khoản
                        .requestMatchers("/accounts/**").hasRole("ADMIN")

                        // Quản lý sản phẩm (CUD)
                        .requestMatchers(HttpMethod.POST, "/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/products/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/products/{id}").hasRole("ADMIN")

                        // Quản lý danh mục (CUD)
                        .requestMatchers(HttpMethod.POST, "/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/categories/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/categories/{id}").hasRole("ADMIN")

                        // Quản lý màu sắc (CUD)
                        .requestMatchers(HttpMethod.POST, "/colors").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/colors/{code}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/colors/{code}").hasRole("ADMIN")

                        // Quản lý kích thước (CUD)
                        .requestMatchers(HttpMethod.POST, "/sizes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/sizes/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/sizes/{id}").hasRole("ADMIN")

                        // Quản lý biến thể sản phẩm (CUD)
                        .requestMatchers(HttpMethod.POST, "/product-variants").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/product-variants/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/product-variants/{id}").hasRole("ADMIN")

                        // Quản lý product type
                        .requestMatchers("/product-types/**").hasRole("ADMIN")

                        // Quản lý đơn hàng (full access)
                        .requestMatchers(HttpMethod.GET, "/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/orders/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/orders/{id}").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/orders/{id}/status").hasRole("ADMIN")

                        // Quản lý order items
                        .requestMatchers("/order-items/**").hasRole("ADMIN")

                        // Quản lý payments (full access)
                        .requestMatchers("/payments/**").hasRole("ADMIN")

                        // Upload ảnh (POST, DELETE)
                        .requestMatchers(HttpMethod.POST, "/uploads/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/uploads/**").hasRole("ADMIN")

                        // Bất kỳ request nào còn lại phải đăng nhập
                        .anyRequest().authenticated()
                )
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

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