package com.example.Server.service;

import com.example.Server.dto.request.account.AccountCreateRequest;
import com.example.Server.dto.request.account.AccountUpdateRequest;
import com.example.Server.dto.request.account.ChangePasswordRequest;
import com.example.Server.dto.request.account.UpdateRoleRequest;
import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.dto.response.order.OrderBasicResponse;
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

/**
 * Service xử lý toàn bộ business logic liên quan đến Account.
 */
@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder   passwordEncoder;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder   = passwordEncoder;
    }

    // ── ADMIN: QUERY ──────────────────────────────────────────

    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<AccountResponse> findAll(Pageable pageable, String search, String role) {
        Specification<Account> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")),  kw),
                    cb.like(cb.lower(root.get("email")), kw)
            ));
        }
        if (role != null && !role.trim().isEmpty()) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("roles"), role.trim()));
        }

        return accountRepository.findAll(spec, pageable).map(AccountMapper::toResponse);
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public AccountResponse getById(Integer id) {
        return AccountMapper.toResponse(findAccountById(id));
    }

    // ── ADMIN: CRUD ───────────────────────────────────────────

    /**
     * Tạo tài khoản mới. Mặc định enabled = true, role = ROLE_USER.
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
        account.setRoles(resolveRole(request.getRoles()));
        account.setEnabled(true);
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    public AccountResponse update(Integer id, AccountUpdateRequest request) {
        Account account = findAccountById(id);
        String email = normalizeEmail(request.getEmail());
        if (accountRepository.existsByEmailAndIdNot(email, id)) {
            throw new ResourceAlreadyExistsException("Account", "email", email);
        }
        account.setName(normalize(request.getName()));
        account.setEmail(email);
        if (request.getRoles() != null && !request.getRoles().trim().isEmpty()) {
            account.setRoles(request.getRoles().trim());
        }
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    public void delete(Integer id) {
        Account account = findAccountById(id);
        if (account.getOrders() != null && !account.getOrders().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete account that has orders. Please remove or reassign orders first.");
        }
        accountRepository.delete(account);
    }

    /**
     * Cập nhật role của tài khoản (chỉ Admin).
     */
    public AccountResponse updateRole(Integer id, UpdateRoleRequest request) {
        Account account = findAccountById(id);
        account.setRoles(request.getRole().trim());
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    /**
     * Kích hoạt tài khoản — đặt enabled = true.
     * Tài khoản đã active thì báo lỗi.
     */
    public AccountResponse enableAccount(Integer id) {
        Account account = findAccountById(id);
        if (account.isEnabled()) {
            throw new InvalidOperationException("Account is already active.");
        }
        account.setEnabled(true);
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    /**
     * Vô hiệu hóa tài khoản — đặt enabled = false.
     * Tài khoản đã bị khóa thì báo lỗi.
     * Không cho phép tự khóa chính mình.
     */
    public AccountResponse disableAccount(Integer id) {
        Account account = findAccountById(id);
        if (!account.isEnabled()) {
            throw new InvalidOperationException("Account is already disabled.");
        }
        // Không cho phép tự khóa chính mình
        Account current = getCurrentAccount();
        if (current.getId().equals(account.getId())) {
            throw new InvalidOperationException("Cannot disable your own account.");
        }
        account.setEnabled(false);
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    // ── USER: SELF-SERVICE ────────────────────────────────────

    @Transactional(Transactional.TxType.SUPPORTS)
    public AccountResponse getCurrentUser() {
        return AccountMapper.toResponse(getCurrentAccount());
    }

    public AccountResponse updateCurrentUser(AccountUpdateRequest request) {
        return update(getCurrentAccount().getId(), request);
    }

    public void changePassword(ChangePasswordRequest request) {
        Account account = getCurrentAccount();
        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new InvalidOperationException("Current password is incorrect.");
        }
        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    // ── STATS / ORDERS ────────────────────────────────────────

//    @Transactional(Transactional.TxType.SUPPORTS)
    @Transactional
    public List<OrderBasicResponse> getOrdersByAccountId() {
        return OrderMapper.toResponses(findAccountById(getCurrentUser().getId()).getOrders());
    }

    @Transactional(Transactional.TxType.SUPPORTS)
    public Map<String, Object> getAccountStats(Integer accountId) {
        Account account = findAccountById(accountId);
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders",  account.getOrders() != null ? account.getOrders().size() : 0);
        stats.put("accountId",    accountId);
        stats.put("accountName",  account.getName());
        stats.put("accountEmail", account.getEmail());
        stats.put("enabled",      account.isEnabled());
        return stats;
    }

    // ── PRIVATE HELPERS ───────────────────────────────────────

    private Account findAccountById(Integer id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
    }

    private Account getCurrentAccount() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof UserDetails ud)) {
            throw new InvalidOperationException("User not authenticated.");
        }
        return accountRepository.findByEmail(ud.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", ud.getUsername()));
    }

    private String resolveRole(String roles) {
        return (roles != null && !roles.trim().isEmpty()) ? roles.trim() : "ROLE_USER";
    }

    private String normalize(String s) {
        return s == null ? null : s.trim().replaceAll("\\s+", " ");
    }

    private String normalizeEmail(String email) {
        return email == null ? null : email.trim().toLowerCase();
    }
}