package com.example.Server.service;

import com.example.Server.dto.request.auth.AuthRequest;
import com.example.Server.dto.request.register.RegisterAccount;
import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.entity.Account;
import com.example.Server.mapper.AccountMapper;
import com.example.Server.repository.AccountRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/**
 * Service xử lý đăng ký và đăng nhập tài khoản.
 */
@Service
public class AuthenticationService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            AccountRepository accountRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.accountRepository = accountRepository;
        this.authenticationManager = authenticationManager;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Đăng ký tài khoản mới với role mặc định ROLE_USER.
     *
     * @param request thông tin đăng ký
     * @return AccountResponse của tài khoản vừa tạo
     */
    public AccountResponse signup(RegisterAccount request) {
        Account account = new Account();
        account.setName(request.getName());
        account.setEmail(request.getEmail());
        account.setPassword(passwordEncoder.encode(request.getPassword()));
        account.setRoles("ROLE_USER");
        accountRepository.save(account);
        return AccountMapper.toResponse(account);
    }

    /**
     * Xác thực thông tin đăng nhập.
     *
     * @param request chứa email và password
     * @return Account entity (dùng để tạo JWT)
     */
    public Account authenticate(AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        return accountRepository.findByEmail(request.getEmail()).orElseThrow();
    }
}
