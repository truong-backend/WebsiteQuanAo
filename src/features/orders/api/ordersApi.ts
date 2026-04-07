import { apiClient } from '@shared/api/client'
import type { ApiResponse, PageResponse, OrderDto, CreateOrderRequest, OrderStatus } from '@shared/types'

export async function createOrderApi(data: CreateOrderRequest): Promise<OrderDto> {
  const res = await apiClient.post<ApiResponse<OrderDto>>('/orders', data)
  return res.data.data
}

export async function fetchMyOrders(): Promise<OrderDto[]> {
  const res = await apiClient.get<ApiResponse<OrderDto[]>>('/orders/my')
  return res.data.data
}

export async function fetchOrderById(id: string): Promise<OrderDto> {
  const res = await apiClient.get<ApiResponse<OrderDto>>(`/orders/${id}`)
  return res.data.data
}

export async function cancelOrderApi(id: string): Promise<OrderDto> {
  const res = await apiClient.post<ApiResponse<OrderDto>>(`/orders/${id}/cancel`)
  return res.data.data
}

// Admin
export async function fetchAllOrdersAdmin(params: {
  page?:    number
  size?:    number
  status?:  string
  search?:  string
  sortBy?:  string
  sortDir?: string
}): Promise<PageResponse<OrderDto>> {
  const res = await apiClient.get<ApiResponse<PageResponse<OrderDto>>>('/orders', { params })
  return res.data.data
}

export async function updateOrderStatusApi(id: string, status: OrderStatus): Promise<OrderDto> {
  const res = await apiClient.patch<ApiResponse<OrderDto>>(`/orders/${id}/status`, null, {
    params: { status },
  })
  
  return res.data.data
}
