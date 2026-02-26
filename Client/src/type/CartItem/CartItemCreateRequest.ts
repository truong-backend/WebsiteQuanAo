export interface CartItemCreateRequest {
  id?: string;
  quantity: number;
  cartId: string;
  productVariantId: string;
}
