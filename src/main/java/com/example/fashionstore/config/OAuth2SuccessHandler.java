package com.example.fashionstore.config;

import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.auth.RefreshTokenRepository;
import com.example.fashionstore.module.auth.RefreshToken;
import jakarta.servlet.http.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtService             jwtService;
    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${security.jwt.refresh-expiration-time}")
    private long refreshExpirationMs;

    @Value("${app.oauth2.frontend-redirect-url}")
    private String frontendRedirectUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        User user = (User) authentication.getPrincipal();

        String accessToken = jwtService.generateToken(user);

        // Revoke existing refresh tokens
        refreshTokenRepository.revokeAllByUserId(user.getId());

        // Create new refresh token
        RefreshToken rt = RefreshToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiresAt(Instant.now().plusMillis(refreshExpirationMs))
                .build();
        String refreshToken = refreshTokenRepository.save(rt).getToken();

        String redirectUrl = UriComponentsBuilder.fromUriString(frontendRedirectUrl)
                .queryParam("accessToken", accessToken)
                .queryParam("refreshToken", refreshToken)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, redirectUrl);
    }
}