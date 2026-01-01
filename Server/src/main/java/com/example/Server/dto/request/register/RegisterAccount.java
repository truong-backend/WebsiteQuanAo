package com.example.Server.dto.request.register;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor

public class RegisterAccount {
    private String email;

    private String password;

    private String fullName;
}
