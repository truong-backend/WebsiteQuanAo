/**
 * Giỏ hàng phía server (API /carts). Khác với CartService (localStorage).
 */
import axios from "axios";
import { cartApi } from "../api/CallApi/CartApi";
import type { CartCreateRequest } from "../type/Cart/CartCreateRequest";
import type { CartUpdateRequest } from "../type/Cart/CartUpdateRequest";
import type { CartResponse } from "../type/Cart/CartResponse";
import type { PageResponse } from "../api/BaseApi/baseApi";

function getMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  if (typeof o.error === "string" && o.error) return o.error;
  return fallback;
}

export const ServerCartService = {
  async getCarts(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "id",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<PageResponse<CartResponse>> {
    try {
      return await cartApi.getAll<PageResponse<CartResponse>>(
        page,
        size,
        search,
        sortBy,
        sortDir
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể tải giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: string): Promise<CartResponse> {
    try {
      return await cartApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không tìm thấy giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: CartCreateRequest): Promise<CartResponse> {
    try {
      return await cartApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể tạo giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async update(id: string, payload: CartUpdateRequest): Promise<CartResponse> {
    try {
      return await cartApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể cập nhật giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      return await cartApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể xóa giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },
};
