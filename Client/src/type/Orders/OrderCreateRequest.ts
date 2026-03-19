// src/type/Orders/OrderCreateRequest.ts

export interface OrderItemRequest {
  productVariantId: string;
  quantity: number;
}

export interface OrderCreateRequest {
  phoneNumber: string;
  address: string;
  note?: string;
  /** COD | BANKING */
  paymentType: "COD" | "BANKING";
  items: OrderItemRequest[];
}