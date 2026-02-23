// src/services/categoryService.ts
import axios from "axios";
import { sizeApi } from "../api/CallApi/sizeApi";
import type { SizeCreateRequest } from "../type/size/SizeCreateRequest";
import type { SizeUpdateRequest } from "../type/size/SizeUpdateRequest";
import type { SizesResponse } from "../type/size/SizesResponse";
import type { SizeResponsePageResponse } from "../type/size/SizesResponse";
import type { ErrorResponse } from "../type/common/error/ErrorResponse";
import type { SizeOption } from "../type/size/SizeOption";
import type { SelectOption } from "../type/common/error/select/SelectOption";

/**
 * Service layer for category operations
 * Handles business logic and error transformation
 */
export const SizeService = {
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
  getSizesPaged: async (
    page = 0,
    size = 10,
    search?: string,
    sortBy = "categoryId",
    sortDir: "asc" | "desc" = "asc",
  ): Promise<SizeResponsePageResponse> => {
    try {
      return await sizeApi.getAll(page, size, search, sortBy, sortDir);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải danh sách");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  createSize: async (payload: SizeCreateRequest): Promise<SizesResponse> => {
    try {
      return await sizeApi.create(payload);
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
  updateSize: async (
    Id: string,
    payload: SizeUpdateRequest,
  ): Promise<SizesResponse> => {
    try {
      return await sizeApi.update(Id, payload);
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
            errData.message || "Tên danh mục đã tồn tại hoặc tạo vòng lặp",
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
  getSizeById: async (categoryId: string): Promise<SizesResponse> => {
    try {
      return await sizeApi.getById(categoryId);
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
  deleteSize: async (categoryId: string): Promise<void> => {
    try {
      return await sizeApi.delete(categoryId);
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
            "Không thể xóa danh mục có danh mục con. Vui lòng xóa hoặc gán lại danh mục con trước.",
          );
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi xóa");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
  getSizeSelectOptions: async (): Promise<SelectOption[]> => {
    try {
      const data: SizeOption[] = await sizeApi.getAllSizeOptions();

      return data.map((item) => ({
        value: item.sizeId,
        label: item.sizeName,
      }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(
          errData.message || "Không thể lấy danh sách kích thước",
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};
