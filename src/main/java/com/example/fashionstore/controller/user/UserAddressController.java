package com.example.fashionstore.controller.user;

import com.example.fashionstore.common.response.ApiResponse;
import com.example.fashionstore.dto.user.AddressDto;
import com.example.fashionstore.dto.user.AddressRequest;
import com.example.fashionstore.service.user.UserAddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/users/me/addresses")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class UserAddressController {

    private final UserAddressService addressService;

    /** GET /api/v1/users/me/addresses — danh sách địa chỉ đã lưu */
    @GetMapping
    public ResponseEntity<ApiResponse<List<AddressDto>>> getMyAddresses() {
        return ResponseEntity.ok(ApiResponse.ok(addressService.getMyAddresses()));
    }

    /** POST /api/v1/users/me/addresses — thêm địa chỉ mới */
    @PostMapping
    public ResponseEntity<ApiResponse<AddressDto>> addAddress(
            @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.created(addressService.addAddress(req)));
    }

    /** PUT /api/v1/users/me/addresses/{id} — sửa địa chỉ */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<AddressDto>> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(ApiResponse.ok(addressService.updateAddress(id, req)));
    }

    /** DELETE /api/v1/users/me/addresses/{id} */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteAddress(@PathVariable Long id) {
        addressService.deleteAddress(id);
        return ResponseEntity.ok(ApiResponse.ok("Đã xóa địa chỉ", null));
    }

    /** PATCH /api/v1/users/me/addresses/{id}/default — đặt làm địa chỉ mặc định */
    @PatchMapping("/{id}/default")
    public ResponseEntity<ApiResponse<AddressDto>> setDefault(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(addressService.setDefault(id)));
    }
}