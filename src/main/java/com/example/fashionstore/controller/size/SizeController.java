package com.example.fashionstore.controller.size;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.size.SizeDto;
import com.example.fashionstore.dto.size.SizeRequest;
import com.example.fashionstore.service.size.SizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/sizes")
@RequiredArgsConstructor
public class SizeController {

    private final SizeService sizeService;

    /**
     * GET /api/v1/sizes
     * Public — chỉ trả size đang active, sắp xếp theo sortOrder
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<SizeDto>>> getActiveSizes() {
        return ResponseEntity.ok(ApiResponse.ok(sizeService.findAllActive()));
    }

    /**
     * GET /api/v1/sizes/all
     * Admin — toàn bộ kể cả inactive
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SizeDto>>> getAllSizes() {
        return ResponseEntity.ok(ApiResponse.ok(sizeService.findAll()));
    }

    /**
     * GET /api/v1/sizes/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SizeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sizeService.getById(id)));
    }

    /**
     * POST /api/v1/sizes — Admin tạo size mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SizeDto>> create(@Valid @RequestBody SizeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(sizeService.create(req)));
    }

    /**
     * PUT /api/v1/sizes/{id} — Admin cập nhật size
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SizeDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody SizeRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật size thành công", sizeService.update(id, req)));
    }

    /**
     * DELETE /api/v1/sizes/{id} — Admin xoá mềm size
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        sizeService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hoá size", null));
    }
}