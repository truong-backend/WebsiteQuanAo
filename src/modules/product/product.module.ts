// ─────────────────────────────────────────────────────────────
//  modules/product/product.module.ts
//  Chịu trách nhiệm: CRUD sản phẩm, listing trang shop, detail
// ─────────────────────────────────────────────────────────────
import axios from "axios";
import { BaseApi, type PageResponse } from "../../api/BaseApi/baseApi";
import type {
  ProductResponse,
  ProductResponsePageResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductOption,
  ProductListItem,
  ProductDetailResponse,
  SelectOption,
  ErrorResponse,
} from "@/types";

// ─── API ─────────────────────────────────────────────────────
class ProductApi extends BaseApi<ProductResponse, ProductCreateRequest, ProductUpdateRequest> {
  constructor() { super("products"); }

  /** GET /products?page&size&search&productTypeId&sortBy&sortDir */
  searchProducts(
    page = 0, size = 10,
    search?: string, productTypeId?: number,
    sortBy = "name", sortDir: "asc" | "desc" = "asc",
  ) {
    const params: Record<string, string | number> = { page, size, sortBy, sortDir };
    if (search)                       params.search        = search;
    if (productTypeId !== undefined)  params.productTypeId = productTypeId;
    return this.axiosInstance.get("", { params });
  }

  /** GET /products/options */
  getAllProductOptions(): Promise<ProductOption[]> {
    return this.customGet<ProductOption[]>("/options");
  }

  /** GET /products/listing — dành cho trang shop */
  getProductsForListing(
    page = 0, size = 12,
    searchQuery?: string, categoryId?: number,
    minPrice?: number, maxPrice?: number,
    sortBy = "createdAt", sortDir: "asc" | "desc" = "desc",
  ): Promise<PageResponse<ProductListItem>> {
    const params: Record<string, string | number> = { page, size, sortBy, sortDir };
    if (searchQuery)              params.search     = searchQuery;
    if (categoryId)               params.categoryId = categoryId;
    if (minPrice !== undefined)   params.minPrice   = minPrice;
    if (maxPrice !== undefined)   params.maxPrice   = maxPrice;
    return this.customGet<PageResponse<ProductListItem>>("/listing", { params });
  }

  /** GET /products/:id  (detail) */
  getDetailById(id: string) {
    return this.axiosInstance.get<ProductDetailResponse>(`/${id}`);
  }

  /** GET /products/path/:slug */
  getDetailByPath(path: string) {
    return this.axiosInstance.get<ProductDetailResponse>(`/path/${path}`);
  }
}

const productApi = new ProductApi();

// ─── helpers ─────────────────────────────────────────────────
function errMsg(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as ErrorResponse).message || fallback;
  }
  return "Không thể kết nối server";
}

// ─── Service ─────────────────────────────────────────────────
export const ProductService = {
  async getProductsPaged(
    page = 0, size = 10,
    search?: string, productTypeId?: number,
    sortBy = "name", sortDir: "asc" | "desc" = "asc",
  ): Promise<ProductResponsePageResponse> {
    try {
      const res = await productApi.searchProducts(page, size, search, productTypeId, sortBy, sortDir);
      return res.data;
    } catch (e) { throw new Error(errMsg(e, "Không thể tải danh sách sản phẩm")); }
  },

  async createProduct(payload: ProductCreateRequest) {
    try {
      return await productApi.create(payload);
    } catch (e) { throw new Error(errMsg(e, "Tạo sản phẩm thất bại")); }
  },

  async updateProduct(id: string, payload: ProductUpdateRequest) {
    try {
      return await productApi.update(id, payload);
    } catch (e) { throw new Error(errMsg(e, "Cập nhật sản phẩm thất bại")); }
  },

  async deleteProduct(id: string) {
    try {
      return await productApi.delete(id);
    } catch (e) { throw new Error(errMsg(e, "Xóa sản phẩm thất bại")); }
  },

  async getById(id: string) {
    try {
      return await productApi.getById(id);
    } catch (e) { throw new Error(errMsg(e, "Không thể tải thông tin sản phẩm")); }
  },

  async getProductSelectOptions(): Promise<SelectOption[]> {
    try {
      const data = await productApi.getAllProductOptions();
      return data.map((item) => ({ value: item.productId, label: item.productName }));
    } catch (e) { throw new Error(errMsg(e, "Không thể lấy danh sách sản phẩm")); }
  },

  async getProductsForListing(
    page = 0, size = 12,
    searchQuery?: string, categoryId?: number,
    minPrice?: number, maxPrice?: number,
    sortBy = "createdAt", sortDir: "asc" | "desc" = "desc",
  ): Promise<PageResponse<ProductListItem>> {
    try {
      return await productApi.getProductsForListing(page, size, searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir);
    } catch (e) { throw new Error(errMsg(e, "Không thể tải danh sách sản phẩm")); }
  },

  async getDetailById(id: string): Promise<ProductDetailResponse> {
    try {
      const res = await productApi.getDetailById(id);
      return res.data;
    } catch (e) { throw new Error(errMsg(e, "Không thể tải sản phẩm")); }
  },

  async getDetailByPath(path: string): Promise<ProductDetailResponse> {
    try {
      const res = await productApi.getDetailByPath(path);
      return res.data;
    } catch (e) { throw new Error(errMsg(e, "Không thể tải sản phẩm")); }
  },
};