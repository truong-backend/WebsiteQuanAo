package com.example.fashionstore.common.util;

import com.example.fashionstore.module.user.User;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    public static User getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) return null;
        Object principal = auth.getPrincipal();
        return principal instanceof User ? (User) principal : null;
    }

    public static boolean isAdmin() {
        User user = getCurrentUser();
        return user != null && user.getRole() == User.Role.ROLE_ADMIN;
    }
}