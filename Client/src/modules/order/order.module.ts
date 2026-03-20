// ─────────────────────────────────────────────────────────────
//  modules/order/order.module.ts
//  Chịu trách nhiệm: tạo / cập nhật / xóa đơn hàng,
//                   đổi trạng thái, chi tiết từng dòng đơn hàng
// ─────────────────────────────────────────────────────────────
import axios from "axios";
import { BaseApi, type PageResponse } from "../../api/BaseApi/baseApi";
import type {
  OrderResponse,
  OrderResponsePageResponse,
  OrderCreateRequest,
  OrderUpdateRequest,
  OrderItemResponse,
  OrderItemCreateRequest,
  OrderItemUpdateRequest,
} from "@/types";
import { OrderStatus } from "@/types";
import type { CartItem } from "../cart/cart.module";

// ─────────────────────────────────────────────────────────────
//  ORDER API  (/orders)
// ─────────────────────────────────────────────────────────────
class OrderApi extends BaseApi<OrderResponse, OrderCreateRequest, OrderUpdateRequest> {
  constructor() { super("orders"); }

  async getOrders(
    page = 0, size = 10,
    search?: string,
    sortBy = "orderTime", sortDir: "asc" | "desc" = "desc",
    extra?: { status?: string; startDate?: string; endDate?: string; accountId?: number },
  ): Promise<PageResponse<OrderResponse>> {
    const params: Record<string, string | number | boolean> = {};
    if (extra?.status)              params.status    = extra.status;
    if (extra?.startDate)           params.startDate = extra.startDate;
    if (extra?.endDate)             params.endDate   = extra.endDate;
    if (extra?.accountId != null)   params.accountId = extra.accountId;
    return this.getAll<PageResponse<OrderResponse>>(
      page, size, search, sortBy, sortDir,
      Object.keys(params).length ? params : undefined,
    );
  }

  async updateStatus(id: string, status: string): Promise<OrderResponse> {
    const res = await this.axiosInstance.patch<OrderResponse>(`/${id}/status`, null, { params: { status } });
    return res.data;
  }

  async createUserOrder(payload: OrderCreateRequest): Promise<OrderResponse> {
    const res = await this.axiosInstance.post<OrderResponse>("", payload);
    return res.data;
  }

  getMyOrders() { return this.axiosInstance.get<OrderResponse[]>("/me"); }
}

const orderApi = new OrderApi();

// ─── helpers ─────────────────────────────────────────────────
function errMsg(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message   === "string" && o.message)   return o.message;
  if (typeof o.error     === "string" && o.error)     return o.error;
  if (typeof o.errorCode === "string" && o.errorCode) return o.errorCode;
  return fallback;
}

