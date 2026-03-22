// ─────────────────────────────────────────────────────────────
//  types/order/order.types.ts
//  Gom: OrderStatus + Order + OrderItem
// ─────────────────────────────────────────────────────────────
import type { PageResponse } from "../../api/BaseApi/baseApi";

// ─── Order Status ─────────────────────────────────────────────
export const OrderStatus = {
  PENDING:   "PENDING",
  CONFIRMED: "CONFIRMED",
  SHIPPING:  "SHIPPING",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof OrderStatus)[keyof typeof OrderStatus];

export const OrderStatusLabels: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:   "Chờ xác nhận",
  [OrderStatus.CONFIRMED]: "Đã xác nhận",
  [OrderStatus.SHIPPING]:  "Đang giao hàng",
  [OrderStatus.COMPLETED]: "Hoàn thành",
  [OrderStatus.CANCELLED]: "Đã hủy",
};

export const OrderStatusColors: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:   "bg-yellow-100 text-yellow-800",
  [OrderStatus.CONFIRMED]: "bg-blue-100 text-blue-800",
  [OrderStatus.SHIPPING]:  "bg-purple-100 text-purple-800",
  [OrderStatus.COMPLETED]: "bg-green-100 text-green-800",
  [OrderStatus.CANCELLED]: "bg-red-100 text-red-800",
};

// ─── Order Response ───────────────────────────────────────────
/** Response cơ bản (list / admin) */
export interface OrderResponse extends Record<string, unknown> {
  id: string;
  orderTime: string;
  phoneNumber: string;
  address: string;
  note?: string;
  status: OrderStatus;
  accountId?: number;
  paymentId?: string;
}

export type OrderResponsePageResponse = PageResponse<OrderResponse>;

export interface OrderBasicResponse {
  id: string;
  orderTime: string;           // ISO datetime string
  phoneNumber: string;
  address: string;
  note?: string;
  status: OrderStatus;
  accountId?: number;
  paymentId?: string;
  orderItems: OrderItemResponse[];
}

/** Response đầy đủ (detail page — bao gồm items) */
export interface OrderItemDto {
  orderItemId: string;
  productVariantId: string;
  productId: string;
  productName: string;
  colorCode: string;
  colorName: string;
  sizeId: string;
  sizeName: string;
  img: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface OrderDetailResponse {
  id: string;
  orderTime: string;
  phoneNumber: string;
  address: string;
  note: string | null;
  status: string;
  totalAmount: number;
  paymentId: string;
  paymentType: string;
  accountId: number;
  accountName: string;
  items: OrderItemDto[];
}

// ─── Order Request ────────────────────────────────────────────
export interface CreateOrderRequest {
  phoneNumber: string;
  address: string;
  note?: string;
  paymentType: "COD" | "BANKING" | "MOMO" | "VNPAY";
  items: {
    productVariantId: string;
    quantity: number;
  }[];
}

export interface OrderItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface OrderCreateRequest {
  phoneNumber: string;
  address: string;
  note?: string;
  paymentType: "COD" | "BANKING";
  items: OrderItemRequest[];
}

export interface OrderUpdateRequest extends Record<string, unknown> {
  orderTime: string;
  phoneNumber: string;
  address: string;
  note?: string;
  status: OrderStatus;
  accountId?: number;
  paymentId?: string;
}

// ─── OrderItem ────────────────────────────────────────────────
export interface OrderItemResponse {
  id: string;
  quantity: number;
  price: number;
  orderId: string;
  productVariantId: string;
}

export interface OrderItemCreateRequest {
  id?: string;
  quantity: number;
  price: number;
  orderId: string;
  productVariantId: string;
}

export interface OrderItemUpdateRequest {
  quantity: number;
  price: number;
  orderId: string;
  productVariantId: string;
}

