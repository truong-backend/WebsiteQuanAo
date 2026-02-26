import type { PageResponse } from "../../api/BaseApi/baseApi";
import { OrderStatus } from "./OrderStatus";

export interface OrderResponse extends Record<string, unknown> {
  id: string;
  orderTime: string; // ISO datetime string
  phoneNumber: string;
  address: string;
  note?: string;
  status: OrderStatus;
  accountId?: number;
  paymentId?: string;
}

export type OrderResponsePageResponse = PageResponse<OrderResponse>;