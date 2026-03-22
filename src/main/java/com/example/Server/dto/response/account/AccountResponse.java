package com.example.Server.dto.response.account;

import lombok.*;

@Data @NoArgsConstructor @AllArgsConstructor
public class AccountResponse {
    private Integer id;
    private String name;
    private String email;
    private String roles;

    private boolean enabled;
}
