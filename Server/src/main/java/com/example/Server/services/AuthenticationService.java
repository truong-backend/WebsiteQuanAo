package com.example.Server.services;

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

@Service
public class AuthenticationService {
    private final AccountRepository userRepository;

    private final PasswordEncoder passwordEncoder;

    private final AuthenticationManager authenticationManager;

    public AuthenticationService(
            AccountRepository userRepository,
            AuthenticationManager authenticationManager,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AccountResponse signup(RegisterAccount input) {
        Account user = new Account();
        user.setName(input.getName());
        user.setEmail(input.getEmail());
        user.setPassword(passwordEncoder.encode(input.getPassword()));
        user.setRoles("ROLE_USER");

        userRepository.save(user);

        return AccountMapper.toResponse(user);
    }

    public Account authenticate(AuthRequest input) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        input.getEmail(),
                        input.getPassword()
                )
        );

        return userRepository.findByEmail(input.getEmail())
                .orElseThrow();
    }
}