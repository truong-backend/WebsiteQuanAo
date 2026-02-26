import axios from "axios";
import { productTypeApi } from "../api/CallApi/ProductTypeApi";
import type { ProductTypeCreateRequest } from "../type/ProductType/ProductTypeCreateRequest";
import type { ProductTypeUpdateRequest } from "../type/ProductType/ProductTypeUpdateRequest";
import type { ProductTypeResponse } from "../type/ProductType/ProductTypeResponse";
import type { PageResponse } from "../api/BaseApi/baseApi";

function getMessage(data: unknown, fallback: string): string {
  if (!data || typeof data !== "object") return fallback;
  const o = data as Record<string, unknown>;
  if (typeof o.message === "string" && o.message) return o.message;
  if (typeof o.error === "string" && o.error) return o.error;
  return fallback;
}

export const ProductTypeService = {
  async getProductTypes(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "productId",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<PageResponse<ProductTypeResponse>> {
    try {
      return await productTypeApi.getAll<PageResponse<ProductTypeResponse>>(
        page,
        size,
        search,
        sortBy,
        sortDir
      );
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể tải danh sách loại sản phẩm"));
      throw new Error("Không thể kết nối server");
    }
  },

  async getById(id: number): Promise<ProductTypeResponse> {
    try {
      return await productTypeApi.getById(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không tìm thấy loại sản phẩm"));
      throw new Error("Không thể kết nối server");
    }
  },

  async create(payload: ProductTypeCreateRequest): Promise<ProductTypeResponse> {
    try {
      return await productTypeApi.create(payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể tạo loại sản phẩm"));
      throw new Error("Không thể kết nối server");
    }
  },

  async update(id: number, payload: ProductTypeUpdateRequest): Promise<ProductTypeResponse> {
    try {
      return await productTypeApi.update(id, payload);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể cập nhật loại sản phẩm"));
      throw new Error("Không thể kết nối server");
    }
  },

  async delete(id: number): Promise<void> {
    try {
      return await productTypeApi.delete(id);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        throw new Error(getMessage(error.response.data, "Không thể xóa loại sản phẩm"));
      throw new Error("Không thể kết nối server");
    }
  },
};
