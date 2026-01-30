import { OrderStatus } from "./OrderStatus";

export interface OrderCreateRequest extends Record<string, unknown> {
  id?: string; // Optional - auto-generated if not provided
  orderTime: string; // ISO datetime string
  phoneNumber: string;
  address: string;
  note?: string;
  status: OrderStatus;
  accountId?: number;
  paymentId?: string;
}