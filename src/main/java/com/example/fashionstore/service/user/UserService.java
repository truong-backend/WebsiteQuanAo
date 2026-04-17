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
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Admin: list users ────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<UserDto> findAll(Pageable pageable, String search, String role, Boolean enabled,
                                 boolean includeDeleted) {
        return userRepository.findAllWithFilters(search, role, enabled, includeDeleted, pageable)
                .map(this::toDto);
    }

    /** Backward-compat: mặc định không hiển thị user đã xóa */
    @Transactional(readOnly = true)
    public Page<UserDto> findAll(Pageable pageable, String search, String role, Boolean enabled) {
        return findAll(pageable, search, role, enabled, false);
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
        if (user.isDeleted())
            throw new BusinessException("Không thể thay đổi trạng thái tài khoản đã bị xóa");
        user.setEnabled(enabled);
        return toDto(userRepository.save(user));
    }

    public UserDto setRole(Integer id, String role) {
        User user = findUser(id);
        if (user.isDeleted())
            throw new BusinessException("Không thể thay đổi vai trò tài khoản đã bị xóa");
        try {
            user.setRole(User.Role.valueOf(role));
        } catch (IllegalArgumentException e) {
            throw new BusinessException("Role không hợp lệ: " + role);
        }
        return toDto(userRepository.save(user));
    }

    // ── Admin: soft delete & restore ────────────────────────────────

    /**
     * Xóa mềm: đánh dấu deletedAt = now().
     * Không xóa bất kỳ dữ liệu nào — toàn bộ lịch sử đơn hàng, reviews,
     * inventory logs vẫn được giữ nguyên.
     */
    public void deleteUser(Integer id) {
        User current = SecurityUtils.getCurrentUser();
        if (current.getId().equals(id))
            throw new BusinessException("Không thể xóa tài khoản đang đăng nhập");

        User user = findUser(id);
        if (user.isDeleted())
            throw new BusinessException("Tài khoản này đã bị xóa trước đó");

        user.setDeletedAt(LocalDateTime.now());
        user.setEnabled(false);          // chặn đăng nhập ngay lập tức
        userRepository.save(user);
    }

    /**
     * Khôi phục tài khoản đã bị xóa mềm.
     * Re-enable tài khoản và xóa dấu deletedAt.
     */
    public UserDto restoreUser(Integer id) {
        // findById không lọc deleted — cần truy cập cả user đã xóa
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (!user.isDeleted())
            throw new BusinessException("Tài khoản này chưa bị xóa");

        user.setDeletedAt(null);
        user.setEnabled(true);
        return toDto(userRepository.save(user));
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
                .enabled(u.isEnabledRaw())
                .emailVerified(u.isEmailVerified())
                .deleted(u.isDeleted())
                .deletedAt(u.getDeletedAt())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}