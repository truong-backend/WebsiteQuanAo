// import type { PageResponse } from "../BaseApi/baseApi";
import { BaseApi } from "../BaseApi/baseApi";
import type { CartCreateRequest } from "../../type/Cart/CartCreateRequest";
import type { CartUpdateRequest } from "../../type/Cart/CartUpdateRequest";
import type { CartResponse } from "../../type/Cart/CartResponse";

class CartApi extends BaseApi<
  CartResponse,
  CartCreateRequest,
  CartUpdateRequest
> {
  constructor() {
    super("carts");
  }
}

export const cartApi = new CartApi();
