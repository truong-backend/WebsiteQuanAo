// src/features/orders/services/orderItemService.ts
import axios from 'axios';
import { orderItemApi } from '../api/orderItemApi';
import type { PageResponse } from '@/services/baseApi';
import type {
  OrderItemResponse, OrderItemCreateRequest, OrderItemUpdateRequest,
} from '../types/order.types';

function errMsg(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message) return o.message;
  if (typeof o.error   === 'string' && o.error)   return o.error;
  return fallback;
}

export const OrderItemService = {
  async getOrderItems(
    page = 0, size = 10, search?: string, orderId?: string, productVariantId?: string,
    sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc',
  ): Promise<PageResponse<OrderItemResponse>> {
    try { return await orderItemApi.getOrderItems(page, size, search, orderId, productVariantId, sortBy, sortDir); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, 'Không thể tải chi tiết đơn hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async getById(id: string): Promise<OrderItemResponse> {
    try { return await orderItemApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, 'Không tìm thấy chi tiết đơn hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async create(payload: OrderItemCreateRequest): Promise<OrderItemResponse> {
    try { return await orderItemApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, 'Không thể thêm sản phẩm vào đơn hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async update(id: string, payload: OrderItemUpdateRequest): Promise<OrderItemResponse> {
    try { return await orderItemApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, 'Không thể cập nhật chi tiết đơn hàng'));
      throw new Error('Không thể kết nối server');
    }
  },

  async delete(id: string): Promise<void> {
    try { return await orderItemApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(errMsg(e.response.data, 'Không thể xóa chi tiết đơn hàng'));
      throw new Error('Không thể kết nối server');
    }
  },
};
