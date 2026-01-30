import { BaseApi } from "../BaseApi/baseApi";
import type { OrderCreateRequest } from "../../type/Orders/OrderCreateRequest";
import type { OrderUpdateRequest } from "../../type/Orders/OrderUpdateRequest";
import type { OrderResponse, OrderResponsePageResponse } from "../../type/Orders/OrderResponse";
import type { OrderStatus } from "../../type/Orders/OrderStatus";

class OrderApi extends BaseApi<
  OrderResponse,
  OrderCreateRequest,
  OrderUpdateRequest
> {
  constructor() {
    super("orders");
  }

  /**
   * Get orders with advanced filters
   * @param page - Page number
   * @param size - Items per page
   * @param search - Search term
   * @param sortBy - Field to sort by
   * @param sortDir - Sort direction
   * @param status - Filter by order status
   * @param startDate - Filter by start date (ISO string)
   * @param endDate - Filter by end date (ISO string)
   * @param accountId - Filter by account/customer ID
   * @returns Paginated orders
   */
  async getOrdersFiltered(
    page = 0,
    size = 10,
    search?: string,
    sortBy?: string,
    sortDir: "asc" | "desc" = "desc",
    status?: OrderStatus,
    startDate?: string,
    endDate?: string,
    accountId?: number
  ): Promise<OrderResponsePageResponse> {
    const additionalParams: Record<string, string | number> = {};

    if (status) {
      additionalParams.status = status;
    }
    if (startDate) {
      additionalParams.startDate = startDate;
    }
    if (endDate) {
      additionalParams.endDate = endDate;
    }
    if (accountId !== undefined && accountId !== null) {
      additionalParams.accountId = accountId;
    }

    return this.getAll<OrderResponsePageResponse>(
      page,
      size,
      search,
      sortBy,
      sortDir,
      additionalParams
    );
  }
}

export const orderApi = new OrderApi();