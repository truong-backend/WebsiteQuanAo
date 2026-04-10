package com.example.fashionstore.service.voucher;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.dto.voucher.*;
import com.example.fashionstore.module.voucher.Voucher;
import com.example.fashionstore.repository.voucher.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class VoucherService {

    private final VoucherRepository voucherRepository;

    // ── Read ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VoucherDto> findAll() {
        return voucherRepository.findAll().stream().map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<VoucherDto> findAllValid() {
        return voucherRepository.findAllValid(LocalDateTime.now()).stream()
                .map(this::toDto).toList();
    }

    @Transactional(readOnly = true)
    public VoucherDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    // ── Apply voucher (user dùng khi checkout) ───────────────────────

    /**
     * Kiểm tra và tính toán số tiền giảm của voucher.
     * Không trừ usedCount ở đây — chỉ trừ khi order được tạo thành công.
     */
    @Transactional(readOnly = true)
    public ApplyVoucherResponse applyVoucher(ApplyVoucherRequest req) {
        Voucher voucher = voucherRepository.findByCodeIgnoreCase(req.getCode().trim())
                .orElseThrow(() -> new BusinessException("Mã voucher '" + req.getCode() + "' không tồn tại"));

        if (!voucher.isValid())
            throw new BusinessException("Mã voucher đã hết hạn hoặc đã sử dụng hết");

        if (req.getSubtotal().compareTo(voucher.getMinOrderAmount()) < 0)
            throw new BusinessException(
                    "Đơn hàng phải từ " + voucher.getMinOrderAmount() + "₫ để sử dụng mã này"
            );

        // Tính discount (ship fee = 30k mặc định, sẽ được tính lại khi tạo order)
        BigDecimal shippingFee = req.getSubtotal().compareTo(new BigDecimal("500000")) >= 0
                ? BigDecimal.ZERO : new BigDecimal("30000");
        BigDecimal discount = voucher.calculateDiscount(req.getSubtotal(), shippingFee);

        return ApplyVoucherResponse.builder()
                .voucherId(voucher.getId())
                .code(voucher.getCode())
                .discountAmount(discount)
                .message("Áp dụng thành công! Giảm " + discount + "₫")
                .build();
    }

    /**
     * Gọi khi tạo order thành công — tăng usedCount.
     * Phải gọi trong cùng transaction với createOrder.
     */
    public void incrementUsage(Long voucherId) {
        Voucher voucher = findOrThrow(voucherId);
        voucher.setUsedCount(voucher.getUsedCount() + 1);
        voucherRepository.save(voucher);
    }

    // ── Admin CRUD ───────────────────────────────────────────────────

    public VoucherDto create(VoucherRequest req) {
        if (voucherRepository.existsByCodeIgnoreCase(req.getCode().trim()))
            throw new BusinessException("Mã voucher '" + req.getCode() + "' đã tồn tại");

        validateVoucherRequest(req);

        Voucher voucher = Voucher.builder()
                .code(req.getCode().toUpperCase().trim())
                .description(req.getDescription())
                .type(req.getType())
                .value(req.getValue())
                .minOrderAmount(req.getMinOrderAmount() != null ? req.getMinOrderAmount() : BigDecimal.ZERO)
                .maxDiscount(req.getMaxDiscount())
                .usageLimit(req.getUsageLimit())
                .startDate(req.getStartDate())
                .endDate(req.getEndDate())
                .active(req.isActive())
                .build();

        return toDto(voucherRepository.save(voucher));
    }

    public VoucherDto update(Long id, VoucherRequest req) {
        Voucher voucher = findOrThrow(id);

        // Kiểm tra conflict code (trừ chính nó)
        if (!voucher.getCode().equalsIgnoreCase(req.getCode().trim())
                && voucherRepository.existsByCodeIgnoreCase(req.getCode().trim()))
            throw new BusinessException("Mã voucher '" + req.getCode() + "' đã tồn tại");

        validateVoucherRequest(req);

        voucher.setCode(req.getCode().toUpperCase().trim());
        voucher.setDescription(req.getDescription());
        voucher.setType(req.getType());
        voucher.setValue(req.getValue());
        voucher.setMinOrderAmount(req.getMinOrderAmount() != null ? req.getMinOrderAmount() : BigDecimal.ZERO);
        voucher.setMaxDiscount(req.getMaxDiscount());
        voucher.setUsageLimit(req.getUsageLimit());
        voucher.setStartDate(req.getStartDate());
        voucher.setEndDate(req.getEndDate());
        voucher.setActive(req.isActive());

        return toDto(voucherRepository.save(voucher));
    }

    public void delete(Long id) {
        Voucher voucher = findOrThrow(id);
        voucherRepository.delete(voucher);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private void validateVoucherRequest(VoucherRequest req) {
        if (req.getType() == Voucher.VoucherType.PERCENTAGE
                && (req.getValue().compareTo(BigDecimal.ZERO) <= 0
                || req.getValue().compareTo(BigDecimal.valueOf(100)) > 0))
            throw new BusinessException("Giá trị phần trăm phải từ 1 đến 100");
    }

    private Voucher findOrThrow(Long id) {
        return voucherRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Voucher", "id", id));
    }

    public VoucherDto toDto(Voucher v) {
        return VoucherDto.builder()
                .id(v.getId())
                .code(v.getCode())
                .description(v.getDescription())
                .type(v.getType())
                .value(v.getValue())
                .minOrderAmount(v.getMinOrderAmount())
                .maxDiscount(v.getMaxDiscount())
                .usageLimit(v.getUsageLimit())
                .usedCount(v.getUsedCount())
                .startDate(v.getStartDate())
                .endDate(v.getEndDate())
                .active(v.isActive())
                .createdAt(v.getCreatedAt())
                .build();
    }
}