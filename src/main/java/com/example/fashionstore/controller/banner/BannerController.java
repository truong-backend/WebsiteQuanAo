package com.example.fashionstore.controller.banner;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.banner.BannerDto;
import com.example.fashionstore.dto.banner.BannerRequest;
import com.example.fashionstore.module.banner.Banner;
import com.example.fashionstore.service.banner.BannerService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // ── PUBLIC ───────────────────────────────────────────────────────

    /** GET /api/v1/banners/active?type=HERO  — frontend lấy banner theo loại */
    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getActive(
            @RequestParam(required = false) Banner.BannerType type) {
        List<BannerDto> data = type != null
                ? bannerService.getActiveByType(type)
                : bannerService.getAllActive();
        return ResponseEntity.ok(ApiResponse.ok(data));
    }

    /** POST /api/v1/banners/{id}/impression — frontend gọi khi hiển thị banner */
    @PostMapping("/{id}/impression")
    public ResponseEntity<Void> trackImpression(@PathVariable Long id) {
        bannerService.trackImpression(id);
        return ResponseEntity.ok().build();
    }

    /** POST /api/v1/banners/{id}/click — frontend gọi khi user click banner */
    @PostMapping("/{id}/click")
    public ResponseEntity<Void> trackClick(@PathVariable Long id) {
        bannerService.trackClick(id);
        return ResponseEntity.ok().build();
    }

    // ── ADMIN ────────────────────────────────────────────────────────

    /** GET /api/v1/banners — admin lấy tất cả banner */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BannerDto>>> getAll() {
        return ResponseEntity.ok(ApiResponse.ok(bannerService.getAll()));
    }

    /** POST /api/v1/banners — tạo banner mới */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BannerDto>> create(@Valid @RequestBody BannerRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(bannerService.create(req)));
    }

    /** PUT /api/v1/banners/{id} — cập nhật banner */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BannerDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody BannerRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(bannerService.update(id, req)));
    }

    /** PATCH /api/v1/banners/{id}/toggle — bật/tắt banner */
    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BannerDto>> toggle(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(bannerService.toggleActive(id)));
    }

    /** DELETE /api/v1/banners/{id} — xóa banner */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        bannerService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Da xoa banner", null));
    }

    /** PUT /api/v1/banners/reorder — kéo thả sắp xếp thứ tự */
    @PutMapping("/reorder")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> reorder(@RequestBody List<Long> orderedIds) {
        bannerService.reorder(orderedIds);
        return ResponseEntity.ok(ApiResponse.ok("Da cap nhat thu tu", null));
    }
}