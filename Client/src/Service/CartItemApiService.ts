/**
 * CartItem API phía server (/cart-items). Khác với CartService (localStorage).
 */
import axios from "axios";
import { cartItemApi } from "../api/CallApi/CartItemApi";
import type { CartItemCreateRequest } from "../type/CartItem/CartItemCreateRequest";
import type { CartItemUpdateRequest } from "../type/CartItem/CartItemUpdateRequest";
import type { CartItemResponse } from "../type/CartItem/CartItemResponse";
import type { PageResponse } from "../api/BaseApi/baseApi";

function getMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  if (typeof o.error === "string" && o.error) return o.error;
  return fallback;
}

export const CartItemApiService = {
  async getCartItems(
    page = 0,
    size = 10,
    cartId?: string,
    sortBy = "id",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<PageResponse<CartItemResponse>> {
    try {
      return await cartItemApi.getCartItems(page, size, cartId, sortBy, sortDir);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể tải sản phẩm trong giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: string): Promise<CartItemResponse> {
    try {
      return await cartItemApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không tìm thấy mục giỏ hàng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: CartItemCreateRequest): Promise<CartItemResponse> {
    try {
      return await cartItemApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể thêm vào giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },

  async update(id: string, payload: CartItemUpdateRequest): Promise<CartItemResponse> {
    try {
      return await cartItemApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể cập nhật số lượng"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: string): Promise<void> {
    try {
      return await cartItemApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể xóa khỏi giỏ"));
      throw new Error("Không thể kết nối server");
    }
  },
};
