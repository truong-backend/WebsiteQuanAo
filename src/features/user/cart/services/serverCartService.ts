// src/features/cart/services/serverCartService.ts
// Moved from: src/modules/cart/cart.module.ts (ServerCartService)
import axios from 'axios';
import { BaseApi, type PageResponse } from '@/services/baseApi';
import type {
  CartResponse, CartCreateRequest, CartUpdateRequest, AddToCartRequest,
} from '../types/cart.types';

class CartApi extends BaseApi<CartResponse, CartCreateRequest, CartUpdateRequest> {
  constructor() { super('carts'); }
  getMyCart()                              { return this.axiosInstance.get<CartResponse>('/me'); }
  addToCart(payload: AddToCartRequest)     { return this.axiosInstance.post<CartResponse>('/me/items', payload); }
  updateCartItem(cartItemId: string, quantity: number) {
    return this.axiosInstance.put<CartResponse>(`/me/items/${cartItemId}`, null, { params: { quantity } });
  }
  removeCartItem(cartItemId: string)       { return this.axiosInstance.delete<CartResponse>(`/me/items/${cartItemId}`); }
  clearCart()                              { return this.axiosInstance.delete('/me'); }
}

const cartApi = new CartApi();

function msg(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message) return o.message;
  if (typeof o.error   === 'string' && o.error)   return o.error;
  return fallback;
}

export const ServerCartService = {
  async getCarts(page = 0, size = 10, search?: string, sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc'): Promise<PageResponse<CartResponse>> {
    try { return await cartApi.getAll<PageResponse<CartResponse>>(page, size, search, sortBy, sortDir); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể tải giỏ hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async getById(id: string): Promise<CartResponse> {
    try { return await cartApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không tìm thấy giỏ hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async getMyCart(): Promise<CartResponse> {
    try { return (await cartApi.getMyCart()).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể tải giỏ hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async addToCart(payload: AddToCartRequest): Promise<CartResponse> {
    try { return (await cartApi.addToCart(payload)).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể thêm vào giỏ'));
      throw new Error('Không thể kết nối server');
    }
  },

  async updateCartItem(cartItemId: string, quantity: number): Promise<CartResponse> {
    try { return (await cartApi.updateCartItem(cartItemId, quantity)).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể cập nhật số lượng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async removeCartItem(cartItemId: string): Promise<CartResponse> {
    try { return (await cartApi.removeCartItem(cartItemId)).data; }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể xóa khỏi giỏ'));
      throw new Error('Không thể kết nối server');
    }
  },

  async clearCart(): Promise<void> {
    try { await cartApi.clearCart(); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể xóa giỏ hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async create(payload: CartCreateRequest): Promise<CartResponse> {
    try { return await cartApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể tạo giỏ hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async delete(id: string): Promise<void> {
    try { return await cartApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể xóa giỏ hàng'));
      throw new Error('Không thể kết nối server');
    }
  },
};