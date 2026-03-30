// src/features/categories/api/categoryApi.ts
// Moved from: src/modules/category/category.module.ts (class CategoryApi)
import { BaseApi, type PageResponse } from '@/services/baseApi';
import type {
  CategoryResponse, CategoryCreateAndUpdateRequest,
  CategoryOption, NavbarCategory,
} from '../types/category.types';

class CategoryApi extends BaseApi<CategoryResponse, CategoryCreateAndUpdateRequest> {
  constructor() { super('categories'); }

  async getAllCategories(page = 0, size = 10, search?: string, sortBy = 'categoryId', sortDir: 'asc' | 'desc' = 'asc', parentId?: number): Promise<PageResponse<CategoryResponse>> {
    return this.getAll<PageResponse<CategoryResponse>>(
      page, size, search, sortBy, sortDir,
      parentId !== undefined ? { parentId } : undefined,
    );
  }

  getCategoryById(id: number)                                    { return this.getById(id); }
  createCategory(p: CategoryCreateAndUpdateRequest)              { return this.create(p); }
  updateCategory(id: number, p: CategoryCreateAndUpdateRequest)  { return this.update(id, p); }
  deleteCategory(id: number)                                     { return this.delete(id); }
  getAllCategoryOptions(): Promise<CategoryOption[]>              { return this.customGet<CategoryOption[]>('/options'); }
  getRootCategoryOptions(): Promise<CategoryOption[]>            { return this.customGet<CategoryOption[]>('/options/root'); }
  getNavbarCategories(): Promise<NavbarCategory[]>               { return this.customGet<NavbarCategory[]>('/navbar'); }
}

export const categoryApi = new CategoryApi();
