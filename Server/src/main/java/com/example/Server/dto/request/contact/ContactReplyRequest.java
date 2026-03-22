package com.example.Server.dto.request.contact;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

/**
 * Request Admin gửi email phản hồi cho người liên hệ.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactReplyRequest {

    /** Tiêu đề email phản hồi */
    @NotBlank(message = "Tiêu đề không được để trống")
    private String subject;

    /** Nội dung email phản hồi */
    @NotBlank(message = "Nội dung phản hồi không được để trống")
    private String body;
}
