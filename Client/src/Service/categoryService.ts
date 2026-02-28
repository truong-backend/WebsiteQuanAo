// src/services/categoryService.ts
import axios from "axios";
import { categoryApi } from "../api/CallApi/categoryApi";
import type { NavbarCategory } from "../api/CallApi/categoryApi";
import type { CategoryCreateAndUpdateRequest } from "../type/categotry/CategoryCreateAndUpdateRequest";
import type { CategoryOption } from "../type/categotry/CategoryOption";
import type { ErrorResponse } from "../type/common/error/ErrorResponse";
import type { CategoryResponse, CategoryResponsePageResponse } from "../type/categotry/CategoryResponse";
import type { SelectOption } from "../type/common/select/SelectOption";

export type { NavbarCategory };

export const categoryService = {
  getCategoriesPaged: async (
    page = 0,
    size = 10,
    search?: string,
    sortBy = "categoryId",
    sortDir: "asc" | "desc" = "asc",
    parentId?: number,
  ): Promise<CategoryResponsePageResponse> => {
    try {
      return await categoryApi.getAllCategories(page, size, search, sortBy, sortDir, parentId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải danh sách danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  createCategory: async (payload: CategoryCreateAndUpdateRequest): Promise<CategoryResponse> => {
    try {
      return await categoryApi.createCategory(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        if (error.response.status === 409) throw new Error(errData.message || "Danh mục đã tồn tại");
        if (error.response.status === 404) throw new Error(errData.message || "Danh mục cha không tồn tại");
        throw new Error(errData.message || "Có lỗi xảy ra khi tạo danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  updateCategory: async (categoryId: number, payload: CategoryCreateAndUpdateRequest): Promise<CategoryResponse> => {
    try {
      return await categoryApi.updateCategory(categoryId, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        if (error.response.status === 404) throw new Error(errData.message || "Không tìm thấy danh mục");
        if (error.response.status === 409) throw new Error(errData.message || "Tên danh mục đã tồn tại hoặc tạo vòng lặp");
        if (error.response.status === 400) throw new Error(errData.message || "Thao tác không hợp lệ");
        throw new Error(errData.message || "Có lỗi xảy ra khi cập nhật");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  getCategoryById: async (categoryId: number): Promise<CategoryResponse> => {
    try {
      return await categoryApi.getCategoryById(categoryId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        if (error.response.status === 404) throw new Error("Không tìm thấy danh mục");
        throw new Error(errData.message || "Có lỗi xảy ra khi lấy danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  deleteCategory: async (categoryId: number): Promise<void> => {
    try {
      return await categoryApi.deleteCategory(categoryId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        if (error.response.status === 404) throw new Error("Danh mục không tồn tại hoặc đã bị xóa");
        if (error.response.status === 409) throw new Error("Không thể xóa danh mục có danh mục con.");
        throw new Error(errData.message || "Có lỗi xảy ra khi xóa");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  getCategorySelectOptions: async (): Promise<SelectOption[]> => {
    try {
      const data: CategoryOption[] = await categoryApi.getAllCategoryOptions();
      return data.map((item) => ({ value: item.categoryId, label: item.categoryName }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể lấy danh sách danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  getRootCategoryOptions: async (): Promise<CategoryOption[]> => {
    try {
      return await categoryApi.getRootCategoryOptions();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể lấy danh sách danh mục gốc");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Fetch navbar categories — gọi 1 lần duy nhất khi app load
   * Trả về root categories + children (1 level)
   */
  getNavbarCategories: async (): Promise<NavbarCategory[]> => {
    try {
      return await categoryApi.getNavbarCategories();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải menu danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};