package com.example.Server.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Entity
@Data
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "accounts")
public class Account implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private String roles;

    /**
     * Trạng thái tài khoản — true = hoạt động, false = bị khóa.
     * Mặc định true khi tạo mới.
     * Khi false, Spring Security từ chối đăng nhập với lỗi DisabledException.
     */
    @Column(nullable = false)
    private boolean enabled = true;

    @OneToMany(mappedBy = "account")
    private List<Order> orders;

    /** Trả về authority từ field roles (VD: "ROLE_USER" → SimpleGrantedAuthority). */
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(roles));
    }

    @Override public String  getUsername()              { return email; }
    @Override public boolean isEnabled()                { return enabled; }
    @Override public boolean isAccountNonExpired()      { return true; }
    @Override public boolean isAccountNonLocked()       { return true; }
    @Override public boolean isCredentialsNonExpired()  { return true; }
}