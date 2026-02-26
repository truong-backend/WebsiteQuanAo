import axios from "axios";
import { paymentApi } from "../api/CallApi/PaymentApi";
import type { PaymentCreateRequest } from "../type/Payment/PaymentCreateRequest";
import type { PaymentUpdateRequest } from "../type/Payment/PaymentUpdateRequest";
import type { PaymentResponse } from "../type/Payment/PaymentResponse";
import type { PageResponse } from "../api/BaseApi/baseApi";

function getMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  if (typeof o.error === "string" && o.error) return o.error;
  return fallback;
}

export const PaymentService = {
  /** Alias để Admin form gọi getPaymentsPaged(0, 100) */
  async getPaymentsPaged(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "id",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<PageResponse<PaymentResponse>> {
    return this.getPayments(page, size, search, sortBy, sortDir);
  },

  async getPayments(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "id",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<PageResponse<PaymentResponse>> {
    try {
      return await paymentApi.getAll<PageResponse<PaymentResponse>>(
        page,
        size,
        search,
        sortBy,
        sortDir
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể tải danh sách thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: string): Promise<PaymentResponse> {
    try {
      return await paymentApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không tìm thấy phương thức thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: PaymentCreateRequest): Promise<PaymentResponse> {
    try {
      return await paymentApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể tạo thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async update(id: string, payload: PaymentUpdateRequest): Promise<PaymentResponse> {
    try {
      return await paymentApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể cập nhật thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      return await paymentApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể xóa thanh toán"));
      throw new Error("Không thể kết nối server");
    }
  },
};
