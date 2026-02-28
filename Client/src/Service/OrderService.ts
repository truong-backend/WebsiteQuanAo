import axios from "axios";
import { orderApi } from "../api/CallApi/OrderApi";
import type { OrderCreateRequest } from "../type/Orders/OrderCreateRequest";
import type { ClientOrderItem } from "../type/Orders/OrderCreateRequest";
import type { OrderUpdateRequest } from "../type/Orders/OrderUpdateRequest";
import type { OrderResponse } from "../type/Orders/OrderResponse";
import type { OrderResponsePageResponse } from "../type/Orders/OrderResponse";
import { OrderStatus } from "../type/Orders/OrderStatus";

/** Lấy message lỗi từ response (hỗ trợ nhiều format backend) */
function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const obj = data as Record<string, unknown>;
  if (typeof obj.message === "string" && obj.message) return obj.message;
  if (typeof obj.error === "string" && obj.error) return obj.error;
  if (typeof obj.errorCode === "string" && obj.errorCode) return obj.errorCode;
  return fallback;
}

/**
 * Service layer for order operations
 * Handles business logic and error transformation
 */
export const OrderService = {
  /**
   * Get paginated list of orders with advanced filters
   * @param page - Page number (0-indexed)
   * @param size - Items per page
   * @param search - Search term for order search (id, phone, address, status)
   * @param sortBy - Field to sort by
   * @param sortDir - Sort direction
   * @param status - Filter by order status
   * @param startDate - Filter by start date
   * @param endDate - Filter by end date
   * @param accountId - Filter by customer/account ID
   * @returns Paginated order response
   */
  /** GET /orders - khớp server (page, size, search, sortBy, sortDir, status, startDate, endDate, accountId) */
  getOrdersPaged: async (
    page = 0,
    size = 10,
    search?: string,
    sortBy = "orderTime",
    sortDir: "asc" | "desc" = "desc",
    status?: OrderStatus,
    startDate?: string,
    endDate?: string,
    accountId?: number
  ): Promise<OrderResponsePageResponse> => {
    try {
      return await orderApi.getOrders(page, size, search, sortBy, sortDir, {
        status,
        startDate,
        endDate,
        accountId,
      });
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        throw new Error(getErrorMessage(data, "Không thể tải danh sách đơn hàng"));
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Create a new order
   * @param payload - Order creation data
   * @returns Created order
   */
  createOrder: async (payload: OrderCreateRequest): Promise<OrderResponse> => {
    try {
      return await orderApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        const msg = getErrorMessage(data, "Có lỗi xảy ra khi tạo đơn hàng");

        if (error.response.status === 409) {
          throw new Error(msg || "Mã đơn hàng đã tồn tại");
        }
        if (error.response.status === 404) {
          throw new Error(msg || "Tài khoản hoặc phương thức thanh toán không tồn tại");
        }
        if (error.response.status === 400) {
          throw new Error(msg || "Dữ liệu không hợp lệ. Kiểm tra lại thông tin.");
        }
        throw new Error(msg);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Tạo đơn hàng từ giỏ hàng. Gửi thông tin đơn + orderItems (server hiện bỏ qua orderItems).
   * Để thêm chi tiết đơn theo server: tạo đơn xong gọi OrderItemService.create với orderId + productVariantId.
   */
  createOrderFromCart: async (
    cartItems: { id: string; name: string; price: number; quantity: number }[],
    form: { phoneNumber: string; address: string; note?: string },
  ): Promise<OrderResponse> => {
    const now = new Date();
    // Spring Boot DTO dùng LocalDateTime, nên gửi dạng 'yyyy-MM-ddTHH:mm:ss' (không kèm múi giờ 'Z')
    const orderTime = now.toISOString().slice(0, 19);

    const orderItems: ClientOrderItem[] = cartItems.map((item) => ({
      productId: item.id,
      productName: item.name,
      quantity: item.quantity,
      unitPrice: item.price,
    }));
    const payload: OrderCreateRequest = {
      orderTime,
      phoneNumber: form.phoneNumber,
      address: form.address,
      note: form.note,
      status: OrderStatus.PENDING,
      orderItems,
    };
    return OrderService.createOrder(payload);
  },

  /**
   * Update an existing order
   * @param id - Order ID to update
   * @param payload - Updated order data
   * @returns Updated order
   */
  updateOrder: async (
    id: string,
    payload: OrderUpdateRequest,
  ): Promise<OrderResponse> => {
    try {
      return await orderApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = getErrorMessage(error.response.data, "Có lỗi xảy ra khi cập nhật đơn hàng");
        if (error.response.status === 404) throw new Error("Không tìm thấy đơn hàng");
        if (error.response.status === 400) throw new Error(msg || "Thao tác không hợp lệ");
        throw new Error(msg);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  getOrderById: async (id: string): Promise<OrderResponse> => {
    try {
      return await orderApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) throw new Error("Không tìm thấy đơn hàng");
        throw new Error(getErrorMessage(error.response.data, "Có lỗi xảy ra khi lấy đơn hàng"));
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Delete an order
   * @param id - Order ID to delete
   * @returns True if deletion successful
   */
  deleteOrder: async (id: string): Promise<void> => {
    try {
      return await orderApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404) throw new Error("Đơn hàng không tồn tại hoặc đã bị xóa");
        const msg = getErrorMessage(
          error.response.data,
          "Không thể xóa đơn hàng đang có sản phẩm. Vui lòng xóa các sản phẩm trong đơn hàng trước."
        );
        throw new Error(msg);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  updateOrderStatus: async (id: string, status: OrderStatus): Promise<OrderResponse> => {
  try {
    return await orderApi.updateStatus(id, status);
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      const msg = getErrorMessage(error.response.data, "Có lỗi xảy ra khi cập nhật trạng thái");
      if (error.response.status === 404) throw new Error("Không tìm thấy đơn hàng");
      if (error.response.status === 400) throw new Error(msg || "Trạng thái không hợp lệ");
      throw new Error(msg);
    }
    throw new Error("Không thể kết nối đến server");
  }
},
};
