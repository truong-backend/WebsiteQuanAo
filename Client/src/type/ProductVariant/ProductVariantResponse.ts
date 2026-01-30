import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface ProductVariantResponse {
  id: string;
  quantity: number;
  img: string;
  productId: string;
  colorCode: string;
  sizeId: string;
}

export type ProductVariantResponsePageResponse = PageResponse<ProductVariantResponse>;