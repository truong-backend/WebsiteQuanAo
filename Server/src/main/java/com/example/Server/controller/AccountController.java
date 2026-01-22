package com.example.Server.controller;

import com.example.Server.dto.request.account.AccountCreateRequest;
import com.example.Server.dto.request.account.AccountUpdateRequest;
import com.example.Server.dto.request.account.ChangePasswordRequest;
import com.example.Server.dto.request.account.UpdateRoleRequest;
import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.dto.response.order.OrderResponse;
import com.example.Server.services.AccountService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

/**
 * REST Controller for Account management
 * Base path: /accounts
 */
@RestController
@RequestMapping("/accounts")
public class AccountController {

    private final AccountService accountService;

    private static final Set<String> ALLOWED_SORT_FIELDS = Set.of(
            "id",
            "name",
            "email",
            "roles"
    );

    public AccountController(AccountService accountService) {
        this.accountService = accountService;
    }

    /**
     * Get paginated accounts with filter and search
     * GET /accounts
     */
    @GetMapping
    public ResponseEntity<Page<AccountResponse>> getAccounts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        if (!ALLOWED_SORT_FIELDS.contains(sortBy)) {
            sortBy = "id";
        }

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending()
                : Sort.by(sortBy).ascending();

        Pageable pageable = PageRequest.of(page, size, sort);

        return ResponseEntity.ok(accountService.findAll(pageable, search, role));
    }

    /**
     * Create account
     * POST /accounts
     */
    @PostMapping
    public ResponseEntity<AccountResponse> createAccount(
            @Valid @RequestBody AccountCreateRequest request
    ) {
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(accountService.create(request));
    }

    /**
     * Update account
     * PUT /accounts/{id}
     */
    @PutMapping("/{id}")
    public ResponseEntity<AccountResponse> updateAccount(
            @PathVariable Integer id,
            @Valid @RequestBody AccountUpdateRequest request
    ) {
        return ResponseEntity.ok(accountService.update(id, request));
    }

    /**
     * Delete account
     * DELETE /accounts/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Integer id) {
        accountService.delete(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Get account by id
     * GET /accounts/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<AccountResponse> getAccountById(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getById(id));
    }

    /**
     * Get current authenticated user
     * GET /accounts/me
     */
    @GetMapping("/me")
    public ResponseEntity<AccountResponse> getCurrentUser() {
        return ResponseEntity.ok(accountService.getCurrentUser());
    }

    /**
     * Update current authenticated user
     * PUT /accounts/me
     */
    @PutMapping("/me")
    public ResponseEntity<AccountResponse> updateCurrentUser(
            @Valid @RequestBody AccountUpdateRequest request
    ) {
        return ResponseEntity.ok(accountService.updateCurrentUser(request));
    }

    /**
     * Change password for current authenticated user
     * PUT /accounts/me/password
     */
    @PutMapping("/me/password")
    public ResponseEntity<Void> changePassword(
            @Valid @RequestBody ChangePasswordRequest request
    ) {
        accountService.changePassword(request);
        return ResponseEntity.noContent().build();
    }

    /**
     * Update role of an account
     * PUT /accounts/{id}/role
     */
    @PutMapping("/{id}/role")
    public ResponseEntity<AccountResponse> updateRole(
            @PathVariable Integer id,
            @Valid @RequestBody UpdateRoleRequest request
    ) {
        return ResponseEntity.ok(accountService.updateRole(id, request));
    }

    /**
     * Enable an account
     * PUT /accounts/{id}/enable
     */
    @PutMapping("/{id}/enable")
    public ResponseEntity<AccountResponse> enableAccount(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.enableAccount(id));
    }

    /**
     * Disable an account
     * PUT /accounts/{id}/disable
     */
    @PutMapping("/{id}/disable")
    public ResponseEntity<AccountResponse> disableAccount(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.disableAccount(id));
    }

    /**
     * Get orders by account ID
     * GET /accounts/{id}/orders
     */
    @GetMapping("/{id}/orders")
    public ResponseEntity<List<OrderResponse>> getOrdersByAccountId(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getOrdersByAccountId(id));
    }

    /**
     * Get account statistics
     * GET /accounts/{id}/stats
     */
    @GetMapping("/{id}/stats")
    public ResponseEntity<Map<String, Object>> getAccountStats(@PathVariable Integer id) {
        return ResponseEntity.ok(accountService.getAccountStats(id));
    }
}
