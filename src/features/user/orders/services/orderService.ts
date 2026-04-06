// src/features/orders/services/orderService.ts
// Moved from: src/modules/order/order.module.ts (OrderService)
import axios from "axios";
import { orderApi } from "../api/orderApi";
import type {
  OrderResponse,
  OrderResponsePageResponse,
  OrderCreateRequest,
  OrderUpdateRequest,
} from "../types/order.types";
import { OrderStatus } from "../types/order.types";
import type { CartItem } from "@/features/user/cart/services/localCartService";

function errMsg(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  if (typeof o.error === "string" && o.error) return o.error;
  if (typeof o.errorCode === "string" && o.errorCode) return o.errorCode;
  return fallback;
}

export const OrderService = {
  async getOrdersPaged(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "orderTime",
    sortDir: "asc" | "desc" = "desc",
    status?: OrderStatus,
    startDate?: string,
    endDate?: string,
    accountId?: number,
  ): Promise<OrderResponsePageResponse> {
    try {
      return await orderApi.getOrders(page, size, search, sortBy, sortDir, {
        status,
        startDate,
        endDate,
        accountId,
      });
    } catch (e) {
      if (axios.isAxiosError(e) && e.response)
        throw new Error(
          errMsg(e.response.data, "Không thể tải danh sách đơn hàng"),
        );
      throw new Error("Không thể kết nối đến server");
    }
  },

  async createOrder(payload: OrderCreateRequest): Promise<OrderResponse> {
    try {
      return await orderApi.createUserOrder(payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = errMsg(e.response.data, "Có lỗi xảy ra khi tạo đơn hàng");
        if (e.response.status === 409)
          throw new Error(m || "Mã đơn hàng đã tồn tại");
        if (e.response.status === 404)
          throw new Error(m || "Không tìm thấy sản phẩm hoặc tài khoản");
        if (e.response.status === 400)
          throw new Error(m || "Dữ liệu không hợp lệ");
        throw new Error(m);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async createOrderFromCart(
    cartItems: CartItem[],
    form: {
      phoneNumber: string;
      address: string;
      note?: string;
      paymentType?: "COD" | "BANKING";
    },
  ): Promise<OrderResponse> {
    const payload: OrderCreateRequest = {
      phoneNumber: form.phoneNumber,
      address: form.address,
      note: form.note,
      paymentType: form.paymentType ?? "COD",
      items: cartItems.map((item) => ({
        productVariantId: item.id,
        quantity: item.quantity,
      })),
    };
    return OrderService.createOrder(payload);
  },

  async updateOrder(
    id: string,
    payload: OrderUpdateRequest,
  ): Promise<OrderResponse> {
    try {
      return await orderApi.update(id, payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = errMsg(
          e.response.data,
          "Có lỗi xảy ra khi cập nhật đơn hàng",
        );
        if (e.response.status === 404)
          throw new Error("Không tìm thấy đơn hàng");
        if (e.response.status === 400)
          throw new Error(m || "Thao tác không hợp lệ");
        throw new Error(m);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async getOrderById(id: string): Promise<OrderResponse> {
    try {
      return await orderApi.getById(id);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404)
          throw new Error("Không tìm thấy đơn hàng");
        throw new Error(
          errMsg(e.response.data, "Có lỗi xảy ra khi lấy đơn hàng"),
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async deleteOrder(id: string): Promise<void> {
    try {
      return await orderApi.delete(id);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404)
          throw new Error("Đơn hàng không tồn tại hoặc đã bị xóa");
        throw new Error(errMsg(e.response.data, "Không thể xóa đơn hàng này"));
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async updateOrderStatus(
    id: string,
    status: OrderStatus,
  ): Promise<OrderResponse> {
    try {
      return await orderApi.updateStatus(id, status);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = errMsg(
          e.response.data,
          "Có lỗi xảy ra khi cập nhật trạng thái",
        );
        if (e.response.status === 404)
          throw new Error("Không tìm thấy đơn hàng");
        if (e.response.status === 400)
          throw new Error(m || "Trạng thái không hợp lệ");
        throw new Error(m);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};
