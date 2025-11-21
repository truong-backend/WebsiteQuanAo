package com.example.Server.entity;

import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "AuthRequest")
public class AuthRequest {

    private String username;
    private String password;
}
