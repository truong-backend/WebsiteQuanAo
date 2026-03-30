// src/features/categories/types/category.types.ts
// Moved from: src/types/category/category.types.ts
import type { PageResponse } from '@/services/baseApi';

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

export interface NavbarCategory {
  categoryId: number;
  categoryName: string;
  children: NavbarCategory[];
}
