export interface OrderItemUpdateRequest {
  quantity: number;
  price: number;
  orderId: string;
  productVariantId: string;
}
