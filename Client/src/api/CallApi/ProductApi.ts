// src/api/CallApi/ProductApi.ts
import { BaseApi, type PageResponse } from "../BaseApi/baseApi";
import type { ProductResponse } from "../../type/product/ProductResponse.ts";
import type { ProductCreateRequest } from "../../type/product/ProductCreateRequest.ts";
import type { ProductUpdateRequest } from "../../type/product/ProductUpdateRequest.ts";
import type { ProductOption } from "../../type/product/ProductOption.ts";
import type { ProductListItem } from "../../type/product/ProductListItem.ts";
import type { ProductDetailResponse } from "../../type/product/ProductDetailResponse.ts";

class ProductApi extends BaseApi<
  ProductResponse,
  ProductCreateRequest,
  ProductUpdateRequest
> {
  constructor() {
    super("products");
  }

  // Search with optional filter by productTypeId
  searchProducts(
    page = 0,
    size = 10,
    search?: string,
    productTypeId?: number,
    sortBy = "name",
    sortDir: "asc" | "desc" = "asc",
  ) {
    const params: Record<string, string | number> = {
      page,
      size,
      sortBy,
      sortDir,
    };

    if (search) {
      params.search = search;
    }

    if (productTypeId !== undefined) {
      params.productTypeId = productTypeId;
    }

    return this.axiosInstance.get("", { params });
  }

  // src/api/ProductApi.ts

  async getAllProductOptions(): Promise<ProductOption[]> {
    return this.customGet<ProductOption[]>("/options");
  }

  async getProductsForListing(
    page: number = 0,
    size: number = 12,
    searchQuery?: string,
    categoryId?: number,
    minPrice?: number,
    maxPrice?: number,
    sortBy: string = 'createdAt',
    sortDir: 'asc' | 'desc' = 'desc'
  ): Promise<PageResponse<ProductListItem>> {
    const params: Record<string, string | number> = {
      page,
      size,
      sortBy,
      sortDir,
    };
    
    if (searchQuery) params.search = searchQuery;
    if (categoryId) params.categoryId = categoryId;
    if (minPrice !== undefined) params.minPrice = minPrice;
    if (maxPrice !== undefined) params.maxPrice = maxPrice;

    return this.customGet<PageResponse<ProductListItem>>('/listing', { params });
  }

    /** Lấy chi tiết sản phẩm theo ID */
  getDetailById(id: string) {
    return this.axiosInstance.get<ProductDetailResponse>(`/${id}`);
  }
 
  /** Lấy chi tiết sản phẩm theo path/slug */
  getDetailByPath(path: string) {
    return this.axiosInstance.get<ProductDetailResponse>(`/path/${path}`);
  }
}

export const productApi = new ProductApi();