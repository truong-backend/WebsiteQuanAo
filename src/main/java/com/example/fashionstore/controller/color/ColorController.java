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

    /**
     * GET /api/v1/colors
     * Public — chỉ trả màu đang active (dùng cho filter sản phẩm, tạo variant)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<List<ColorDto>>> getActiveColors() {
        return ResponseEntity.ok(ApiResponse.ok(colorService.findAllActive()));
    }

    /**
     * GET /api/v1/colors/all
     * Admin — trả toàn bộ kể cả inactive
     */
    @GetMapping("/all")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ColorDto>>> getAllColors() {
        return ResponseEntity.ok(ApiResponse.ok(colorService.findAll()));
    }

    /**
     * GET /api/v1/colors/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ColorDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(colorService.getById(id)));
    }

    /**
     * POST /api/v1/colors — Admin tạo màu mới
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ColorDto>> create(@Valid @RequestBody ColorRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(colorService.create(req)));
    }

    /**
     * PUT /api/v1/colors/{id} — Admin cập nhật màu
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ColorDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody ColorRequest req) {
        return ResponseEntity.ok(ApiResponse.ok("Cập nhật màu thành công", colorService.update(id, req)));
    }

    /**
     * DELETE /api/v1/colors/{id} — Admin xoá mềm màu
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        colorService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã vô hiệu hoá màu", null));
    }
}