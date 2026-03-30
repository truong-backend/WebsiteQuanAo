// src/features/products/types/product.types.ts
// Moved from: src/types/product/product.types.ts
import type { PageResponse } from '@/services/baseApi';

export interface ProductResponse {
  id: string; name: string; description: string;
  price: number; path: string; img: string;
  hoverImg?: string; productTypeId: number;
}

export type ProductResponsePageResponse = PageResponse<ProductResponse>;

export interface ProductListItem {
  id: string; name: string; price: number; img: string;
  categoryId: number; categoryName: string; description?: string;
}

export interface ColorDto  { code: string; name: string; }
export interface SizeDto   { id: string; name: string; }
export interface VariantDto { id: string; colorCode: string; sizeId: string; quantity: number; img: string; }

export interface ProductDetailResponse {
  id: string; name: string; description: string;
  price: number; salePrice: number | null;
  img: string; hoverImg: string | null;
  rating: number | null; ratingCount: number | null;
  categoryId: number; categoryName: string;
  colors: ColorDto[]; sizes: SizeDto[]; variants: VariantDto[];
}

export interface ProductOption { productId: string; productName: string; }

export interface ProductFilter {
  categoryId?: number; minPrice?: number; maxPrice?: number;
  searchQuery?: string; sortBy?: 'name' | 'price' | 'createdAt';
  sortDir?: 'asc' | 'desc';
}

export interface ProductCreateRequest extends Record<string, unknown> {
  name: string; description: string; price: number;
  path: string; img: string; hoverImg?: string; productTypeId: number;
}

export interface ProductUpdateRequest extends Record<string, unknown> {
  name: string; description: string; price: number;
  path: string; img: string; hoverImg?: string; productTypeId: number;
}
