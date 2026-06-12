package com.example.fashionstore.config;

import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.oauth2.client.userinfo.*;
import org.springframework.security.oauth2.core.*;
import org.springframework.security.oauth2.core.user.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService implements OAuth2UserService<OAuth2UserRequest, OAuth2User> {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2UserService<OAuth2UserRequest, OAuth2User> delegate = new DefaultOAuth2UserService();
        OAuth2User oauth2User = delegate.loadUser(userRequest);

        OAuth2UserInfo userInfo = new OAuth2UserInfo(oauth2User.getAttributes());

        String email    = userInfo.getEmail();
        String googleId = userInfo.getId();

        if (email == null || email.isBlank()) {
            throw new OAuth2AuthenticationException("Email not found from Google");
        }

        User user = findOrCreateUser(email, googleId, userInfo);
        return user;
    }

    private User findOrCreateUser(String email, String googleId, OAuth2UserInfo userInfo) {
        // Tìm user đã tồn tại (kể cả soft-deleted để tránh race condition)
        return userRepository.findByEmail(email)
                .map(existing -> {
                    // Liên kết Google nếu chưa có
                    if (existing.getGoogleId() == null) {
                        existing.setGoogleId(googleId);
                        existing.setOauth2User(true);
                        if (userInfo.getAvatarUrl() != null && existing.getAvatarUrl() == null) {
                            existing.setAvatarUrl(userInfo.getAvatarUrl());
                        }
                        userRepository.save(existing);
                    }
                    return existing;
                })
                .orElseGet(() -> createNewUser(email, googleId, userInfo));
    }

    private User createNewUser(String email, String googleId, OAuth2UserInfo userInfo) {
        try {
            User newUser = User.builder()
                    .name(userInfo.getName())
                    .email(email)
                    .password("")
                    .googleId(googleId)
                    .avatarUrl(userInfo.getAvatarUrl())
                    .role(User.Role.ROLE_USER)
                    .emailVerified(true)
                    .oauth2User(true)
                    .build();
            return userRepository.save(newUser);
        } catch (DataIntegrityViolationException e) {
            // Race condition: user vừa được tạo bởi request khác — tìm lại
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new OAuth2AuthenticationException(
                            "Không thể tạo hoặc tìm user với email: " + email));
        }
    }
}