// src/features/products/api/productApi.ts
// Moved from: src/modules/product/product.module.ts (class ProductApi)
import { BaseApi, type PageResponse } from '@/services/baseApi';
import type {
  ProductResponse, ProductCreateRequest, ProductUpdateRequest,
  ProductOption, ProductListItem, ProductDetailResponse,
} from '../types/product.types';

class ProductApi extends BaseApi<ProductResponse, ProductCreateRequest, ProductUpdateRequest> {
  constructor() { super('products'); }

  searchProducts(page = 0, size = 10, search?: string, productTypeId?: number, sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc') {
    const params: Record<string, string | number> = { page, size, sortBy, sortDir };
    if (search)                      params.search        = search;
    if (productTypeId !== undefined) params.productTypeId = productTypeId;
    return this.axiosInstance.get('', { params });
  }

  getAllProductOptions(): Promise<ProductOption[]> {
    return this.customGet<ProductOption[]>('/options');
  }

  getProductsForListing(
    page = 0, size = 12, searchQuery?: string, categoryId?: number,
    minPrice?: number, maxPrice?: number, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc',
  ): Promise<PageResponse<ProductListItem>> {
    const params: Record<string, string | number> = { page, size, sortBy, sortDir };
    if (searchQuery)            params.search     = searchQuery;
    if (categoryId)             params.categoryId = categoryId;
    if (minPrice !== undefined) params.minPrice   = minPrice;
    if (maxPrice !== undefined) params.maxPrice   = maxPrice;
    return this.customGet<PageResponse<ProductListItem>>('/listing', { params });
  }

  getDetailById(id: string)     { return this.axiosInstance.get<ProductDetailResponse>(`/${id}`); }
  getDetailByPath(path: string) { return this.axiosInstance.get<ProductDetailResponse>(`/path/${path}`); }
}

export const productApi = new ProductApi();
