package com.example.Server.controller;

import com.example.Server.dto.request.contact.ContactCreateRequest;
import com.example.Server.dto.request.contact.ContactReplyRequest;
import com.example.Server.dto.request.contact.ContactStatusUpdateRequest;
import com.example.Server.dto.response.contact.ContactResponse;
import com.example.Server.enums.ContactStatus;
import com.example.Server.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Set;

/**
 * Controller quản lý liên hệ.
 * Base path: /contacts
 *
 * <ul>
 *   <li>POST   /contacts              — public, ai cũng gửi được</li>
 *   <li>GET    /contacts              — ADMIN: danh sách + filter</li>
 *   <li>GET    /contacts/stats        — ADMIN: thống kê theo trạng thái</li>
 *   <li>GET    /contacts/{id}         — ADMIN: chi tiết, tự đổi UNREAD→READ</li>
 *   <li>PATCH  /contacts/{id}/status  — ADMIN: đổi trạng thái + ghi chú</li>
 *   <li>POST   /contacts/{id}/reply   — ADMIN: gửi email phản hồi</li>
 *   <li>DELETE /contacts/{id}         — ADMIN: xóa</li>
 * </ul>
 */
@RestController
@RequestMapping("/contacts")
public class ContactController {

    private final ContactService contactService;

    private static final Set<String> ALLOWED_SORT =
            Set.of("id", "name", "email", "status", "createdAt");

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    // ─────────────────────── PUBLIC ───────────────────────────

    /** POST /contacts — gửi liên hệ mới, không yêu cầu đăng nhập */
    @PostMapping
    public ResponseEntity<ContactResponse> submit(
            @Valid @RequestBody ContactCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(contactService.submit(request));
    }

    // ─────────────────────── ADMIN ────────────────────────────

    /** GET /contacts — danh sách liên hệ có phân trang, tìm kiếm, lọc trạng thái */
    @GetMapping
    public ResponseEntity<Page<ContactResponse>> getContacts(
            @RequestParam(defaultValue = "0")         int page,
            @RequestParam(defaultValue = "10")        int size,
            @RequestParam(required = false)           String search,
            @RequestParam(required = false)           ContactStatus status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc")      String sortDir
    ) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "createdAt";
        Sort sort = sortDir.equalsIgnoreCase("asc")
                ? Sort.by(sortBy).ascending()
                : Sort.by(sortBy).descending();
        return ResponseEntity.ok(
                contactService.findAll(PageRequest.of(page, size, sort), search, status)
        );
    }

    /** GET /contacts/stats — thống kê số lượng liên hệ theo trạng thái */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(contactService.getStats());
    }

    /**
     * GET /contacts/{id} — chi tiết liên hệ.
     * Tự động đánh dấu UNREAD → READ khi admin xem.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ContactResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(contactService.getById(id));
    }

    /** PATCH /contacts/{id}/status — đổi trạng thái + ghi chú nội bộ */
    @PatchMapping("/{id}/status")
    public ResponseEntity<ContactResponse> updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ContactStatusUpdateRequest request
    ) {
        return ResponseEntity.ok(contactService.updateStatus(id, request));
    }

    /**
     * POST /contacts/{id}/reply — gửi email phản hồi đến người liên hệ.
     * Sau khi gửi thành công, tự động đổi trạng thái → REPLIED.
     */
    @PostMapping("/{id}/reply")
    public ResponseEntity<ContactResponse> sendReply(
            @PathVariable Long id,
            @Valid @RequestBody ContactReplyRequest request
    ) {
        return ResponseEntity.ok(contactService.sendReply(id, request));
    }

    /** DELETE /contacts/{id} — xóa liên hệ */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        contactService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
