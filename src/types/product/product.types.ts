// ─────────────────────────────────────────────────────────────
//  types/product/product.types.ts
// ─────────────────────────────────────────────────────────────
import type { PageResponse } from "../../api/BaseApi/baseApi";

// ─── Response ─────────────────────────────────────────────────
export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  path: string;
  img: string;
  hoverImg?: string;
  productTypeId: number;
}

export type ProductResponsePageResponse = PageResponse<ProductResponse>;

/** Dùng cho trang listing shop */
export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  img: string;
  categoryId: number;
  categoryName: string;
  description?: string;
}

/** Dùng cho trang detail sản phẩm */
export interface ColorDto {
  code: string;
  name: string;
}

export interface SizeDto {
  id: string;
  name: string;
}

export interface VariantDto {
  id: string;
  colorCode: string;
  sizeId: string;
  quantity: number;
  img: string;
}

export interface ProductDetailResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  img: string;
  hoverImg: string | null;
  rating: number | null;
  ratingCount: number | null;
  categoryId: number;
  categoryName: string;
  colors: ColorDto[];
  sizes: SizeDto[];
  variants: VariantDto[];
}

/** Dùng cho select/dropdown */
export interface ProductOption {
  productId: string;
  productName: string;
}

/** Dùng để filter trang listing */
export interface ProductFilter {
  categoryId?: number;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
  sortBy?: "name" | "price" | "createdAt";
  sortDir?: "asc" | "desc";
}

// ─── Request ──────────────────────────────────────────────────
export interface ProductCreateRequest extends Record<string, unknown> {
  name: string;
  description: string;
  price: number;
  path: string;
  img: string;
  hoverImg?: string;
  productTypeId: number;
}

export interface ProductUpdateRequest extends Record<string, unknown> {
  name: string;
  description: string;
  price: number;
  path: string;
  img: string;
  hoverImg?: string;
  productTypeId: number;
}