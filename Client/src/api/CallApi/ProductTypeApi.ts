import type { PageResponse } from "../BaseApi/baseApi";
import { BaseApi } from "../BaseApi/baseApi";
import type { ProductTypeCreateRequest } from "../../type/ProductType/ProductTypeCreateRequest";
import type { ProductTypeUpdateRequest } from "../../type/ProductType/ProductTypeUpdateRequest";
import type { ProductTypeResponse } from "../../type/ProductType/ProductTypeResponse";

class ProductTypeApi extends BaseApi<
  ProductTypeResponse,
  ProductTypeCreateRequest,
  ProductTypeUpdateRequest
> {
  constructor() {
    super("product-types");
  }
}

export const productTypeApi = new ProductTypeApi();
