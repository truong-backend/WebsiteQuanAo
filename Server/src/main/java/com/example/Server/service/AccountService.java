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
 * Service xử lý toàn bộ business logic liên quan đến Account (tài khoản người dùng).
 *
 * <p>Hỗ trợ hai luồng:
 * <ul>
 *   <li>Admin quản lý tất cả tài khoản (CRUD, phân quyền, enable/disable)</li>
 *   <li>User tự quản lý tài khoản của mình (xem, cập nhật, đổi mật khẩu)</li>
 * </ul>
 */
@Service
@Transactional
public class AccountService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    public AccountService(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ─────────────────────────── ADMIN: QUERY ───────────────────────────

    /**
     * Lấy danh sách tài khoản với phân trang, tìm kiếm theo tên/email và lọc theo role.
     *
     * @param pageable thông tin phân trang và sắp xếp
     * @param search   từ khóa tìm kiếm (tên hoặc email)
     * @param role     lọc theo role (VD: "ROLE_USER", "ROLE_ADMIN")
     * @return trang kết quả AccountResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<AccountResponse> findAll(Pageable pageable, String search, String role) {
        Specification<Account> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String keyword = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")), keyword),
                    cb.like(cb.lower(root.get("email")), keyword)
            ));
        }

        if (role != null && !role.trim().isEmpty()) {
            spec = spec.and((root, query, cb) ->
                    cb.equal(root.get("roles"), role.trim()));
        }

        return accountRepository.findAll(spec, pageable).map(AccountMapper::toResponse);
    }

    /**
     * Lấy thông tin tài khoản theo id.
     *
     * @param id id của tài khoản
     * @return AccountResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public AccountResponse getById(Integer id) {
        return AccountMapper.toResponse(findAccountById(id));
    }

    // ─────────────────────────── ADMIN: CRUD ───────────────────────────

    /**
     * Tạo tài khoản mới.
     * Email sẽ được chuẩn hóa (trim + lowercase) trước khi kiểm tra trùng lặp.
     *
     * @param request dữ liệu tạo tài khoản
     * @return AccountResponse vừa tạo
     * @throws ResourceAlreadyExistsException nếu email đã tồn tại
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

        return AccountMapper.toResponse(accountRepository.save(account));
    }

    /**
     * Cập nhật thông tin tài khoản theo id.
     *
     * @param id      id của tài khoản
     * @param request dữ liệu cập nhật
     * @return AccountResponse đã cập nhật
     * @throws ResourceAlreadyExistsException nếu email mới đã tồn tại ở tài khoản khác
     */
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

    /**
     * Xóa tài khoản theo id.
     * Không cho xóa nếu tài khoản còn đơn hàng liên quan.
     *
     * @param id id của tài khoản
     * @throws InvalidOperationException nếu tài khoản còn đơn hàng
     */
    public void delete(Integer id) {
        Account account = findAccountById(id);

        if (account.getOrders() != null && !account.getOrders().isEmpty()) {
            throw new InvalidOperationException(
                    "Cannot delete account that has orders. Please remove or reassign orders first."
            );
        }

        accountRepository.delete(account);
    }

    /**
     * Cập nhật role của tài khoản (chỉ Admin).
     *
     * @param id      id của tài khoản
     * @param request chứa role mới
     * @return AccountResponse đã cập nhật
     */
    public AccountResponse updateRole(Integer id, UpdateRoleRequest request) {
        Account account = findAccountById(id);
        account.setRoles(request.getRole().trim());
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    /**
     * Enable tài khoản (kích hoạt).
     * Lưu ý: cần thêm field {@code enabled} vào entity Account để hoạt động đúng.
     *
     * @param id id của tài khoản
     * @return AccountResponse
     */
    public AccountResponse enableAccount(Integer id) {
        Account account = findAccountById(id);
        // TODO: account.setEnabled(true) khi field được thêm vào entity
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    /**
     * Disable tài khoản (vô hiệu hóa).
     * Lưu ý: cần thêm field {@code enabled} vào entity Account để hoạt động đúng.
     *
     * @param id id của tài khoản
     * @return AccountResponse
     */
    public AccountResponse disableAccount(Integer id) {
        Account account = findAccountById(id);
        // TODO: account.setEnabled(false) khi field được thêm vào entity
        return AccountMapper.toResponse(accountRepository.save(account));
    }

    // ─────────────────────────── USER: SELF-SERVICE ───────────────────────────

    /**
     * Lấy thông tin tài khoản đang đăng nhập.
     *
     * @return AccountResponse của user hiện tại
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public AccountResponse getCurrentUser() {
        return AccountMapper.toResponse(getCurrentAccount());
    }

    /**
     * Cập nhật thông tin tài khoản đang đăng nhập.
     *
     * @param request dữ liệu cập nhật
     * @return AccountResponse đã cập nhật
     */
    public AccountResponse updateCurrentUser(AccountUpdateRequest request) {
        Account account = getCurrentAccount();
        return update(account.getId(), request);
    }

    /**
     * Đổi mật khẩu cho tài khoản đang đăng nhập.
     * Kiểm tra mật khẩu cũ trước khi cập nhật.
     *
     * @param request chứa oldPassword và newPassword
     * @throws InvalidOperationException nếu mật khẩu cũ không đúng
     */
    public void changePassword(ChangePasswordRequest request) {
        Account account = getCurrentAccount();

        if (!passwordEncoder.matches(request.getOldPassword(), account.getPassword())) {
            throw new InvalidOperationException("Current password is incorrect.");
        }

        account.setPassword(passwordEncoder.encode(request.getNewPassword()));
        accountRepository.save(account);
    }

    // ─────────────────────────── STATS / ORDERS ───────────────────────────

    /**
     * Lấy danh sách đơn hàng theo account id.
     *
     * @param accountId id của tài khoản
     * @return danh sách OrderBasicResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public List<OrderBasicResponse> getOrdersByAccountId(Integer accountId) {
        Account account = findAccountById(accountId);
        return OrderMapper.toResponses(account.getOrders());
    }

    /**
     * Lấy thống kê cơ bản của tài khoản (tổng đơn hàng).
     *
     * @param accountId id của tài khoản
     * @return Map chứa các thống kê: totalOrders, accountId, accountName, accountEmail
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Map<String, Object> getAccountStats(Integer accountId) {
        Account account = findAccountById(accountId);

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", account.getOrders() != null ? account.getOrders().size() : 0);
        stats.put("accountId", accountId);
        stats.put("accountName", account.getName());
        stats.put("accountEmail", account.getEmail());

        return stats;
    }

    // ─────────────────────────── PRIVATE HELPERS ───────────────────────────

    private Account findAccountById(Integer id) {
        return accountRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "id", id));
    }

    private Account getCurrentAccount() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails)) {
            throw new InvalidOperationException("User not authenticated.");
        }
        String email = ((UserDetails) authentication.getPrincipal()).getUsername();
        return accountRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Account", "email", email));
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
