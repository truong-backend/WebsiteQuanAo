package com.example.fashionstore.service.user;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.user.ChangePasswordRequest;
import com.example.fashionstore.dto.user.UserDto;
import com.example.fashionstore.dto.user.UserUpdateRequest;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.repository.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Admin: list users ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<UserDto> findAll(Pageable pageable, String search, String role, Boolean enabled) {
        return userRepository.findAllWithFilters(search, role, enabled, pageable)
                .map(this::toDto);
    }

    @Transactional(readOnly = true)
    public UserDto getById(Integer id) {
        return toDto(findUser(id));
    }

    // ── Admin: update user ───────────────────────────────────────────

    public UserDto adminUpdate(Integer id, UserUpdateRequest req) {
        User user = findUser(id);
        user.setName(req.getName().trim());
        user.setPhone(req.getPhone());
        user.setAvatarUrl(req.getAvatarUrl());
        return toDto(userRepository.save(user));
    }

    public UserDto setStatus(Integer id, boolean enabled) {
        User user = findUser(id);
        user.setEnabled(enabled);
        return toDto(userRepository.save(user));
    }

    public UserDto setRole(Integer id, String role) {
        User user = findUser(id);
        try {
            user.setRole(User.Role.valueOf(role));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Role không hợp lệ: " + role);
        }
        return toDto(userRepository.save(user));
    }

    public void deleteUser(Integer id) {
        User current = SecurityUtils.getCurrentUser();
        if (current.getId().equals(id))
            throw new BusinessException("Không thể xóa tài khoản đang đăng nhập");
        userRepository.deleteById(id);
    }

    // ── Current user (profile) ───────────────────────────────────────

    @Transactional(readOnly = true)
    public UserDto getMyProfile() {
        return toDto(SecurityUtils.getCurrentUser());
    }

    public UserDto updateMyProfile(UserUpdateRequest req) {
        User user = SecurityUtils.getCurrentUser();
        user.setName(req.getName().trim());
        user.setPhone(req.getPhone());
        if (req.getAvatarUrl() != null) user.setAvatarUrl(req.getAvatarUrl());
        return toDto(userRepository.save(user));
    }

    public void changeMyPassword(ChangePasswordRequest req) {
        User user = SecurityUtils.getCurrentUser();
        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword()))
            throw new BusinessException("Mật khẩu hiện tại không đúng");
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private User findUser(Integer id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    private UserDto toDto(User u) {
        return UserDto.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole().name())
                .enabled(u.isEnabled())
                .emailVerified(u.isEmailVerified())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}