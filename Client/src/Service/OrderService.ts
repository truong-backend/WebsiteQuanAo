import axios from "axios";
import { orderApi } from "../api/CallApi/OrderApi";
import type { OrderCreateRequest } from "../type/Orders/OrderCreateRequest";
import type { OrderUpdateRequest } from "../type/Orders/OrderUpdateRequest";
import type {
  OrderResponse,
  OrderResponsePageResponse,
} from "../type/Orders/OrderResponse";
import { OrderStatus } from "../type/Orders/OrderStatus";
import type { CartItem } from "./CartService";
// import type { CreateOrderRequest } from "../type/Orders/OrderTypes";

/** Lấy message lỗi từ response (hỗ trợ nhiều format backend) */
function getErrorMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const obj = data as Record<string, unknown>;
  if (typeof obj.message === "string" && obj.message) return obj.message;
  if (typeof obj.error === "string" && obj.error) return obj.error;
  if (typeof obj.errorCode === "string" && obj.errorCode) return obj.errorCode;
  return fallback;
}

export const OrderService = {
  /** GET /orders — paginated, filter nâng cao */
  getOrdersPaged: async (
    page = 0,
    size = 10,
    search?: string,
    sortBy = "orderTime",
    sortDir: "asc" | "desc" = "desc",
    status?: OrderStatus,
    startDate?: string,
    endDate?: string,
    accountId?: number,
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
        throw new Error(
          getErrorMessage(
            error.response.data,
            "Không thể tải danh sách đơn hàng",
          ),
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
  createOrder: async (payload: OrderCreateRequest): Promise<OrderResponse> => {
    try {
      // ✅ Gọi đúng method, trả về .data
      return await orderApi.createUserOrder(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const data = error.response.data;
        const msg = getErrorMessage(data, "Có lỗi xảy ra khi tạo đơn hàng");
        if (error.response.status === 409)
          throw new Error(msg || "Mã đơn hàng đã tồn tại");
        if (error.response.status === 404)
          throw new Error(msg || "Không tìm thấy sản phẩm hoặc tài khoản");
        if (error.response.status === 400)
          throw new Error(msg || "Dữ liệu không hợp lệ");
        throw new Error(msg);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
  /**
   * Tạo đơn hàng từ giỏ hàng (localStorage).
   *
   * Backend nhận: { phoneNumber, address, note, paymentType, items: [{ productVariantId, quantity }] }
   * CartItem.id = productVariantId (đã đổi ở CartService.addItemFromVariant)
   */
  createOrderFromCart: async (
    cartItems: CartItem[],
    form: {
      phoneNumber: string;
      address: string;
      note?: string;
      paymentType?: "COD" | "BANKING";
    },
  ): Promise<OrderResponse> => {
    const payload: OrderCreateRequest = {
      phoneNumber: form.phoneNumber,
      address: form.address,
      note: form.note,
      paymentType: form.paymentType ?? "COD",
      // CartItem.id = productVariantId
      items: cartItems.map((item) => ({
        productVariantId: item.id,
        quantity: item.quantity,
      })),
    };
    return OrderService.createOrder(payload);
  },

  /** PUT /orders/{id} */
  updateOrder: async (
    id: string,
    payload: OrderUpdateRequest,
  ): Promise<OrderResponse> => {
    try {
      return await orderApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = getErrorMessage(
          error.response.data,
          "Có lỗi xảy ra khi cập nhật đơn hàng",
        );
        if (error.response.status === 404)
          throw new Error("Không tìm thấy đơn hàng");
        if (error.response.status === 400)
          throw new Error(msg || "Thao tác không hợp lệ");
        throw new Error(msg);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /** GET /orders/{id} */
  getOrderById: async (id: string): Promise<OrderResponse> => {
    try {
      return await orderApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404)
          throw new Error("Không tìm thấy đơn hàng");
        throw new Error(
          getErrorMessage(
            error.response.data,
            "Có lỗi xảy ra khi lấy đơn hàng",
          ),
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /** DELETE /orders/{id} */
  deleteOrder: async (id: string): Promise<void> => {
    try {
      return await orderApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 404)
          throw new Error("Đơn hàng không tồn tại hoặc đã bị xóa");
        throw new Error(
          getErrorMessage(error.response.data, "Không thể xóa đơn hàng này"),
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /** PATCH /orders/{id}/status */
  updateOrderStatus: async (
    id: string,
    status: OrderStatus,
  ): Promise<OrderResponse> => {
    try {
      return await orderApi.updateStatus(id, status);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const msg = getErrorMessage(
          error.response.data,
          "Có lỗi xảy ra khi cập nhật trạng thái",
        );
        if (error.response.status === 404)
          throw new Error("Không tìm thấy đơn hàng");
        if (error.response.status === 400)
          throw new Error(msg || "Trạng thái không hợp lệ");
        throw new Error(msg);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};
