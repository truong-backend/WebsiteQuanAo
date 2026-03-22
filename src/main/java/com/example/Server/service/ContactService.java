package com.example.Server.service;

import com.example.Server.dto.request.contact.ContactCreateRequest;
import com.example.Server.dto.request.contact.ContactReplyRequest;
import com.example.Server.dto.request.contact.ContactStatusUpdateRequest;
import com.example.Server.dto.response.contact.ContactResponse;
import com.example.Server.entity.Contact;
import com.example.Server.enums.ContactStatus;
import com.example.Server.exception.ResourceNotFoundException;
import com.example.Server.mapper.ContactMapper;
import com.example.Server.repository.ContactRepository;
import jakarta.transaction.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.Map;

/**
 * Service xử lý nghiệp vụ liên hệ (Contact).
 *
 * <p>Hai nhóm chức năng:
 * <ul>
 *   <li><b>Public:</b> {@link #submit} — ai cũng gọi được, không cần đăng nhập</li>
 *   <li><b>Admin:</b> xem danh sách, đổi trạng thái, gửi email phản hồi, xóa, thống kê</li>
 * </ul>
 */
@Service
@Transactional
public class ContactService {

    private final ContactRepository contactRepository;
    private final EmailService emailService;

    public ContactService(ContactRepository contactRepository, EmailService emailService) {
        this.contactRepository = contactRepository;
        this.emailService = emailService;
    }

    // ─────────────────────── PUBLIC ───────────────────────────

    /**
     * Lưu liên hệ mới từ khách hàng.
     * Trạng thái mặc định là UNREAD.
     *
     * @param request thông tin liên hệ
     * @return ContactResponse vừa tạo
     */
    public ContactResponse submit(ContactCreateRequest request) {
        Contact contact = new Contact();
        contact.setName(request.getName().trim());
        contact.setEmail(request.getEmail().trim().toLowerCase());
        contact.setPhone(request.getPhone() != null ? request.getPhone().trim() : null);
        contact.setSubject(request.getSubject() != null ? request.getSubject().trim() : null);
        contact.setMessage(request.getMessage().trim());
        contact.setStatus(ContactStatus.UNREAD);
        return ContactMapper.toResponse(contactRepository.save(contact));
    }

    // ─────────────────────── ADMIN ────────────────────────────

    /**
     * Lấy danh sách liên hệ với phân trang, tìm kiếm và lọc theo trạng thái.
     *
     * @param pageable thông tin phân trang
     * @param search   tìm theo tên, email, subject
     * @param status   lọc theo trạng thái (null = tất cả)
     * @return trang ContactResponse
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Page<ContactResponse> findAll(Pageable pageable, String search, ContactStatus status) {
        Specification<Contact> spec = (root, query, cb) -> cb.conjunction();

        if (search != null && !search.trim().isEmpty()) {
            String kw = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("name")),    kw),
                    cb.like(cb.lower(root.get("email")),   kw),
                    cb.like(cb.lower(root.get("subject")), kw)
            ));
        }

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        return contactRepository.findAll(spec, pageable).map(ContactMapper::toResponse);
    }

    /**
     * Lấy chi tiết một liên hệ theo id.
     * Tự động đổi trạng thái UNREAD → READ khi admin xem.
     *
     * @param id id liên hệ
     * @return ContactResponse
     */
    public ContactResponse getById(Long id) {
        Contact contact = findContactById(id);

        if (contact.getStatus() == ContactStatus.UNREAD) {
            contact.setStatus(ContactStatus.READ);
            contactRepository.save(contact);
        }

        return ContactMapper.toResponse(contact);
    }

    /**
     * Cập nhật trạng thái và ghi chú nội bộ cho liên hệ.
     *
     * @param id      id liên hệ
     * @param request trạng thái mới và ghi chú
     * @return ContactResponse đã cập nhật
     */
    public ContactResponse updateStatus(Long id, ContactStatusUpdateRequest request) {
        Contact contact = findContactById(id);
        contact.setStatus(request.getStatus());
        if (request.getAdminNote() != null) {
            contact.setAdminNote(request.getAdminNote().trim());
        }
        return ContactMapper.toResponse(contactRepository.save(contact));
    }

    /**
     * Gửi email phản hồi đến người liên hệ.
     *
     * <p>Sau khi gửi thành công:
     * <ul>
     *   <li>Trạng thái liên hệ tự động chuyển thành {@code REPLIED}</li>
     *   <li>Nội dung phản hồi được lưu vào {@code adminNote} để tra cứu sau</li>
     * </ul>
     *
     * @param id      id liên hệ
     * @param request tiêu đề và nội dung email phản hồi
     * @return ContactResponse đã cập nhật trạng thái REPLIED
     * @throws RuntimeException nếu gửi email thất bại
     */
    public ContactResponse sendReply(Long id, ContactReplyRequest request) {
        Contact contact = findContactById(id);

        // Build và gửi email HTML
        String htmlBody = emailService.buildReplyTemplate(contact.getName(), request.getBody());
        emailService.sendHtml(contact.getEmail(), contact.getName(), request.getSubject(), htmlBody);

        // Cập nhật trạng thái → REPLIED, lưu nội dung phản hồi vào adminNote
        contact.setStatus(ContactStatus.REPLIED);
        contact.setAdminNote("📧 Đã phản hồi:\n" + request.getBody());
        contactRepository.save(contact);

        return ContactMapper.toResponse(contact);
    }

    /**
     * Xóa liên hệ theo id.
     *
     * @param id id liên hệ
     */
    public void delete(Long id) {
        contactRepository.delete(findContactById(id));
    }

    /**
     * Thống kê số lượng liên hệ theo từng trạng thái.
     *
     * @return Map với key là tên trạng thái, value là số lượng
     */
    @Transactional(Transactional.TxType.SUPPORTS)
    public Map<String, Long> getStats() {
        return Map.of(
                "UNREAD",  contactRepository.countByStatus(ContactStatus.UNREAD),
                "READ",    contactRepository.countByStatus(ContactStatus.READ),
                "REPLIED", contactRepository.countByStatus(ContactStatus.REPLIED),
                "TOTAL",   contactRepository.count()
        );
    }

    // ─────────────────────── PRIVATE ──────────────────────────

    private Contact findContactById(Long id) {
        return contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact", "id", id));
    }
}
