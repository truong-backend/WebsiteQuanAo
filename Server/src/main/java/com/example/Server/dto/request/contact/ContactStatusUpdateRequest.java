package com.example.Server.dto.request.contact;

import com.example.Server.enums.ContactStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/** Request Admin đổi trạng thái liên hệ. */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactStatusUpdateRequest {

    @NotNull(message = "Trạng thái không được để trống")
    private ContactStatus status;

    /** Ghi chú nội bộ (tùy chọn) */
    private String adminNote;
}
