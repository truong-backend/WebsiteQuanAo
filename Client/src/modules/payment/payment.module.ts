// ─────────────────────────────────────────────────────────────
//  modules/payment/payment.module.ts
//  Chịu trách nhiệm: CRUD payment records + tạo link thanh toán
//                   VNPAY / MoMo qua backend
// ─────────────────────────────────────────────────────────────
import axios from "axios";
import { BaseApi, type PageResponse } from "../../api/BaseApi/baseApi";
import type {
  PaymentResponse,
  PaymentCreateRequest,
  PaymentUpdateRequest,
} from "@/types";

// ─── API ─────────────────────────────────────────────────────
class PaymentApi extends BaseApi<PaymentResponse, PaymentCreateRequest, PaymentUpdateRequest> {
  constructor() { super("payments"); }
}

const paymentApi = new PaymentApi();

// ─── helpers ─────────────────────────────────────────────────
function msg(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  if (typeof o.error   === "string" && o.error)   return o.error;
  return fallback;
}

// ─── PAYMENT SERVICE ──────────────────────────────────────────
export const PaymentService = {
  /** Alias dùng cho admin form */
  async getPaymentsPaged(
    page = 0, size = 10,
    search?: string,
    sortBy = "id", sortDir: "asc" | "desc" = "asc",
  ): Promise<PageResponse<PaymentResponse>> {
    return PaymentService.getPayments(page, size, search, sortBy, sortDir);
  },

  async getPayments(
    page = 0, size = 10,
    search?: string,
    sortBy = "id", sortDir: "asc" | "desc" = "asc",
  ): Promise<PageResponse<PaymentResponse>> {
    try {
      return await paymentApi.getAll<PageResponse<PaymentResponse>>(page, size, search, sortBy, sortDir);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể tải danh sách thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: string): Promise<PaymentResponse> {
    try { return await paymentApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không tìm thấy thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: PaymentCreateRequest): Promise<PaymentResponse> {
    try { return await paymentApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể tạo thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async update(id: string, payload: PaymentUpdateRequest): Promise<PaymentResponse> {
    try { return await paymentApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể cập nhật thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: string): Promise<void> {
    try { return await paymentApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, "Không thể xóa thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },
};

// ─── PAYMENT GATEWAY SERVICE ──────────────────────────────────
const API_BASE = "http://localhost:8080";

export const PaymentGatewayService = {
  /** Tạo URL thanh toán VNPAY */
  async createVnpayPayment(orderId: string, amount: number): Promise<string> {
    const res = await axios.post<{ payUrl: string }>(
      `${API_BASE}/payments/vnpay/create`,
      { orderId, amount },
    );
    return res.data.payUrl;
  },

  /** Tạo URL thanh toán MoMo */
  async createMomoPayment(orderId: string, amount: number): Promise<string> {
    const res = await axios.post<{ payUrl: string }>(
      `${API_BASE}/payments/momo/create`,
      { orderId, amount },
    );
    return res.data.payUrl;
  },
};