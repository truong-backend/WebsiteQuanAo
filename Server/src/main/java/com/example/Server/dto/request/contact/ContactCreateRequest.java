package com.example.Server.dto.request.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

/**
 * Request gửi liên hệ từ phía user/khách.
 * Không yêu cầu đăng nhập.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactCreateRequest {

    @NotBlank(message = "Họ tên không được để trống")
    @Size(max = 100, message = "Họ tên tối đa 100 ký tự")
    private String name;

    @NotBlank(message = "Email không được để trống")
    @Email(message = "Email không hợp lệ")
    @Size(max = 150)
    private String email;

    @Size(max = 20, message = "Số điện thoại tối đa 20 ký tự")
    private String phone;

    @Size(max = 200, message = "Chủ đề tối đa 200 ký tự")
    private String subject;

    @NotBlank(message = "Nội dung không được để trống")
    private String message;
}
