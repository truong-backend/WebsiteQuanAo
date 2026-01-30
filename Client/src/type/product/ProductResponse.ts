import type { PageResponse } from "../../api/BaseApi/baseApi";

export interface ProductResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  path: string;
  img: string;
  hoverImg?: string;
  productTypeId: number;
}

export type ProductResponsePageResponse = PageResponse<ProductResponse>;