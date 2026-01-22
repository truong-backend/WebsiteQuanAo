// src/services/categoryService.ts
import axios from "axios";
import { colorApi } from "../api/CallApi/colorApi";
import type { ColorCreateRequest } from "../type/Color/ColorCreateRequest";
import type { ColorUpdateRequest } from "../type/Color/ColorUpdateRequest";
import type { ColorResponse } from "../type/Color/ColorResponse";
import type { ColorResponsePageResponse } from "../type/Color/ColorResponse";
import type { ErrorResponse } from "../type/common/ErrorResponse";

/**
 * Service layer for category operations
 * Handles business logic and error transformation
 */
export const ColorService = {
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
  getColorsPaged: async (
    page = 0,
    size = 10,
    search?: string,
    sortBy = "code",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<ColorResponsePageResponse> => {
    try {
      return await colorApi.getAll(page, size, search, sortBy, sortDir);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải danh sách");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  createColor: async (payload: ColorCreateRequest): Promise<ColorResponse> => {
    try {
      return await colorApi.create(payload);
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
  updateColor: async (
    Id: string,
    payload: ColorUpdateRequest
  ): Promise<ColorResponse> => {
    try {
      return await colorApi.update(Id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 404 Not Found
        if (error.response.status === 404) {
          throw new Error(errData.message || "Không tìm thấy");
        }

        // 409 Conflict - Duplicate name or circular relationship
        if (error.response.status === 409) {
          throw new Error(
            errData.message || "Tên danh mục đã tồn tại hoặc tạo vòng lặp"
          );
        }

        // 400 Bad Request - Invalid operation (e.g., self-parent)
        if (error.response.status === 400) {
          throw new Error(errData.message || "Thao tác không hợp lệ");
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
  getColorById: async (categoryId: string): Promise<ColorResponse> => {
    try {
      return await colorApi.getById(categoryId);
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
  deleteColor: async (categoryId: string): Promise<void> => {
    try {
      return await colorApi.delete(categoryId);
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
};
