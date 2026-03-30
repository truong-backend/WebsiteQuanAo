// src/features/admin/api/productVariantApi.ts
// Moved from: src/modules/productVariant/productVariant.module.ts (class ProductVariantApi)
import { BaseApi } from '@/services/baseApi';
import type {
  ProductVariantResponse,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest,
} from '../types/productVariant.types';

class ProductVariantApi extends BaseApi<ProductVariantResponse, ProductVariantCreateRequest, ProductVariantUpdateRequest> {
  constructor() { super('product-variants'); }
}

export const productVariantApi = new ProductVariantApi();
