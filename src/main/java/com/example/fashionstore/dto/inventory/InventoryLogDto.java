package com.example.fashionstore.dto.inventory;

import com.example.fashionstore.module.inventory.InventoryLog.ChangeType;
import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryLogDto {
    private Long          id;
    private String        variantId;
    private String        variantSku;
    private String        productId;
    private String        productName;
    private String        colorName;
    private String        sizeCode;
    private ChangeType    changeType;
    private int           quantity;
    private int           quantityAfter;
    private String        note;
    private String        orderId;
    private String        createdByName;
    private LocalDateTime createdAt;
}