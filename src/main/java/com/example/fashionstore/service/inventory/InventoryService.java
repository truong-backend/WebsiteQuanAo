package com.example.fashionstore.service.inventory;

import com.example.fashionstore.common.exception.BusinessException;
import com.example.fashionstore.common.exception.ResourceNotFoundException;
import com.example.fashionstore.common.util.SecurityUtils;
import com.example.fashionstore.dto.inventory.*;
import com.example.fashionstore.module.inventory.InventoryLog;
import com.example.fashionstore.module.inventory.InventoryLog.ChangeType;
import com.example.fashionstore.module.user.User;
import com.example.fashionstore.module.variant.ProductVariant;
import com.example.fashionstore.repository.inventory.InventoryLogRepository;
import com.example.fashionstore.repository.variant.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryService {

    private final ProductVariantRepository variantRepository;
    private final InventoryLogRepository   logRepository;

    // ── Read ────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public Page<InventoryLogDto> getLogs(Pageable pageable) {
        return logRepository.findAllByOrderByCreatedAtDesc(pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public Page<InventoryLogDto> getLogsByVariant(String variantId, Pageable pageable) {
        return logRepository.findByVariantId(variantId, pageable).map(this::toDto);
    }

    @Transactional(readOnly = true)
    public List<InventoryLogDto> getLogsByProduct(String productId) {
        return logRepository.findByProductId(productId).stream().map(this::toDto).toList();
    }

    // ── Nhập hàng (admin) ───────────────────────────────────────────

    /**
     * Admin nhập thêm hàng vào kho cho 1 variant.
     * quantity: số lượng nhập thêm (dương).
     */
    public InventoryLogDto importStock(ImportStockRequest req) {
        User admin    = SecurityUtils.getCurrentUser();
        ProductVariant variant = findVariant(req.getVariantId());

        int newQty = variant.getQuantity() + req.getQuantity();
        variant.setQuantity(newQty);
        variantRepository.save(variant);

        InventoryLog log = InventoryLog.builder()
                .variant(variant)
                .changeType(ChangeType.IMPORT)
                .quantity(req.getQuantity())
                .quantityAfter(newQty)
                .note(req.getNote())
                .createdBy(admin)
                .build();

        return toDto(logRepository.save(log));
    }

    // ── Điều chỉnh kho (admin) ──────────────────────────────────────

    /**
     * Admin đặt số lượng tồn kho về giá trị cụ thể (newQuantity).
     * Ghi log với delta = |newQuantity - currentQuantity|.
     */
    public InventoryLogDto adjustStock(AdjustStockRequest req) {
        User admin    = SecurityUtils.getCurrentUser();
        ProductVariant variant = findVariant(req.getVariantId());

        int delta      = req.getNewQuantity() - variant.getQuantity();
        int absQuantity = Math.abs(delta);

        variant.setQuantity(req.getNewQuantity());
        variantRepository.save(variant);

        InventoryLog log = InventoryLog.builder()
                .variant(variant)
                .changeType(ChangeType.ADJUST)
                .quantity(absQuantity)
                .quantityAfter(req.getNewQuantity())
                .note((req.getNote() != null ? req.getNote() + " | " : "")
                        + "Điều chỉnh: " + (delta >= 0 ? "+" : "") + delta)
                .createdBy(admin)
                .build();

        return toDto(logRepository.save(log));
    }

    // ── Internal: ghi log khi xuất/nhập do order ────────────────────

    /**
     * Gọi khi tạo order — ghi log EXPORT_SALE cho mỗi item.
     * Phải gọi trong cùng transaction với createOrder.
     */
    public void logSale(ProductVariant variant, int qty, int quantityAfter, String orderId) {
        InventoryLog log = InventoryLog.builder()
                .variant(variant)
                .changeType(ChangeType.EXPORT_SALE)
                .quantity(qty)
                .quantityAfter(quantityAfter)
                .orderId(orderId)
                .note("Xuất kho do đặt hàng #" + orderId.substring(0, 8).toUpperCase())
                .build();
        logRepository.save(log);
    }

    /**
     * Gọi khi hủy order — ghi log RETURN cho mỗi item.
     */
    public void logReturn(ProductVariant variant, int qty, int quantityAfter, String orderId) {
        InventoryLog log = InventoryLog.builder()
                .variant(variant)
                .changeType(ChangeType.RETURN)
                .quantity(qty)
                .quantityAfter(quantityAfter)
                .orderId(orderId)
                .note("Hoàn kho do hủy đơn #" + orderId.substring(0, 8).toUpperCase())
                .build();
        logRepository.save(log);
    }

    // ── Helpers ──────────────────────────────────────────────────────

    private ProductVariant findVariant(String id) {
        return variantRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ProductVariant", "id", id));
    }

    public InventoryLogDto toDto(InventoryLog l) {
        ProductVariant v = l.getVariant();
        return InventoryLogDto.builder()
                .id(l.getId())
                .variantId(v.getId())
                .variantSku(v.getSku())
                .productId(v.getProduct() != null ? v.getProduct().getId() : null)
                .productName(v.getProduct() != null ? v.getProduct().getName() : null)
                .colorName(v.getColorName())
                .sizeCode(v.getSizeCode())
                .changeType(l.getChangeType())
                .quantity(l.getQuantity())
                .quantityAfter(l.getQuantityAfter())
                .note(l.getNote())
                .orderId(l.getOrderId())
                .createdByName(l.getCreatedBy() != null ? l.getCreatedBy().getName() : "System")
                .createdAt(l.getCreatedAt())
                .build();
    }
}