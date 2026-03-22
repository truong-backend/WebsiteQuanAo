package com.example.Server.dto.response.contact;

import com.example.Server.enums.ContactStatus;
import lombok.*;

import java.time.LocalDateTime;

/** Response trả về thông tin liên hệ. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private ContactStatus status;
    private LocalDateTime createdAt;
    private String adminNote;
}
