// src/features/cart/types/cart.types.ts
// Moved from: src/types/cart/cart.types.ts

export interface CartItemDto {
  cartItemId: string; productVariantId: string; productId: string;
  productName: string; colorCode: string; colorName: string;
  sizeId: string; sizeName: string; img: string;
  price: number; quantity: number; subtotal: number;
}

export interface CartResponse {
  id: string;
  items: CartItemDto[];
  totalAmount: number;
}

export interface CartCreateRequest { id?: string; accountId: number; }
export interface CartUpdateRequest { accountId: number; }
export interface AddToCartRequest  { productVariantId: string; quantity: number; }

export interface CartItemResponse {
  id: string; quantity: number; cartId: string; productVariantId: string;
}

export interface CartItemCreateRequest {
  id?: string; quantity: number; cartId: string; productVariantId: string;
}

export interface CartItemUpdateRequest { quantity: number; }

export interface LocalCartItem {
  id: string;
  name: string;
  price: number;
  img: string;
  quantity: number;
  colorName?: string;
  sizeName?: string;
}