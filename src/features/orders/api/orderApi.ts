// src/features/orders/api/orderApi.ts
// Moved from: src/modules/order/order.module.ts (class OrderApi)
import { BaseApi, type PageResponse } from '@/services/baseApi';
import type {
  OrderResponse, OrderCreateRequest, OrderUpdateRequest,
} from '../types/order.types';

class OrderApi extends BaseApi<OrderResponse, OrderCreateRequest, OrderUpdateRequest> {
  constructor() { super('orders'); }

  async getOrders(
    page = 0, size = 10, search?: string,
    sortBy = 'orderTime', sortDir: 'asc' | 'desc' = 'desc',
    extra?: { status?: string; startDate?: string; endDate?: string; accountId?: number },
  ): Promise<PageResponse<OrderResponse>> {
    const params: Record<string, string | number | boolean> = {};
    if (extra?.status)            params.status    = extra.status;
    if (extra?.startDate)         params.startDate = extra.startDate;
    if (extra?.endDate)           params.endDate   = extra.endDate;
    if (extra?.accountId != null) params.accountId = extra.accountId;
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
    const res = await this.axiosInstance.post<OrderResponse>('', payload);
    return res.data;
  }

  getMyOrders() { return this.axiosInstance.get<OrderResponse[]>('/me'); }
}

export const orderApi = new OrderApi();
