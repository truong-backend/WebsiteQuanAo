// src/features/cart/services/cartItemService.ts
// Moved from: src/modules/cart/cart.module.ts (CartItemService)
import axios from 'axios';
import { BaseApi, type PageResponse } from '@/services/baseApi';
import type {
  CartItemResponse, CartItemCreateRequest, CartItemUpdateRequest,
} from '../types/cart.types';

class CartItemApi extends BaseApi<CartItemResponse, CartItemCreateRequest, CartItemUpdateRequest> {
  constructor() { super('cart-items'); }
  async getCartItems(page = 0, size = 10, cartId?: string, sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc'): Promise<PageResponse<CartItemResponse>> {
    const extra: Record<string, string> = {};
    if (cartId) extra.cartId = cartId;
    return this.getAll<PageResponse<CartItemResponse>>(page, size, undefined, sortBy, sortDir, extra);
  }
}

const cartItemApi = new CartItemApi();

function msg(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message) return o.message;
  if (typeof o.error   === 'string' && o.error)   return o.error;
  return fallback;
}

export const CartItemService = {
  async getCartItems(page = 0, size = 10, cartId?: string, sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc'): Promise<PageResponse<CartItemResponse>> {
    try { return await cartItemApi.getCartItems(page, size, cartId, sortBy, sortDir); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể tải sản phẩm trong giỏ'));
      throw new Error('Không thể kết nối server');
    }
  },
  async getById(id: string): Promise<CartItemResponse> {
    try { return await cartItemApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không tìm thấy mục giỏ hàng'));
      throw new Error('Không thể kết nối server');
    }
  },
  async create(payload: CartItemCreateRequest): Promise<CartItemResponse> {
    try { return await cartItemApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể thêm vào giỏ'));
      throw new Error('Không thể kết nối server');
    }
  },
  async update(id: string, payload: CartItemUpdateRequest): Promise<CartItemResponse> {
    try { return await cartItemApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể cập nhật số lượng'));
      throw new Error('Không thể kết nối server');
    }
  },
  async delete(id: string): Promise<void> {
    try { return await cartItemApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể xóa khỏi giỏ'));
      throw new Error('Không thể kết nối server');
    }
  },
};
