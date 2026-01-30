import axios from "axios";
import { productVariantApi } from "../api/CallApi/productVariantApi";
import type { ProductVariantCreateRequest } from "../type/ProductVariant/ProductVariantCreateRequest";
import type { ProductVariantUpdateRequest } from "../type/ProductVariant/ProductVariantUpdateRequest";
import type { ProductVariantResponse } from "../type/ProductVariant/ProductVariantResponse";
import type { ProductVariantResponsePageResponse } from "../type/ProductVariant/ProductVariantResponse";
import type { ErrorResponse } from "../type/common/ErrorResponse";

/**
 * Service layer for product variant operations
 * Handles business logic and error transformation
 */
export const ProductVariantService = {
  /**
   * Get paginated list of product variants with search and filtering
   * @param page - Page number (0-indexed)
   * @param size - Items per page
   * @param search - Search term for variant search
   * @param sortBy - Field to sort by
   * @param sortDir - Sort direction
   * @returns Paginated product variant response
   */
  getProductVariantsPaged: async (
    page = 0,
    size = 10,
    search?: string,
    sortBy = "id",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<ProductVariantResponsePageResponse> => {
    try {
      return await productVariantApi.getAll(page, size, search, sortBy, sortDir);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải danh sách biến thể");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Create a new product variant
   * @param payload - Product variant creation data
   * @returns Created product variant
   */
  createProductVariant: async (
    payload: ProductVariantCreateRequest
  ): Promise<ProductVariantResponse> => {
    try {
      return await productVariantApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 409 Conflict - Duplicate variant (same product + color + size)
        if (error.response.status === 409) {
          throw new Error(
            errData.message || "Biến thể sản phẩm đã tồn tại (trùng sản phẩm + màu + size)"
          );
        }

        // 404 Not Found - Product, Color, or Size not found
        if (error.response.status === 404) {
          throw new Error(
            errData.message || "Sản phẩm, màu sắc hoặc kích cỡ không tồn tại"
          );
        }

        throw new Error(
          errData.message || "Có lỗi xảy ra khi tạo biến thể sản phẩm"
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Update an existing product variant
   * @param id - Product variant ID to update
   * @param payload - Updated product variant data
   * @returns Updated product variant
   */
  updateProductVariant: async (
    id: string,
    payload: ProductVariantUpdateRequest
  ): Promise<ProductVariantResponse> => {
    try {
      return await productVariantApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 404 Not Found
        if (error.response.status === 404) {
          throw new Error(
            errData.message || "Không tìm thấy biến thể sản phẩm"
          );
        }

        // 409 Conflict - Duplicate variant combination
        if (error.response.status === 409) {
          throw new Error(
            errData.message ||
              "Biến thể sản phẩm đã tồn tại (trùng sản phẩm + màu + size)"
          );
        }

        // 400 Bad Request - Invalid operation
        if (error.response.status === 400) {
          throw new Error(errData.message || "Thao tác không hợp lệ");
        }

        throw new Error(
          errData.message || "Có lỗi xảy ra khi cập nhật biến thể"
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Get product variant by ID
   * @param id - Product variant ID
   * @returns Product variant data
   */
  getProductVariantById: async (id: string): Promise<ProductVariantResponse> => {
    try {
      return await productVariantApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        if (error.response.status === 404) {
          throw new Error("Không tìm thấy biến thể sản phẩm");
        }

        throw new Error(
          errData.message || "Có lỗi xảy ra khi lấy biến thể sản phẩm"
        );
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  /**
   * Delete a product variant
   * @param id - Product variant ID to delete
   * @returns True if deletion successful
   */
  deleteProductVariant: async (id: string): Promise<void> => {
    try {
      return await productVariantApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;

        // 404 Not Found
        if (error.response.status === 404) {
          throw new Error("Biến thể sản phẩm không tồn tại hoặc đã bị xóa");
        }

        // 400 Bad Request - Cannot delete (in cart or orders)
        if (error.response.status === 400) {
          throw new Error(
            errData.message ||
              "Không thể xóa biến thể đang có trong giỏ hàng hoặc đơn hàng"
          );
        }

        throw new Error(errData.message || "Có lỗi xảy ra khi xóa biến thể");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};