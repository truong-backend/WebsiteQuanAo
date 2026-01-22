package com.example.Server.services;

import com.example.Server.dto.request.account.AccountCreateRequest;
import com.example.Server.dto.request.account.AccountUpdateRequest;
import com.example.Server.dto.request.account.ChangePasswordRequest;
import com.example.Server.dto.request.account.UpdateRoleRequest;
import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.dto.response.order.OrderResponse;
import com.example.Server.entity.Account;
import com.example.Server.exception.InvalidOperationException;
import com.example.Server.exception.ResourceAlreadyExistsException;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.AccountMapper;
import com.example.Server.mapper.OrderMapper;
import com.example.Server.repository.AccountRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(
            AccountRepository accountRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Find all accounts with pagination, search, and filtering
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<AccountResponse> findAll(Pageable pageable, String search, String role) {
        Specification<Account> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) ->
                    cb.or(
                            cb.like(cb.lower(root.get("name")), keyword),
                            cb.like(cb.lower(root.get("email")), keyword)
                    )
            );
        }

        if (role != null && !role.trim().isEmpty()) {
            String roleValue = role.trim();
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("roles"), roleValue)
            );
        }

        return accountRepository
                .findAll(spec, pageable)
                .map(AccountMapper::toResponse);
    }

    /**
     * Create a new account
     */
    public AccountResponse create(AccountCreateRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (accountRepository.existsByEmail(email)) {
            throw new ResourceAlreadyExistsException("Account", "email", email);
        }

        Account account = new Account();
        account.setName(normalize(request.getName()));
        account.setEmail(email);
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRoles(request.getRoles() != null && !request.getRoles().trim().isEmpty()
                ? request.getRoles().trim() : "USER");

        Account saved = accountRepository.save(account);
        return AccountMapper.toResponse(saved);
    }

    /**
     * Update an existing account
     */
    public AccountResponse update(Integer id, AccountUpdateRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

        String email = normalizeEmail(request.getEmail());

        if (accountRepository.existsByEmailAndIdNot(email, id)) {
            throw new ResourceAlreadyExistsException("Account", "email", email);
        }

        account.setName(normalize(request.getName()));
        account.setEmail(email);
        if (request.getRoles() != null && !request.getRoles().trim().isEmpty()) {
            account.setRoles(request.getRoles().trim());
        }

        Account saved = accountRepository.save(account);
        return AccountMapper.toResponse(saved);
    }

    /**
     * Delete an account by ID
     */
    public void delete(Integer id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

        if (account.getOrders() != null && !account.getOrders().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete account that has orders. Please remove or reassign orders first."
            );
        }

        accountRepository.delete(account);
    }

    /**
     * Get account by ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public AccountResponse getById(Integer id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
        return AccountMapper.toResponse(account);
    }

    /**
     * Get current authenticated user
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public AccountResponse getCurrentUser() {
        Account account = getCurrentAccount();
        return AccountMapper.toResponse(account);
    }

    /**
     * Update current authenticated user
     */
    public AccountResponse updateCurrentUser(AccountUpdateRequest request) {
        Account account = getCurrentAccount();
        return update(account.getId(), request);
    }

    /**
     * Change password for current authenticated user
     */
    public void changePassword(ChangePasswordRequest request) {
        Account account = getCurrentAccount();

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new InvalidOperationException("Current password is incorrect.");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    /**
     * Update role of an account (admin only)
     */
    public AccountResponse updateRole(Integer id, UpdateRoleRequest request) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));

        account.setRoles(request.getRole().trim());
        Account saved = accountRepository.save(account);
        return AccountMapper.toResponse(saved);
    }

    /**
     * Enable an account
     */
    public AccountResponse enableAccount(Integer id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
        // Note: Account implements UserDetails, but isEnabled() returns default
        // You may need to add an enabled field to Account entity if needed
        Account saved = accountRepository.save(account);
        return AccountMapper.toResponse(saved);
    }

    /**
     * Disable an account
     */
    public AccountResponse disableAccount(Integer id) {
        Account account = accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
        // Note: Account implements UserDetails, but isEnabled() returns default
        // You may need to add an enabled field to Account entity if needed
        Account saved = accountRepository.save(account);
        return AccountMapper.toResponse(saved);
    }

    /**
     * Get orders by account ID
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<OrderResponse> getOrdersByAccountId(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        return OrderMapper.toResponses(account.getOrders());
    }

    /**
     * Get account statistics
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Map<String, Object> getAccountStats(Integer accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", accountId));

        List<OrderResponse> orders = OrderMapper.toResponses(account.getOrders());

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", orders.size());
        stats.put("accountId", accountId);
        stats.put("accountName", account.getName());
        stats.put("accountEmail", account.getEmail());

        return stats;
    }

    /**
     * Get current authenticated account from SecurityContext
     */
    private Account getCurrentAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new InvalidOperationException("User not authenticated.");
        }

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String email = userDetails.getUsername();

        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", email));
    }

    private String normalize(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}
