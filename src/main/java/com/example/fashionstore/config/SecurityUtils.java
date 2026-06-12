package com.example.fashionstore.config;

import com.example.fashionstore.module.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new RuntimeException("No authenticated user");
        }
        return (User) auth.getPrincipal();
    }

    public static String getCurrentEmail() {
        return getCurrentUser().getEmail();
    }
}