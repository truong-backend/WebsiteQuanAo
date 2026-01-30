import { BaseApi } from "../BaseApi/baseApi";
import type { ProductVariantCreateRequest } from "../../type/ProductVariant/ProductVariantCreateRequest";
import type { ProductVariantUpdateRequest } from "../../type/ProductVariant/ProductVariantUpdateRequest";
import type { ProductVariantResponse } from "../../type/ProductVariant/ProductVariantResponse";

class ProductVariantApi extends BaseApi<
  ProductVariantResponse,
  ProductVariantCreateRequest,
  ProductVariantUpdateRequest
> {
  constructor() {
    super("product-variants");
  }
}

export const productVariantApi = new ProductVariantApi();