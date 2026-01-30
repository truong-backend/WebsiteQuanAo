import axios from "axios";
import { orderApi } from "../api/CallApi/OrderApi";
import type { OrderCreateRequest } from "../type/Orders/OrderCreateRequest";
import type { OrderUpdateRequest } from "../type/Orders/OrderUpdateRequest";
import type { OrderResponse } from "../type/Orders/OrderResponse";
import type { OrderResponsePageResponse } from "../type/Orders/OrderResponse";
import type { OrderStatus } from "../type/Orders/OrderStatus";
import type { ErrorResponse } from "../type/common/ErrorResponse";

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
      return await orderApi.getOrdersFiltered(
        page,
        size,
        search,
        sortBy,
        sortDir,
        status,
        startDate,
        endDate,
        accountId
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải danh sách đơn hàng");
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
        const errData = error.response.data as ErrorResponse;

        // 409 Conflict - Duplicate order ID
        if (error.response.status === 409) {
          throw new Error(errData.message || "Mã đơn hàng đã tồn tại");
        }

        // 404 Not Found - Account or Payment not found
        if (error.response.status === 404) {
          throw new Error(
            errData.message || "Tài khoản hoặc phương thức thanh toán không tồn tại"
          );
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi tạo đơn hàng");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Update an existing order
   * @param id - Order ID to update
   * @param payload - Updated order data
   * @returns Updated order
   */
  updateOrder: async (
    id: string,
    payload: OrderUpdateRequest
  ): Promise<OrderResponse> => {
    try {
      return await orderApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 404 Not Found
        if (error.response.status === 404) {
          throw new Error(errData.message || "Không tìm thấy đơn hàng");
        }

        // 400 Bad Request - Invalid operation
        if (error.response.status === 400) {
          throw new Error(errData.message || "Thao tác không hợp lệ");
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi cập nhật đơn hàng");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Get order by ID
   * @param id - Order ID
   * @returns Order data
   */
  getOrderById: async (id: string): Promise<OrderResponse> => {
    try {
      return await orderApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        if (error.response.status === 404) {
          throw new Error("Không tìm thấy đơn hàng");
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi lấy đơn hàng");
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
        const errData = error.response.data as ErrorResponse;

        // 404 Not Found
        if (error.response.status === 404) {
          throw new Error("Đơn hàng không tồn tại hoặc đã bị xóa");
        }

        // 400 Bad Request - Cannot delete (has order items)
        if (error.response.status === 400) {
          throw new Error(
            errData.message ||
              "Không thể xóa đơn hàng đang có sản phẩm. Vui lòng xóa các sản phẩm trong đơn hàng trước."
          );
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi xóa đơn hàng");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};