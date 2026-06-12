package com.example.fashionstore.controller.color;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.color.ColorDto;
import com.example.fashionstore.dto.color.ColorRequest;
import com.example.fashionstore.service.color.ColorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/colors")
@RequiredArgsConstructor
public class ColorController {

    private final ColorService colorService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ColorDto>>> getActiveColors() {
        return ResponseEntity.ok(ApiResponse.ok(colorService.findAllActive()));
    }

    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ColorDto>>> getAllColors() {
        return ResponseEntity.ok(ApiResponse.ok(colorService.findAll()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ColorDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(colorService.getById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ColorDto>> create(@Valid @RequestBody ColorRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(colorService.create(req)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ColorDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody ColorRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật màu thành công", colorService.update(id, req)));
    }

    /** Soft delete — ẩn màu (active = false) */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        colorService.softDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hoá màu", null));
    }

    /** Hard delete — xóa vĩnh viễn */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hardDelete(@PathVariable Long id) {
        colorService.hardDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa vĩnh viễn màu", null));
    }

    /** Restore — khôi phục màu đã bị ẩn */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ColorDto>> restore(
            @PathVariable Long id,
            @Valid @RequestBody ColorRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Đã khôi phục màu", colorService.restore(id, req)));
    }
}