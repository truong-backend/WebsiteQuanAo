/**
 * Khớp server: OrderItemCreateRequest (orderId, productVariantId, quantity, price).
 */
export interface OrderItemCreateRequest {
  id?: string;
  quantity: number;
  price: number;
  orderId: string;
  productVariantId: string;
}
