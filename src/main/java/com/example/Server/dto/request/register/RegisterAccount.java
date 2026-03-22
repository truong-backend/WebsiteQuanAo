package com.example.Server.dto.request.register;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class RegisterAccount {
    private String email;
    private String password;
    private String name;
}
