package com.example.Server.controller;

import com.example.Server.dto.request.auth.AuthRequest;
import com.example.Server.dto.request.register.RegisterAccount;
import com.example.Server.dto.response.account.AccountResponse;
import com.example.Server.dto.response.auth.LoginResponse;
import com.example.Server.entity.Account;
import com.example.Server.service.AuthenticationService;
import com.example.Server.service.JwtService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controller xử lý đăng ký và đăng nhập.
 * Base path: /auth
 */
@RestController
@RequestMapping("/auth")
public class AuthenticationController {

    private final JwtService jwtService;
    private final AuthenticationService authenticationService;

    public AuthenticationController(JwtService jwtService, AuthenticationService authenticationService) {
        this.jwtService = jwtService;
        this.authenticationService = authenticationService;
    }

    /** POST /auth/signup — đăng ký tài khoản mới */
    @PostMapping("/signup")
    public ResponseEntity<AccountResponse> signup(@RequestBody RegisterAccount request) {
        return ResponseEntity.ok(authenticationService.signup(request));
    }

    /** POST /auth/login — đăng nhập, nhận JWT token */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody AuthRequest request) {
        Account account = authenticationService.authenticate(request);

        Map<String, Object> claims = new HashMap<>();
        claims.put("roles", List.of(account.getRoles()));
        String token = jwtService.generateToken(claims, account);

        LoginResponse response = new LoginResponse();
        response.setToken(token);
        response.setExpiresIn(jwtService.getExpirationTime());
        return ResponseEntity.ok(response);
    }
}
