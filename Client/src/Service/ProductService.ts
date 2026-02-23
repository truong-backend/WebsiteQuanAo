// src/Service/ProductService.ts
import axios from "axios";
import { productApi } from "../api/CallApi/ProductApi";
import type { ErrorResponse } from "../type/common/error/ErrorResponse";
import type { ProductCreateRequest } from "../type/product/ProductCreateRequest";
import type { ProductUpdateRequest } from "../type/product/ProductUpdateRequest";
import type { ProductResponsePageResponse } from "../type/product/ProductResponse";
import type { ProductOption } from "../type/product/ProductOption";
import type { ProductListItem } from "../type/product/ProductListItem";
import type { PageResponse } from "../api/BaseApi/baseApi";
import type { SelectOption } from "../type/common/error/select/SelectOption";

export const ProductService = {
  getProductsPaged: async (
    page = 0,
    size = 10,
    search?: string,
    productTypeId?: number,
    sortBy = "name",
    sortDir: "asc" | "desc" = "asc",
  ): Promise<ProductResponsePageResponse> => {
    try {
      const res = await productApi.searchProducts(
        page,
        size,
        search,
        productTypeId,
        sortBy,
        sortDir,
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Không thể tải danh sách sản phẩm",
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },

  createProduct: async (payload: ProductCreateRequest) => {
    try {
      return await productApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Tạo sản phẩm thất bại",
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },

  updateProduct: async (id: string, payload: ProductUpdateRequest) => {
    try {
      return await productApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Cập nhật sản phẩm thất bại",
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },

  deleteProduct: async (id: string) => {
    try {
      return await productApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Xóa sản phẩm thất bại",
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },

  getById: async (id: string) => {
    try {
      return await productApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Không thể tải thông tin sản phẩm",
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },
  getProductSelectOptions: async (): Promise<SelectOption[]> => {
    try {
      const data: ProductOption[] = await productApi.getAllProductOptions();

      return data.map((item) => ({
        value: item.productId,
        label: item.productName,
      }));
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể lấy danh sách sản phẩm");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async getProductsForListing(
    page: number = 0,
    size: number = 12,
    searchQuery?: string,
    categoryId?: number,
    minPrice?: number,
    maxPrice?: number,
    sortBy: string = "createdAt",
    sortDir: "asc" | "desc" = "desc",
  ): Promise<PageResponse<ProductListItem>> {
    try {
      return await productApi.getProductsForListing(
        page,
        size,
        searchQuery,
        categoryId,
        minPrice,
        maxPrice,
        sortBy,
        sortDir,
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const errData = error.response.data as ErrorResponse;
        throw new Error(errData.message || "Không thể tải danh sách sản phẩm");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};
