import type { PageResponse } from "../BaseApi/baseApi";
import { BaseApi } from "../BaseApi/baseApi";
import type { OrderCreateRequest } from "../../type/Orders/OrderCreateRequest";
import type { OrderUpdateRequest } from "../../type/Orders/OrderUpdateRequest";
import type { OrderResponse } from "../../type/Orders/OrderResponse";
import type { CreateOrderRequest } from "../../type/Orders/OrderTypes";

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
    },
  ): Promise<PageResponse<OrderResponse>> {
    const params: Record<string, string | number | boolean> = {};
    if (additionalParams?.status) params.status = additionalParams.status;
    if (additionalParams?.startDate)
      params.startDate = additionalParams.startDate;
    if (additionalParams?.endDate) params.endDate = additionalParams.endDate;
    if (additionalParams?.accountId != null)
      params.accountId = additionalParams.accountId;
    return this.getAll<PageResponse<OrderResponse>>(
      page,
      size,
      search,
      sortBy,
      sortDir,
      Object.keys(params).length ? params : undefined,
    );
  }

  async updateStatus(id: string, status: string): Promise<OrderResponse> {
    const response = await this.axiosInstance.patch<OrderResponse>(
      `/${id}/status`,
      null,
      { params: { status } },
    );
    return response.data;
  }

  /** Tạo đơn hàng mới */
  createOrder(payload: CreateOrderRequest) {
    return this.axiosInstance.post<OrderResponse>("", payload);
  }

  // OrderApi.ts — thêm method này
  async createUserOrder(payload: CreateOrderRequest): Promise<OrderResponse> {
    const res = await this.axiosInstance.post<OrderResponse>("", payload);
    return res.data;
  }

  /** Lịch sử đơn hàng của user hiện tại */
  getMyOrders() {
    return this.axiosInstance.get<OrderResponse[]>("/me");
  }

  /** Chi tiết đơn hàng */
  getOrderById(id: string) {
    return this.axiosInstance.get<OrderResponse>(`/${id}`);
  }
}

export const orderApi = new OrderApi();
