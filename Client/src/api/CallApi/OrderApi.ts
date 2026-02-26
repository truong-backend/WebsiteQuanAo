import type { PageResponse } from "../BaseApi/baseApi";
import { BaseApi } from "../BaseApi/baseApi";
import type { OrderCreateRequest } from "../../type/Orders/OrderCreateRequest";
import type { OrderUpdateRequest } from "../../type/Orders/OrderUpdateRequest";
import type { OrderResponse } from "../../type/Orders/OrderResponse";

class OrderApi extends BaseApi<
  OrderResponse,
  OrderCreateRequest,
  OrderUpdateRequest
> {
  constructor() {
    super("orders");
  }

  /**
   * GET /orders - khớp server: page, size, search, sortBy, sortDir, status, startDate, endDate, accountId
   */
  async getOrders(
    page = 0,
    size = 10,
    search?: string,
    sortBy = "orderTime",
    sortDir: "asc" | "desc" = "desc",
    additionalParams?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      accountId?: number;
    }
  ): Promise<PageResponse<OrderResponse>> {
    const params: Record<string, string | number | boolean> = {};
    if (additionalParams?.status) params.status = additionalParams.status;
    if (additionalParams?.startDate) params.startDate = additionalParams.startDate;
    if (additionalParams?.endDate) params.endDate = additionalParams.endDate;
    if (additionalParams?.accountId != null) params.accountId = additionalParams.accountId;
    return this.getAll<PageResponse<OrderResponse>>(
      page,
      size,
      search,
      sortBy,
      sortDir,
      Object.keys(params).length ? params : undefined
    );
  }
}

export const orderApi = new OrderApi();