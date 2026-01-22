// src/services/categoryService.ts
import axios from "axios";
import { categoryApi } from "../api/CallApi/categoryApi";
import type { CategoryRequest } from "../type/categotry/CategoryRequest";
import type { CategoryOption } from "../type/categotry/CategoryOption"
import type { CategoryHeader } from "../type/categotry/CategoryHeader"
import type { ErrorResponse } from "../type/common/ErrorResponse";
import type { CategoryResponsePageResponse } from "../type/categotry/CategoryResponse";

/**
 * Service layer for category operations
 * Handles business logic and error transformation
 */
export const categoryService = {
  /**
   * Get paginated list of categories with search and filtering
   * @param page - Page number (0-indexed)
   * @param size - Items per page
   * @param search - Search term for category name
   * @param sortBy - Field to sort by
   * @param sortDir - Sort direction
   * @param parentId - Filter by parent category ID
   * @returns Paginated category response
   */
  getCategoriesPaged: async (
    page = 0,
    size = 10,
    search?: string,
    sortBy = "categoryId",
    sortDir: "asc" | "desc" = "asc",
    parentId?: number
  ): Promise<CategoryResponsePageResponse> => {
    try {
      return await categoryApi.getAllCategories(
        page,
        size,
        search,
        sortBy,
        sortDir,
        parentId
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải danh sách danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Get category tree (root categories with nested children)
   * @returns Array of root categories
   */
  getCategoryTree: async (): Promise<CategoryHeader[]> => {
    try {
      return await categoryApi.getCategoryTree();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Có lỗi xảy ra khi lấy cây danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Create a new category
   * @param payload - Category creation data
   * @returns Created category with children structure
   */
  createCategory: async (payload: CategoryRequest): Promise<CategoryRequest> => {
    try {
      return await categoryApi.createCategory(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 409 Conflict - Duplicate category name
        if (error.response.status === 409) {
          throw new Error(errData.message || "Danh mục đã tồn tại");
        }

        // 404 Not Found - Parent category not found
        if (error.response.status === 404) {
          throw new Error(errData.message || "Danh mục cha không tồn tại");
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi tạo danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Update an existing category
   * @param categoryId - Category ID to update
   * @param payload - Updated category data
   * @returns Updated category with children structure
   */
  updateCategory: async (
    categoryId: number,
    payload: CategoryRequest
  ): Promise<CategoryHeader> => {
    try {
      return await categoryApi.updateCategory(categoryId, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 404 Not Found
        if (error.response.status === 404) {
          throw new Error(errData.message || "Không tìm thấy danh mục");
        }

        // 409 Conflict - Duplicate name or circular relationship
        if (error.response.status === 409) {
          throw new Error(
            errData.message || "Tên danh mục đã tồn tại hoặc tạo vòng lặp"
          );
        }

        // 400 Bad Request - Invalid operation (e.g., self-parent)
        if (error.response.status === 400) {
          throw new Error(
            errData.message || "Thao tác không hợp lệ"
          );
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi cập nhật");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Get category by ID
   * @param categoryId - Category ID
   * @returns Category request DTO (for editing forms)
   */
  getCategoryById: async (categoryId: number): Promise<CategoryRequest> => {
    try {
      return await categoryApi.getCategoryById(categoryId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        if (error.response.status === 404) {
          throw new Error("Không tìm thấy danh mục");
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi lấy danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Delete a category
   * @param categoryId - Category ID to delete
   * @returns True if deletion successful
   */
  deleteCategory: async (categoryId: number): Promise<void> => {
    try {
      return await categoryApi.deleteCategory(categoryId);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 404 Not Found
        if (error.response.status === 404) {
          throw new Error("Danh mục không tồn tại hoặc đã bị xóa");
        }

        // 409 Conflict - Has children
        if (error.response.status === 409) {
          throw new Error(
            "Không thể xóa danh mục có danh mục con. Vui lòng xóa hoặc gán lại danh mục con trước."
          );
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi xóa");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Get all categories as simple options (id and name only)
   * Used for dropdowns and select inputs
   * @returns Array of category options
   */
  getAllCategoryOptions: async (): Promise<CategoryOption[]> => {
    try {
      return await categoryApi.getAllCategoryOptions();
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể lấy danh sách danh mục");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Get root categories as simple options (id and name only)
   * Used for parent category selection
   * @returns Array of root category options
   */
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
};