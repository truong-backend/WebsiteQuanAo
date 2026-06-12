import { apiClient } from '@shared/api/client'
import type { ApiResponse, PaymentDto, PayOSCreateResponse } from '@shared/types'

/** GET /api/v1/payments/order/{orderId} */
export async function fetchPaymentByOrderId(orderId: string): Promise<PaymentDto> {
  const res = await apiClient.get<ApiResponse<PaymentDto>>(`/payments/order/${orderId}`)
  return res.data.data
}

/** GET /api/v1/payments/{paymentId} */
export async function fetchPaymentById(paymentId: string): Promise<PaymentDto> {
  const res = await apiClient.get<ApiResponse<PaymentDto>>(`/payments/${paymentId}`)
  return res.data.data
}

/**
 * POST /api/v1/payments/payos/create/{orderId}
 * Returns checkoutUrl — frontend redirect user tới PayOS
 */
export async function createPayOSLink(orderId: string): Promise<PayOSCreateResponse> {
  const res = await apiClient.post<ApiResponse<PayOSCreateResponse>>(
    `/payments/payos/create/${orderId}`,
  )
  return res.data.data
}