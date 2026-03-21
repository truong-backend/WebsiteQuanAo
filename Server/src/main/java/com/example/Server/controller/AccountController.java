package com.example.Server.controller;

import com.example.Server.dto.request.account.*;
import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.dto.response.order.OrderBasicResponse;
import com.example.Server.service.AccountService;
import jakarta.validation.Valid;
import org.springframework.data.domain.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * Controller quản lý tài khoản người dùng.
 * Base path: /accounts
 */
@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;
    private static final Set<String> ALLOWED_SORT = Set.of("id", "name", "email", "roles");

    public AccountController(AccountService accountService) { this.accountService = accountService; }

    @GetMapping
    public ResponseEntity<Page<AccountResponse>> getAccounts(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search, @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "id") String sortBy, @RequestParam(defaultValue = "asc") String sortDir) {
        if (!ALLOWED_SORT.contains(sortBy)) sortBy = "id";
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        return ResponseEntity.ok(accountService.findAll(PageRequest.of(page, size, sort), search, role));
    }

    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(@Valid @RequestBody AccountCreateRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(accountService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(@PathVariable Integer id, @Valid @RequestBody AccountUpdateRequest request) {
        return ResponseEntity.ok(accountService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Integer id) {
        accountService.delete(id); return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getById(id));
    }

    @GetMapping("/me")
    public ResponseEntity<AccountResponse> getCurrentUser() { return ResponseEntity.ok(accountService.getCurrentUser()); }

    @PutMapping("/me")
    public ResponseEntity<AccountResponse> updateCurrentUser(@Valid @RequestBody AccountUpdateRequest request) {
        return ResponseEntity.ok(accountService.updateCurrentUser(request));
    }

    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        accountService.changePassword(request); return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/role")
    public ResponseEntity<AccountResponse> updateRole(@PathVariable Integer id, @Valid @RequestBody UpdateRoleRequest request) {
        return ResponseEntity.ok(accountService.updateRole(id, request));
    }

    @PutMapping("/{id}/enable")
    public ResponseEntity<AccountResponse> enableAccount(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.enableAccount(id));
    }

    @PutMapping("/{id}/disable")
    public ResponseEntity<AccountResponse> disableAccount(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.disableAccount(id));
    }

    @GetMapping("/{id}/orders")
    public ResponseEntity<List<OrderBasicResponse>> getOrdersByAccountId(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getOrdersByAccountId(id));
    }

    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getAccountStats(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getAccountStats(id));
    }
}
