package com.example.fashionstore.service.auth;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.config.JwtService;
import com.example.fashionstore.dto.auth.AuthResponse;
import com.example.fashionstore.dto.auth.LoginRequest;
import com.example.fashionstore.dto.auth.RegisterRequest;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtService            jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthResponse register(RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail()))
            throw new BusinessException("Email '" + req.getEmail() + "' đã được sử dụng");

        User user = User.builder()
                .name(req.getName().trim())
                .email(req.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(req.getPassword()))
                .phone(req.getPhone())
                .role(User.Role.ROLE_USER)
                .build();

        User saved = userRepository.save(user);
        String token = jwtService.generateToken(saved);
        return buildResponse(saved, token);
    }

    public AuthResponse login(LoginRequest req) {
        try {
            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            req.getEmail().toLowerCase().trim(),
                            req.getPassword()
                    )
            );
            User user = (User) auth.getPrincipal();
            String token = jwtService.generateToken(user);
            return buildResponse(user, token);
        } catch (BadCredentialsException e) {
            throw new BusinessException("Email hoặc mật khẩu không đúng");
        } catch (DisabledException e) {
            throw new BusinessException("Tài khoản của bạn đã bị khoá");
        }
    }

    private AuthResponse buildResponse(User user, String token) {
        return AuthResponse.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .expiresIn(3600)
                .user(AuthResponse.UserInfo.builder()
                        .id(user.getId())
                        .name(user.getName())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .avatarUrl(user.getAvatarUrl())
                        .build())
                .build();
    }
}