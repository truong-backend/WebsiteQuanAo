package com.example.fashionstore.controller.voucher;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.voucher.*;
import com.example.fashionstore.service.voucher.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    // ── Public endpoints ─────────────────────────────────────────────

    /**
     * POST /api/v1/vouchers/apply
     * User nhập mã giảm giá để xem số tiền được giảm.
     */
    @PostMapping("/apply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<ApplyVoucherResponse>> apply(
            @Valid @RequestBody ApplyVoucherRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(voucherService.applyVoucher(req)));
    }

    // ── Admin endpoints ──────────────────────────────────────────────

    /**
     * GET /api/v1/vouchers
     * 👉 Thêm includeDeleted để xem cả voucher đã xóa mềm
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<VoucherDto>>> getAll(
            @RequestParam(defaultValue = "false") boolean includeDeleted) {

        return ResponseEntity.ok(
                ApiResponse.ok(voucherService.findAllAdmin(includeDeleted))
        );
    }

    /** GET /api/v1/vouchers/{id} */
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherDto>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(voucherService.getById(id)));
    }

    /** POST /api/v1/vouchers */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherDto>> create(
            @Valid @RequestBody VoucherRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(voucherService.create(req)));
    }

    /** PUT /api/v1/vouchers/{id} */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherDto>> update(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(voucherService.update(id, req)));
    }

    /**
     * DELETE /api/v1/vouchers/{id}
     * 👉 Soft delete (đã xử lý trong service)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        voucherService.delete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa voucher", null));
    }

    /**
     * POST /api/v1/vouchers/{id}/restore
     * 👉 Khôi phục voucher đã xóa mềm
     */
    @PostMapping("/{id}/restore")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<VoucherDto>> restore(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.ok("Đã khôi phục", voucherService.restore(id))
        );
    }

    /**
     * DELETE /api/v1/vouchers/{id}/hard
     * 👉 Xóa vĩnh viễn
     */
    @DeleteMapping("/{id}/hard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> hardDelete(@PathVariable Long id) {
        voucherService.hardDelete(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa vĩnh viễn", null));
    }
}