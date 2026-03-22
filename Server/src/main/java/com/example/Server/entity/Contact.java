package com.example.Server.entity;

import com.example.Server.enums.ContactStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

/**
 * Entity lưu thông tin liên hệ từ khách hàng.
 * Ai cũng gửi được (không yêu cầu đăng nhập).
 */
@Entity
@Table(name = "contacts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Họ tên người gửi */
    @Column(nullable = false, length = 100)
    private String name;

    /** Email để admin phản hồi */
    @Column(nullable = false, length = 150)
    private String email;

    /** Số điện thoại (tùy chọn) */
    @Column(name = "phone", length = 20)
    private String phone;

    /** Chủ đề liên hệ */
    @Column(name = "subject", length = 200)
    private String subject;

    /** Nội dung tin nhắn */
    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    /** Trạng thái xử lý */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ContactStatus status = ContactStatus.UNREAD;

    /** Thời điểm gửi — tự động set */
    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Ghi chú nội bộ của admin (không hiển thị cho user) */
    @Column(name = "admin_note", columnDefinition = "TEXT")
    private String adminNote;
}
