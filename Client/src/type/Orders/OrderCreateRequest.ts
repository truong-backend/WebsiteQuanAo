import type { OrderStatus } from "./OrderStatus";

/** Dòng đơn từ giỏ (client). Server hiện không nhận orderItems trong POST /orders. */
export interface ClientOrderItem {
  productId: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
}

export interface OrderCreateRequest extends Record<string, unknown> {
  id?: string;
  orderTime: string; // ISO
  phoneNumber: string;
  address: string;
  note?: string;
  status: OrderStatus;
  accountId?: number;
  paymentId?: string;
  /** Gửi kèm từ giỏ (server hiện bỏ qua; dùng OrderItemApi sau khi tạo đơn nếu cần). */
  orderItems?: ClientOrderItem[];
}