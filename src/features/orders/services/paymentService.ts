// src/features/orders/services/paymentService.ts
// Moved from: src/modules/payment/payment.module.ts (PaymentService)
import axios from 'axios';
import { BaseApi, type PageResponse } from '@/services/baseApi';
import type { PaymentResponse, PaymentCreateRequest, PaymentUpdateRequest } from '../types/payment.types';

class PaymentApi extends BaseApi<PaymentResponse, PaymentCreateRequest, PaymentUpdateRequest> {
  constructor() { super('payments'); }
}

const paymentApi = new PaymentApi();

function msg(data: unknown, fallback: string): string {
  if (!data || typeof data !== 'object') return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === 'string' && o.message) return o.message;
  if (typeof o.error   === 'string' && o.error)   return o.error;
  return fallback;
}

export const PaymentService = {
  async getPaymentsPaged(page = 0, size = 10, search?: string, sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc'): Promise<PageResponse<PaymentResponse>> {
    return PaymentService.getPayments(page, size, search, sortBy, sortDir);
  },

  async getPayments(page = 0, size = 10, search?: string, sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc'): Promise<PageResponse<PaymentResponse>> {
    try { return await paymentApi.getAll<PageResponse<PaymentResponse>>(page, size, search, sortBy, sortDir); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể tải danh sách thanh toán'));
      throw new Error('Không thể kết nối server');
    }
  },

  async getById(id: string): Promise<PaymentResponse> {
    try { return await paymentApi.getById(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không tìm thấy thanh toán'));
      throw new Error('Không thể kết nối server');
    }
  },

  async create(payload: PaymentCreateRequest): Promise<PaymentResponse> {
    try { return await paymentApi.create(payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể tạo thanh toán'));
      throw new Error('Không thể kết nối server');
    }
  },

  async update(id: string, payload: PaymentUpdateRequest): Promise<PaymentResponse> {
    try { return await paymentApi.update(id, payload); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể cập nhật thanh toán'));
      throw new Error('Không thể kết nối server');
    }
  },

  async delete(id: string): Promise<void> {
    try { return await paymentApi.delete(id); }
    catch (e) {
      if (axios.isAxiosError(e) && e.response) throw new Error(msg(e.response.data, 'Không thể xóa thanh toán'));
      throw new Error('Không thể kết nối server');
    }
  },
};