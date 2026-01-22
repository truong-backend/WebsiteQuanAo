
import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface CategoryResponse {
  categoryId: number;
  categoryName: string;
  parentCategoryId: number | null;
  parentCategoryName: string | null;
}

export type CategoryResponsePageResponse = PageResponse<CategoryResponse>;