package com.example.fashionstore.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SecurityConfig — SOLID + Strategy Pattern + Rate Limiting
 *
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║  SOLID áp dụng:                                                  ║
 * ║  S: SecurityConfig chỉ config security, không làm việc khác     ║
 * ║  O: Thêm rule mới → chỉ thêm .requestMatchers(), không sửa cũ  ║
 * ║  L: SecurityFilterChain có thể thay thế bằng custom chain       ║
 * ║  I: JwtAuthFilter chỉ implement OncePerRequestFilter (1 nhiệm vụ)║
 * ║  D: Phụ thuộc vào AuthenticationProvider (interface), không impl ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  STRATEGY PATTERN:                                               ║
 * ║  - CorsConfigurationSource: strategy cho CORS policy            ║
 * ║  - AuthenticationProvider: strategy cho auth mechanism          ║
 * ║  - SessionCreationPolicy.STATELESS: strategy cho session mgmt   ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  RATE LIMITING (Token Bucket Algorithm):                         ║
 * ║  - Mỗi IP có 1 Bucket với capacity = 20 request/phút            ║
 * ║  - Refill: nạp lại 20 token mỗi phút                            ║
 * ║  - Khi bucket rỗng → trả 429 Too Many Requests                  ║
 * ║  - Map<IP, Bucket>: HashMap O(1) lookup, ConcurrentHashMap      ║
 * ║    để thread-safe (nhiều request đến cùng lúc)                  ║
 * ╠══════════════════════════════════════════════════════════════════╣
 * ║  LUỒNG (Thread/Process):                                         ║
 * ║  - Mỗi HTTP request chạy trên 1 thread riêng trong thread pool  ║
 * ║  - SecurityFilterChain là chain of filters, FIFO (Queue order)  ║
 * ║    JwtAuthFilter → UsernamePasswordAuthFilter → ... → Controller║
 * ╚══════════════════════════════════════════════════════════════════╝
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter             jwtAuthFilter;
    private final AuthenticationProvider    authProvider;
    private final CustomOAuth2UserService   oauth2UserService;
    private final OAuth2SuccessHandler      oauth2SuccessHandler;

    /**
     * Rate Limiting — Token Bucket Algorithm
     * ConcurrentHashMap: thread-safe Map, nhiều thread đọc/ghi song song không race condition
     * Key: IP address (String), Value: Bucket (token bucket)
     *
     * So sánh với HashMap: không thread-safe, dùng ConcurrentHashMap cho môi trường multi-thread
     */
    private final Map<String, Bucket> rateLimitBuckets = new ConcurrentHashMap<>();

    private Bucket resolveBucket(String ip) {
        // computeIfAbsent: atomic operation, thread-safe
        return rateLimitBuckets.computeIfAbsent(ip, k ->
                Bucket.builder()
                        .addLimit(Bandwidth.classic(
                                20,                         // capacity: 20 request
                                Refill.greedy(20, Duration.ofMinutes(1)) // refill 20/phút
                        ))
                        .build()
        );
    }

    /**
     * RateLimitFilter — áp dụng cho /api/v1/auth/** (login/register)
     * Ngăn brute force tấn công password
     * OncePerRequestFilter: đảm bảo filter chỉ chạy 1 lần/request (không duplicate)
     */
    @Bean
    public Filter rateLimitFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest req,
                                            HttpServletResponse res,
                                            FilterChain chain) throws IOException, jakarta.servlet.ServletException {
                String path = req.getRequestURI();
                // Chỉ rate limit auth endpoints
                if (path.startsWith("/api/v1/auth/")) {
                    String ip = req.getRemoteAddr();
                    Bucket bucket = resolveBucket(ip);
                    if (!bucket.tryConsume(1)) {
                        res.setStatus(429);
                        res.getWriter().write("{\"message\":\"Quá nhiều yêu cầu. Vui lòng thử lại sau.\"}");
                        return;
                    }
                }
                chain.doFilter(req, res);
            }
        };
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsSource()))
                .csrf(csrf -> csrf.disable())
                // STATELESS: không dùng HttpSession → JWT thay thế → scale ngang dễ dàng
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth

                        // ════════════════════════════════════════════════════════
                        //  PUBLIC — không cần token
                        // ════════════════════════════════════════════════════════

                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers("/api/v1/health").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/chat").permitAll()
                        .requestMatchers("/oauth2/**", "/login/oauth2/**").permitAll()
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/images/**", "/uploads/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/upload/**").permitAll()

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

                        // Banners — public read + tracking
                        .requestMatchers(HttpMethod.GET,  "/api/v1/banners/active").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/banners/*/impression").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/v1/banners/*/click").permitAll()

                        // ════════════════════════════════════════════════════════
                        //  ADMIN ONLY
                        // ════════════════════════════════════════════════════════

                        .requestMatchers("/api/v1/admin/dashboard/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/reviews/**").hasRole("ADMIN")
                        .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET,    "/api/v1/colors/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/colors").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/colors/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/colors/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET,    "/api/v1/sizes/all").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/sizes").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/sizes/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/sizes/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST,   "/api/v1/categories").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/categories/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST,   "/api/v1/products").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/products/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST,   "/api/v1/products/*/variants").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/products/*/variants/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/products/*/variants/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/v1/upload/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET,   "/api/v1/orders").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/orders/*/status").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/cod/confirm/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST, "/api/v1/payments/refund/**").hasRole("ADMIN")

                        .requestMatchers(HttpMethod.GET,    "/api/v1/vouchers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET,    "/api/v1/vouchers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.POST,   "/api/v1/vouchers").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT,    "/api/v1/vouchers/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/vouchers/**").hasRole("ADMIN")

                        // ════════════════════════════════════════════════════════
                        //  AUTHENTICATED
                        // ════════════════════════════════════════════════════════
                        .anyRequest().authenticated()
                )
                .oauth2Login(oauth2 -> oauth2
                        .userInfoEndpoint(ep -> ep.userService(oauth2UserService))
                        .successHandler(oauth2SuccessHandler)
                )
                .authenticationProvider(authProvider)
                // Filter chain: FIFO — RateLimit trước JWT trước UsernamePassword
                .addFilterBefore(rateLimitFilter(), UsernamePasswordAuthenticationFilter.class)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    /**
     * CORS — Strategy Pattern: corsSource là strategy object cho CORS policy
     * Có thể swap bằng config khác tùy môi trường (dev/prod) mà không sửa filterChain
     */
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