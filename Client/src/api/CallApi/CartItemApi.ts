import type { PageResponse } from "../BaseApi/baseApi";
import { BaseApi } from "../BaseApi/baseApi";
import type { CartItemCreateRequest } from "../../type/CartItem/CartItemCreateRequest";
import type { CartItemUpdateRequest } from "../../type/CartItem/CartItemUpdateRequest";
import type { CartItemResponse } from "../../type/CartItem/CartItemResponse";

class CartItemApi extends BaseApi<
  CartItemResponse,
  CartItemCreateRequest,
  CartItemUpdateRequest
> {
  constructor() {
    super("cart-items");
  }

  /**
   * GET /cart-items - paginated, filter by cartId (server không có search)
   */
  async getCartItems(
    page = 0,
    size = 10,
    cartId?: string,
    sortBy = "id",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<PageResponse<CartItemResponse>> {
    const additionalParams: Record<string, string> = {};
    if (cartId) additionalParams.cartId = cartId;
    return this.getAll<PageResponse<CartItemResponse>>(
      page,
      size,
      undefined,
      sortBy,
      sortDir,
      additionalParams
    );
  }
}

export const cartItemApi = new CartItemApi();
