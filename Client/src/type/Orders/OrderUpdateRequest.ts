import { OrderStatus } from "./OrderStatus";

export interface OrderUpdateRequest extends Record<string, unknown> {
  orderTime: string; // ISO datetime string
  phoneNumber: string;
  address: string;
  note?: string;
  status: OrderStatus;
  accountId?: number;
  paymentId?: string;
}