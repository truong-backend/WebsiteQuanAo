// src/Service/ProductService.ts
import axios from "axios";
import { productApi } from "../api/CallApi/ProductApi";
import type { ErrorResponse } from "../type/common/ErrorResponse";
import type { ProductCreateRequest } from "../type/product/ProductCreateRequest";
import type { ProductUpdateRequest } from "../type/product/ProductUpdateRequest";
import type { ProductResponsePageResponse } from "../type/product/ProductResponse";

export const ProductService = {
  getProductsPaged: async (
    page = 0,
    size = 10,
    search?: string,
    productTypeId?: number,
    sortBy = "name",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<ProductResponsePageResponse> => {
    try {
      const res = await productApi.searchProducts(
        page,
        size,
        search,
        productTypeId,
        sortBy,
        sortDir
      );
      return res.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(
          (error.response.data as ErrorResponse).message ||
            "Không thể tải danh sách sản phẩm"
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
            "Tạo sản phẩm thất bại"
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
            "Cập nhật sản phẩm thất bại"
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
            "Xóa sản phẩm thất bại"
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
            "Không thể tải thông tin sản phẩm"
        );
      }
      throw new Error("Không thể kết nối server");
    }
  },
};