// src/features/orders/api/orderItemApi.ts
import { BaseApi, type PageResponse } from '@/services/baseApi';
import type {
  OrderItemResponse, OrderItemCreateRequest, OrderItemUpdateRequest,
} from '../types/order.types';

class OrderItemApi extends BaseApi<OrderItemResponse, OrderItemCreateRequest, OrderItemUpdateRequest> {
  constructor() { super('order-items'); }

  async getOrderItems(
    page = 0, size = 10, search?: string,
    orderId?: string, productVariantId?: string,
    sortBy = 'id', sortDir: 'asc' | 'desc' = 'asc',
  ): Promise<PageResponse<OrderItemResponse>> {
    const extra: Record<string, string | number> = {};
    if (orderId)          extra.orderId          = orderId;
    if (productVariantId) extra.productVariantId = productVariantId;
    return this.getAll<PageResponse<OrderItemResponse>>(page, size, search, sortBy, sortDir, extra);
  }
}

export const orderItemApi = new OrderItemApi();
