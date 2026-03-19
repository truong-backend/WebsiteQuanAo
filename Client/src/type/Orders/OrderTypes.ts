// src/type/order/OrderTypes.ts

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

export interface OrderResponse {
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

export interface OrderItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface CreateOrderRequest {
  phoneNumber: string;
  address: string;
  note?: string;
  paymentType: "COD" | "BANKING";
  items: OrderItemRequest[];
}