import type { PageResponse } from "../BaseApi/baseApi";
import { BaseApi } from "../BaseApi/baseApi";
import type { OrderItemCreateRequest } from "../../type/Orders/OrderItemCreateRequest";
import type { OrderItemUpdateRequest } from "../../type/Orders/OrderItemUpdateRequest";
import type { OrderItemResponse } from "../../type/Orders/OrderItemResponse";

class OrderItemApi extends BaseApi<
  OrderItemResponse,
  OrderItemCreateRequest,
  OrderItemUpdateRequest
> {
  constructor() {
    super("order-items");
  }

  /**
   * GET /order-items - paginated, filter by orderId, productVariantId
   */
  async getOrderItems(
    page = 0,
    size = 10,
    search?: string,
    orderId?: string,
    productVariantId?: string,
    sortBy = "id",
    sortDir: "asc" | "desc" = "asc"
  ): Promise<PageResponse<OrderItemResponse>> {
    const additionalParams: Record<string, string | number> = {};
    if (orderId) additionalParams.orderId = orderId;
    if (productVariantId) additionalParams.productVariantId = productVariantId;
    return this.getAll<PageResponse<OrderItemResponse>>(
      page,
      size,
      search,
      sortBy,
      sortDir,
      additionalParams
    );
  }
}

export const orderItemApi = new OrderItemApi();
