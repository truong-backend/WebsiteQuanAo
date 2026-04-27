package com.example.fashionstore.config;

import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        OAuth2UserInfo userInfo = new OAuth2UserInfo(oauth2User.getAttributes());

        String email    = userInfo.getEmail();
        String googleId = userInfo.getId();

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from Google");
        }

        Optional<User> existing = userRepository.findByEmail(email);
        User user;

        if (existing.isPresent()) {
            user = existing.get();
            // Nếu account chưa liên kết Google thì liên kết
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setOauth2User(true);
                if (userInfo.getAvatarUrl() != null && user.getAvatarUrl() == null) {
                    user.setAvatarUrl(userInfo.getAvatarUrl());
                }
                userRepository.save(user);
            }
        } else {
            // Tạo tài khoản mới từ Google
            user = User.builder()
                    .name(userInfo.getName())
                    .email(email)
                    .password("")          // không có password
                    .googleId(googleId)
                    .avatarUrl(userInfo.getAvatarUrl())
                    .role(User.Role.ROLE_USER)
                    .emailVerified(true)   // Google đã xác thực
                    .oauth2User(true)
                    .build();
            userRepository.save(user);
        }

        return user; // User implements OAuth2User (cần thêm bên dưới)
    }
}