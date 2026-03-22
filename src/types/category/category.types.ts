// ─────────────────────────────────────────────────────────────
//  types/category/category.types.ts
// ─────────────────────────────────────────────────────────────
import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
}

export type CategoryResponsePageResponse = PageResponse<CategoryResponse>;

export interface CategoryCreateAndUpdateRequest extends Record<string, unknown> {
  categoryName: string;
  parentCategoryId: number | null;
}

export interface CategoryOption {
  categoryId: number;
  categoryName: string;
}

/** Dùng cho navbar menu (root + children 1 level) */
export interface NavbarCategory {
  categoryId: number;
  categoryName: string;
  children: NavbarCategory[];
}