// src/type/cart/CartResponse.ts

export interface CartItemDto {
  cartItemId: string;
  productVariantId: string;
  productId: string;
  productName: string;
  colorCode: string;
  colorName: string;
  sizeId: string;
  sizeName: string;
  img: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface CartResponse {
  id: string;
  items: CartItemDto[];
  totalAmount: number;
}

// src/type/cart/AddToCartRequest.ts
export interface AddToCartRequest {
  productVariantId: string;
  quantity: number;
}