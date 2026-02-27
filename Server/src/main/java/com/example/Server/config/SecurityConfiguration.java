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

//    @Bean
//    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
//        http
//                // CORS
//                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
//
//                // Tắt CSRF (bắt buộc với REST + upload)
//                .csrf(csrf -> csrf.disable())
//
//                // Không dùng session
//                .sessionManagement(session ->
//                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
//                )
//
//                // Phân quyền
//                .authorizeHttpRequests(auth -> auth
//                        // AUTH + SWAGGER
//                        .requestMatchers(
//                                "/auth/**",
//                                "/swagger-ui/**",
//                                "/v3/api-docs/**"
//                        ).permitAll()
//
//                        // UPLOAD ẢNH (POST + GET + DELETE)
//                        .requestMatchers(HttpMethod.POST, "/uploads/**").permitAll()
//                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()
//                        .requestMatchers(HttpMethod.DELETE, "/uploads/**").permitAll()  // ← CHỖ NÀY THÊM VÀO
//                        .requestMatchers(HttpMethod.GET, "/images/**").permitAll()
//
//                        // CÁC API KHÁC
//                        .requestMatchers(
//                                "/carts/**",
//                                "/cart-items/**",
//                                "/categories/**",
//                                "/colors/**",
//                                "/orders/**",
//                                "/order-items/**",
//                                "/payments/**",
//                                "/products/**",
//                                "/product-types/**",
//                                "/product-variants/**",
//                                "/sizes/**",
//                                "/accounts/**"
//
//                        ).permitAll()
//
//                        // Còn lại phải đăng nhập
//                        .anyRequest().authenticated()
//                )
//
//                // Provider + JWT filter
//                .authenticationProvider(authenticationProvider)
//                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
//
//        return http.build();
//    }
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session ->
                    session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                    .anyRequest().permitAll()   // ✅ Cho phép tất cả
            );

    return http.build();
}
    /**
     * CORS CONFIG
     */
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(List.of("http://localhost:5173"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);

        return source;
    }
}