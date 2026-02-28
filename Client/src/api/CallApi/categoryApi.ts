import { BaseApi } from "../BaseApi/baseApi";
import type { CategoryResponse } from "../../type/categotry/CategoryResponse";
import type { CategoryCreateAndUpdateRequest } from "../../type/categotry/CategoryCreateAndUpdateRequest";
import type { CategoryOption } from "../../type/categotry/CategoryOption";
import type { PageResponse } from "../../api/BaseApi/baseApi";

// ─── Type cho navbar ──────────────────────────────────────────────────────────
export interface NavbarCategory {
  categoryId: number;
  categoryName: string;
  children: NavbarCategory[];
}

class CategoryApi extends BaseApi<
  CategoryResponse,
  CategoryCreateAndUpdateRequest
> {
  constructor() {
    super("categories");
  }

  async getAllCategories(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "categoryId",
    sortDir: "asc" | "desc" = "asc",
    parentId?: number
  ): Promise<PageResponse<CategoryResponse>> {
    return this.getAll<PageResponse<CategoryResponse>>(
      page, size, search, sortBy, sortDir,
      parentId !== undefined ? { parentId } : undefined
    );
  }

  async getCategoryById(categoryId: number): Promise<CategoryResponse> {
    return this.getById(categoryId);
  }

  async createCategory(payload: CategoryCreateAndUpdateRequest): Promise<CategoryResponse> {
    return this.create(payload);
  }

  async updateCategory(id: number, payload: CategoryCreateAndUpdateRequest): Promise<CategoryResponse> {
    return this.update(id, payload);
  }

  async deleteCategory(id: number): Promise<void> {
    await this.delete(id);
  }

  async getAllCategoryOptions(): Promise<CategoryOption[]> {
    return this.customGet<CategoryOption[]>("/options");
  }

  async getRootCategoryOptions(): Promise<CategoryOption[]> {
    return this.customGet<CategoryOption[]>("/options/root");
  }

  /**
   * Fetch navbar categories — 1 lần duy nhất
   * GET /categories/navbar
   * Trả về root + children (1 level)
   */
  async getNavbarCategories(): Promise<NavbarCategory[]> {
    return this.customGet<NavbarCategory[]>("/navbar");
  }
}

export const categoryApi = new CategoryApi();