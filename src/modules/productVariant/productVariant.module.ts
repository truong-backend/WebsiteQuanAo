// ─────────────────────────────────────────────────────────────
//  modules/productVariant/productVariant.module.ts
//  Chịu trách nhiệm: CRUD biến thể sản phẩm (màu + size + tồn kho)
// ─────────────────────────────────────────────────────────────
import axios from "axios";
import { BaseApi } from "../../api/BaseApi/baseApi";
import type {
  ProductVariantResponse,
  ProductVariantResponsePageResponse,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest,
  ErrorResponse,
} from "@/types";

// ─── API ─────────────────────────────────────────────────────
class ProductVariantApi extends BaseApi<
  ProductVariantResponse,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest
> {
  constructor() { super("product-variants"); }
}

const productVariantApi = new ProductVariantApi();

// ─── helpers ─────────────────────────────────────────────────
function errMsg(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as ErrorResponse).message || fallback;
  }
  return "Không thể kết nối đến server";
}

// ─── Service ─────────────────────────────────────────────────
export const ProductVariantService = {
  async getProductVariantsPaged(
    page = 0, size = 10,
    search?: string,
    sortBy = "id", sortDir: "asc" | "desc" = "asc",
  ): Promise<ProductVariantResponsePageResponse> {
    try {
      return await productVariantApi.getAll(page, size, search, sortBy, sortDir);
    } catch (e) { throw new Error(errMsg(e, "Không thể tải danh sách biến thể")); }
  },

  async createProductVariant(payload: ProductVariantCreateRequest): Promise<ProductVariantResponse> {
    try {
      return await productVariantApi.create(payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 409) throw new Error(m || "Biến thể sản phẩm đã tồn tại (trùng sản phẩm + màu + size)");
        if (e.response.status === 404) throw new Error(m || "Sản phẩm, màu sắc hoặc kích cỡ không tồn tại");
        throw new Error(m || "Có lỗi xảy ra khi tạo biến thể sản phẩm");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async updateProductVariant(id: string, payload: ProductVariantUpdateRequest): Promise<ProductVariantResponse> {
    try {
      return await productVariantApi.update(id, payload);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 404) throw new Error(m || "Không tìm thấy biến thể sản phẩm");
        if (e.response.status === 409) throw new Error(m || "Biến thể sản phẩm đã tồn tại (trùng sản phẩm + màu + size)");
        if (e.response.status === 400) throw new Error(m || "Thao tác không hợp lệ");
        throw new Error(m || "Có lỗi xảy ra khi cập nhật biến thể");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async getProductVariantById(id: string): Promise<ProductVariantResponse> {
    try {
      return await productVariantApi.getById(id);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        if (e.response.status === 404) throw new Error("Không tìm thấy biến thể sản phẩm");
        throw new Error((e.response.data as ErrorResponse).message || "Có lỗi xảy ra khi lấy biến thể sản phẩm");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },

  async deleteProductVariant(id: string): Promise<void> {
    try {
      return await productVariantApi.delete(id);
    } catch (e) {
      if (axios.isAxiosError(e) && e.response) {
        const m = (e.response.data as ErrorResponse).message;
        if (e.response.status === 404) throw new Error("Biến thể sản phẩm không tồn tại hoặc đã bị xóa");
        if (e.response.status === 400) throw new Error(m || "Không thể xóa biến thể đang có trong giỏ hàng hoặc đơn hàng");
        throw new Error(m || "Có lỗi xảy ra khi xóa biến thể");
      }
      throw new Error("Không thể kết nối đến server");
    }
  },
};