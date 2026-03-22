// ─────────────────────────────────────────────────────────────
//  modules/category/category.module.ts
//  Chịu trách nhiệm: CRUD danh mục, navbar menu, select options
// ─────────────────────────────────────────────────────────────
import axios from "axios";
import { BaseApi } from "../../api/BaseApi/baseApi";
import type { PageResponse } from "../../api/BaseApi/baseApi";
import type {
  CategoryResponse,
  CategoryResponsePageResponse,
  CategoryCreateAndUpdateRequest,
  CategoryOption,
  NavbarCategory,
  SelectOption,
  ErrorResponse,
} from "@/types";

// Re-export để modules/index.ts có thể export tiếp ra ngoài
export type { NavbarCategory };

// ─── API ─────────────────────────────────────────────────────
class CategoryApi extends BaseApi<CategoryResponse, CategoryCreateAndUpdateRequest> {
  constructor() { super("categories"); }

  async getAllCategories(
    page = 0, size = 10,
    search?: string,
    sortBy = "categoryId", sortDir: "asc" | "desc" = "asc",
    parentId?: number,
  ): Promise<PageResponse<CategoryResponse>> {
    return this.getAll<PageResponse<CategoryResponse>>(
      page, size, search, sortBy, sortDir,
      parentId !== undefined ? { parentId } : undefined,
    );
  }

  getCategoryById(id: number)                                    { return this.getById(id); }
  createCategory(p: CategoryCreateAndUpdateRequest)              { return this.create(p); }
  updateCategory(id: number, p: CategoryCreateAndUpdateRequest)  { return this.update(id, p); }
  deleteCategory(id: number)                                     { return this.delete(id); }

  getAllCategoryOptions(): Promise<CategoryOption[]>   { return this.customGet<CategoryOption[]>("/options"); }
  getRootCategoryOptions(): Promise<CategoryOption[]>  { return this.customGet<CategoryOption[]>("/options/root"); }
  getNavbarCategories(): Promise<NavbarCategory[]>     { return this.customGet<NavbarCategory[]>("/navbar"); }
}

const categoryApi = new CategoryApi();

// ─── helpers ─────────────────────────────────────────────────
function msg(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as ErrorResponse).message || fallback;
  }
  return "Không thể kết nối đến server";
}

// ─── Service ─────────────────────────────────────────────────
export const CategoryService = {
  async getCategoriesPaged(
    page = 0, size = 10,
    search?: string,
    sortBy = "categoryId", sortDir: "asc" | "desc" = "asc",
    parentId?: number,
  ): Promise<CategoryResponsePageResponse> {
    try {
      return await categoryApi.getAllCategories(page, size, search, sortBy, sortDir, parentId);
    } catch (e) { throw new Error(msg(e, "Không thể tải danh sách danh mục")); }
  },

  async createCategory(payload: CategoryCreateAndUpdateRequest): Promise<CategoryResponse> {
    try {
      return await categoryApi.createCategory(payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 409) throw new Error(m || "Danh mục đã tồn tại");
        if (e.response.status === 404) throw new Error(m || "Danh mục cha không tồn tại");
        throw new Error(m || "Có lỗi xảy ra khi tạo danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async updateCategory(id: number, payload: CategoryCreateAndUpdateRequest): Promise<CategoryResponse> {
    try {
      return await categoryApi.updateCategory(id, payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 404) throw new Error(m || "Không tìm thấy danh mục");
        if (e.response.status === 409) throw new Error(m || "Tên danh mục đã tồn tại hoặc tạo vòng lặp");
        if (e.response.status === 400) throw new Error(m || "Thao tác không hợp lệ");
        throw new Error(m || "Có lỗi xảy ra khi cập nhật");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async getCategoryById(id: number): Promise<CategoryResponse> {
    try {
      return await categoryApi.getCategoryById(id);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error("Không tìm thấy danh mục");
        throw new Error((e.response.data as ErrorResponse).message || "Có lỗi xảy ra khi lấy danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async deleteCategory(id: number): Promise<void> {
    try {
      return await categoryApi.deleteCategory(id);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error("Danh mục không tồn tại hoặc đã bị xóa");
        if (e.response.status === 409) throw new Error("Không thể xóa danh mục có danh mục con.");
        throw new Error((e.response.data as ErrorResponse).message || "Có lỗi xảy ra khi xóa");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async getCategorySelectOptions(): Promise<SelectOption[]> {
    try {
      const data = await categoryApi.getAllCategoryOptions();
      return data.map((item) => ({ value: item.categoryId, label: item.categoryName }));
    } catch (e) { throw new Error(msg(e, "Không thể lấy danh sách danh mục")); }
  },

  async getRootCategoryOptions(): Promise<CategoryOption[]> {
    try {
      return await categoryApi.getRootCategoryOptions();
    } catch (e) { throw new Error(msg(e, "Không thể lấy danh sách danh mục gốc")); }
  },

  async getNavbarCategories(): Promise<NavbarCategory[]> {
    try {
      return await categoryApi.getNavbarCategories();
    } catch (e) { throw new Error(msg(e, "Không thể tải menu danh mục")); }
  },
};