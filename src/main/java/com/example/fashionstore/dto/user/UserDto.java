package com.example.fashionstore.dto.user;

import com.example.fashionstore.module.user.User;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDto {
    private Integer       id;
    private String        name;
    private String        email;
    private String        phone;
    private String        avatarUrl;
    private String        role;
    private boolean       enabled;
    private boolean       emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserDto from(User u) {
        return UserDto.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .avatarUrl(u.getAvatarUrl())
                .role(u.getRole().name())
                .enabled(u.isEnabledRaw())
                .emailVerified(u.isEmailVerified())
                .createdAt(u.getCreatedAt())
                .updatedAt(u.getUpdatedAt())
                .build();
    }
}