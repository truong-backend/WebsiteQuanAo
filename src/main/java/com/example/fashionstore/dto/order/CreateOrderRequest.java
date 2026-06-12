package com.example.fashionstore.dto.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.util.List;

@Data
public class CreateOrderRequest {

    @NotBlank(message = "Số điện thoại không được để trống")
    @Pattern(regexp = "^[0-9]{10,11}$", message = "Số điện thoại không hợp lệ")
    private String phoneNumber;

    @NotBlank(message = "Địa chỉ giao hàng không được để trống")
    @Size(max = 300)
    private String shippingAddress;

    @Size(max = 500)
    private String note;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod;  // COD, VNPAY

    /** ID voucher đã apply — null nếu không dùng */
    private Long voucherId;

    @NotEmpty(message = "Đơn hàng phải có ít nhất 1 sản phẩm")
    @Valid
    private List<OrderItemRequest> items;

    /** true = xóa cart sau khi đặt hàng */
    private boolean clearCart = true;

    @Data
    public static class OrderItemRequest {
        @NotBlank(message = "Variant ID không được để trống")
        private String variantId;

        @NotNull
        @Min(value = 1, message = "Số lượng tối thiểu là 1")
        private Integer quantity;
    }
}