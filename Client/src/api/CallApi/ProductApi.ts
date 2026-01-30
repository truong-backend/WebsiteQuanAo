// src/api/CallApi/ProductApi.ts
import { BaseApi } from "../BaseApi/baseApi";
import type { ProductResponse } from "../../type/product/ProductResponse.ts";
import type { ProductCreateRequest } from "../../type/product/ProductCreateRequest.ts";
import type { ProductUpdateRequest } from "../../type/product/ProductUpdateRequest.ts";

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
    sortDir: "asc" | "desc" = "asc"
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
}

export const productApi = new ProductApi();