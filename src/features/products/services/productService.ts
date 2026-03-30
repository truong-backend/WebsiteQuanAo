// src/features/products/services/productService.ts
// Moved from: src/modules/product/product.module.ts (ProductService)
import axios from 'axios';
import { productApi } from '../api/productApi';
import type { PageResponse } from '@/services/baseApi';
import type { ErrorResponse, SelectOption } from '@/types/common.types';
import type {
  ProductResponse, ProductResponsePageResponse,
  ProductCreateRequest, ProductUpdateRequest,
  ProductListItem, ProductDetailResponse,
} from '../types/product.types';

function errMsg(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && error.response) {
    return (error.response.data as ErrorResponse).message || fallback;
  }
  return 'Không thể kết nối server';
}

export const ProductService = {
  async getProductsPaged(page = 0, size = 10, search?: string, productTypeId?: number, sortBy = 'name', sortDir: 'asc' | 'desc' = 'asc'): Promise<ProductResponsePageResponse> {
    try { const res = await productApi.searchProducts(page, size, search, productTypeId, sortBy, sortDir); return res.data; }
    catch (e) { throw new Error(errMsg(e, 'Không thể tải danh sách sản phẩm')); }
  },

  async createProduct(payload: ProductCreateRequest): Promise<ProductResponse> {
    try { return await productApi.create(payload); }
    catch (e) { throw new Error(errMsg(e, 'Tạo sản phẩm thất bại')); }
  },

  async updateProduct(id: string, payload: ProductUpdateRequest): Promise<ProductResponse> {
    try { return await productApi.update(id, payload); }
    catch (e) { throw new Error(errMsg(e, 'Cập nhật sản phẩm thất bại')); }
  },

  async deleteProduct(id: string): Promise<void> {
    try { return await productApi.delete(id); }
    catch (e) { throw new Error(errMsg(e, 'Xóa sản phẩm thất bại')); }
  },

  async getById(id: string): Promise<ProductResponse> {
    try { return await productApi.getById(id); }
    catch (e) { throw new Error(errMsg(e, 'Không thể tải thông tin sản phẩm')); }
  },

  async getProductSelectOptions(): Promise<SelectOption[]> {
    try {
      const data = await productApi.getAllProductOptions();
      return data.map((item) => ({ value: item.productId, label: item.productName }));
    } catch (e) { throw new Error(errMsg(e, 'Không thể lấy danh sách sản phẩm')); }
  },

  async getProductsForListing(page = 0, size = 12, searchQuery?: string, categoryId?: number, minPrice?: number, maxPrice?: number, sortBy = 'createdAt', sortDir: 'asc' | 'desc' = 'desc'): Promise<PageResponse<ProductListItem>> {
    try { return await productApi.getProductsForListing(page, size, searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir); }
    catch (e) { throw new Error(errMsg(e, 'Không thể tải danh sách sản phẩm')); }
  },

  async getDetailById(id: string): Promise<ProductDetailResponse> {
    try { const res = await productApi.getDetailById(id); return res.data; }
    catch (e) { throw new Error(errMsg(e, 'Không thể tải sản phẩm')); }
  },

  async getDetailByPath(path: string): Promise<ProductDetailResponse> {
    try { const res = await productApi.getDetailByPath(path); return res.data; }
    catch (e) { throw new Error(errMsg(e, 'Không thể tải sản phẩm')); }
  },
};
