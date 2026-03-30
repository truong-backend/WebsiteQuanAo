// src/features/admin/types/productVariant.types.ts
// Moved from: src/types/productVariant/productVariant.types.ts
import type { PageResponse } from '@/services/baseApi';

export interface ProductVariantResponse {
  id: string; quantity: number; img: string;
  productId: string; productName: string;
  colorCode: string; colorName: string; sizeId: string;
}
export type ProductVariantResponsePageResponse = PageResponse<ProductVariantResponse>;
export interface ProductVariantCreateRequest extends Record<string, unknown> {
  quantity: number; img: string; productId: string; colorCode: string; sizeId: string;
}
export interface ProductVariantUpdateRequest extends Record<string, unknown> {
  quantity: number; img: string; productId: string; colorCode: string; sizeId: string;
}