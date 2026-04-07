package com.example.fashionstore.controller.user;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.user.ChangePasswordRequest;
import com.example.fashionstore.dto.user.UserDto;
import com.example.fashionstore.dto.user.UserUpdateRequest;
import com.example.fashionstore.service.user.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    // ══════════════════════════════════════════════════════════════════
    // ── Current user (Profile) — /api/v1/users/me ─────────────────────
    // ══════════════════════════════════════════════════════════════════

    /** GET /api/v1/users/me */
    @GetMapping("/api/v1/users/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> getMyProfile() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getMyProfile()));
    }

    /** PUT /api/v1/users/me */
    @PutMapping("/api/v1/users/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<UserDto>> updateMyProfile(
            @Valid @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", userService.updateMyProfile(req)));
    }

    /** POST /api/v1/users/me/change-password */
    @PostMapping("/api/v1/users/me/change-password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @Valid @RequestBody ChangePasswordRequest req) {
        userService.changeMyPassword(req);
        return ResponseEntity.ok(ApiResponse.ok("Đổi mật khẩu thành công", null));
    }

    // ══════════════════════════════════════════════════════════════════
    // ── Admin — /api/v1/admin/users ────────────────────────────────────
    // ══════════════════════════════════════════════════════════════════

    /**
     * GET /api/v1/admin/users
     * Params: page, size, search, role, enabled, sortBy, sortDir
     */
    @GetMapping("/api/v1/admin/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserDto>>> listUsers(
            @RequestParam(defaultValue = "0")           int     page,
            @RequestParam(defaultValue = "20")          int     size,
            @RequestParam(required = false)             String  search,
            @RequestParam(required = false)             String  role,
            @RequestParam(required = false)             Boolean enabled,
            @RequestParam(defaultValue = "createdAt")   String  sortBy,
            @RequestParam(defaultValue = "desc")        String  sortDir) {

        Sort sort = "desc".equalsIgnoreCase(sortDir)
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Page<UserDto> result = userService.findAll(
                PageRequest.of(page, size, sort), search, role, enabled);
        return ResponseEntity.ok(ApiResponse.ok(result));
    }

    /** GET /api/v1/admin/users/{id} */
    @GetMapping("/api/v1/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Integer id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getById(id)));
    }

    /** PUT /api/v1/admin/users/{id} */
    @PutMapping("/api/v1/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Integer id,
            @Valid @RequestBody UserUpdateRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật thành công", userService.adminUpdate(id, req)));
    }

    /** DELETE /api/v1/admin/users/{id} */
    @DeleteMapping("/api/v1/admin/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Integer id) {
        userService.deleteUser(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa người dùng", null));
    }

    /**
     * PATCH /api/v1/admin/users/{id}/status
     * Body: { "enabled": true/false }
     */
    @PatchMapping("/api/v1/admin/users/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> setStatus(
            @PathVariable Integer id,
            @RequestParam boolean enabled) {
        return ResponseEntity.ok(ApiResponse.ok(
                enabled ? "Đã kích hoạt tài khoản" : "Đã khóa tài khoản",
                userService.setStatus(id, enabled)));
    }

    /**
     * PATCH /api/v1/admin/users/{id}/role
     * Param: role=ROLE_USER | ROLE_ADMIN
     */
    @PatchMapping("/api/v1/admin/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserDto>> setRole(
            @PathVariable Integer id,
            @RequestParam String role) {
        return ResponseEntity.ok(ApiResponse.ok("Đã cập nhật vai trò", userService.setRole(id, role)));
    }
}