// ─── ORDER SERVICE ────────────────────────────────────────────
export const OrderService = {
  async getOrdersPaged(
    page = 0, size = 10,
    search?: string,
    sortBy = "orderTime", sortDir: "asc" | "desc" = "desc",
    status?: OrderStatus,
    startDate?: string, endDate?: string,
    accountId?: number,
  ): Promise<OrderResponsePageResponse> {
    try {
      return await orderApi.getOrders(page, size, search, sortBy, sortDir, { status, startDate, endDate, accountId });
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, "Không thể tải danh sách đơn hàng"));
      throw new Error("Không thể kết nối đến server");
    }
  },

  async createOrder(payload: OrderCreateRequest): Promise<OrderResponse> {
    try {
      return await orderApi.createUserOrder(payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = errMsg(e.response.data, "Có lỗi xảy ra khi tạo đơn hàng");
        if (e.response.status === 409) throw new Error(m || "Mã đơn hàng đã tồn tại");
        if (e.response.status === 404) throw new Error(m || "Không tìm thấy sản phẩm hoặc tài khoản");
        if (e.response.status === 400) throw new Error(m || "Dữ liệu không hợp lệ");
        throw new Error(m);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Tạo đơn hàng từ giỏ hàng localStorage.
   * CartItem.id = productVariantId
   */
  async createOrderFromCart(
    cartItems: CartItem[],
    form: { phoneNumber: string; address: string; note?: string; paymentType?: "COD" | "BANKING" },
  ): Promise<OrderResponse> {
    const payload: OrderCreateRequest = {
      phoneNumber: form.phoneNumber,
      address:     form.address,
      note:        form.note,
      paymentType: form.paymentType ?? "COD",
      items: cartItems.map((item) => ({ productVariantId: item.id, quantity: item.quantity })),
    };
    return OrderService.createOrder(payload);
  },

  async updateOrder(id: string, payload: OrderUpdateRequest): Promise<OrderResponse> {
    try {
      return await orderApi.update(id, payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = errMsg(e.response.data, "Có lỗi xảy ra khi cập nhật đơn hàng");
        if (e.response.status === 404) throw new Error("Không tìm thấy đơn hàng");
        if (e.response.status === 400) throw new Error(m || "Thao tác không hợp lệ");
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
        if (e.response.status === 404) throw new Error("Không tìm thấy đơn hàng");
        throw new Error(errMsg(e.response.data, "Có lỗi xảy ra khi lấy đơn hàng"));
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async deleteOrder(id: string): Promise<void> {
    try {
      return await orderApi.delete(id);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error("Đơn hàng không tồn tại hoặc đã bị xóa");
        throw new Error(errMsg(e.response.data, "Không thể xóa đơn hàng này"));
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async updateOrderStatus(id: string, status: OrderStatus): Promise<OrderResponse> {
    try {
      return await orderApi.updateStatus(id, status);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = errMsg(e.response.data, "Có lỗi xảy ra khi cập nhật trạng thái");
        if (e.response.status === 404) throw new Error("Không tìm thấy đơn hàng");
        if (e.response.status === 400) throw new Error(m || "Trạng thái không hợp lệ");
        throw new Error(m);
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};

// ─────────────────────────────────────────────────────────────
//  ORDER ITEM API  (/order-items)
// ─────────────────────────────────────────────────────────────
class OrderItemApi extends BaseApi<OrderItemResponse, OrderItemCreateRequest, OrderItemUpdateRequest> {
  constructor() { super("order-items"); }

  async getOrderItems(
    page = 0, size = 10,
    search?: string, orderId?: string, productVariantId?: string,
    sortBy = "id", sortDir: "asc" | "desc" = "asc",
  ): Promise<PageResponse<OrderItemResponse>> {
    const extra: Record<string, string | number> = {};
    if (orderId)           extra.orderId           = orderId;
    if (productVariantId)  extra.productVariantId  = productVariantId;
    return this.getAll<PageResponse<OrderItemResponse>>(page, size, search, sortBy, sortDir, extra);
  }
}

const orderItemApi = new OrderItemApi();

// ─── ORDER ITEM SERVICE ───────────────────────────────────────
export const OrderItemService = {
  async getOrderItems(
    page = 0, size = 10,
    search?: string, orderId?: string, productVariantId?: string,
    sortBy = "id", sortDir: "asc" | "desc" = "asc",
  ): Promise<PageResponse<OrderItemResponse>> {
    try {
      return await orderItemApi.getOrderItems(page, size, search, orderId, productVariantId, sortBy, sortDir);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, "Không thể tải chi tiết đơn hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: string): Promise<OrderItemResponse> {
    try { return await orderItemApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, "Không tìm thấy chi tiết đơn hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: OrderItemCreateRequest): Promise<OrderItemResponse> {
    try { return await orderItemApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, "Không thể thêm sản phẩm vào đơn hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async update(id: string, payload: OrderItemUpdateRequest): Promise<OrderItemResponse> {
    try { return await orderItemApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, "Không thể cập nhật chi tiết đơn hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: string): Promise<void> {
    try { return await orderItemApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, "Không thể xóa chi tiết đơn hàng"));
      throw new Error("Không thể kết nối server");
    }
  },
};