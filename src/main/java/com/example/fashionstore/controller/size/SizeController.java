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

    @GetMapping
    public ResponseEntity<ApiResponse<List<SizeDto>>> getActiveSizes() {
        return ResponseEntity.ok(ApiResponse.ok(sizeService.findAllActive()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<SizeDto>>> getAllSizes() {
        return ResponseEntity.ok(ApiResponse.ok(sizeService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SizeDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sizeService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SizeDto>> create(@Valid @RequestBody SizeRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(sizeService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SizeDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody SizeRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật size thành công", sizeService.update(id, req)));
    }

    /** Soft delete — ẩn size */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        sizeService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hoá size", null));
    }

    /** Hard delete — xóa vĩnh viễn */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hardDelete(@PathVariable Long id) {
        sizeService.hardDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa vĩnh viễn size", null));
    }

    /** Restore — khôi phục size đã bị ẩn */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SizeDto>> restore(
            @PathVariable Long id,
            @Valid @RequestBody SizeRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Đã khôi phục size", sizeService.restore(id, req)));
    }
}