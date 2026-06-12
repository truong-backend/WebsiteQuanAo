package com.example.fashionstore.controller.inventory;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.inventory.*;
import com.example.fashionstore.service.inventory.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/inventory")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class InventoryController {

    private final InventoryService inventoryService;

    /**
     * GET /api/v1/admin/inventory/logs?page=0&size=20
     * Lịch sử nhập/xuất kho toàn bộ
     */
    @GetMapping("/logs")
    public ResponseEntity<ApiResponse<Page<InventoryLogDto>>> getLogs(
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                inventoryService.getLogs(PageRequest.of(page, size))));
    }

    /**
     * GET /api/v1/admin/inventory/logs/variant/{variantId}
     * Lịch sử kho của 1 variant cụ thể
     */
    @GetMapping("/logs/variant/{variantId}")
    public ResponseEntity<ApiResponse<Page<InventoryLogDto>>> getLogsByVariant(
            @PathVariable String variantId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(ApiResponse.ok(
                inventoryService.getLogsByVariant(variantId, PageRequest.of(page, size))));
    }

    /**
     * GET /api/v1/admin/inventory/logs/product/{productId}
     * Lịch sử kho của tất cả variant trong 1 sản phẩm
     */
    @GetMapping("/logs/product/{productId}")
    public ResponseEntity<ApiResponse<List<InventoryLogDto>>> getLogsByProduct(
            @PathVariable String productId) {
        return ResponseEntity.ok(ApiResponse.ok(
                inventoryService.getLogsByProduct(productId)));
    }

    /**
     * POST /api/v1/admin/inventory/import
     * Admin nhập thêm hàng vào kho
     */
    @PostMapping("/import")
    public ResponseEntity<ApiResponse<InventoryLogDto>> importStock(
            @Valid @RequestBody ImportStockRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.importStock(req)));
    }

    /**
     * POST /api/v1/admin/inventory/adjust
     * Admin điều chỉnh tồn kho về số lượng cụ thể
     */
    @PostMapping("/adjust")
    public ResponseEntity<ApiResponse<InventoryLogDto>> adjustStock(
            @Valid @RequestBody AdjustStockRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(inventoryService.adjustStock(req)));
    }
}