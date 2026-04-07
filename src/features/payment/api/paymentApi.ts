import { apiClient } from '@shared/api/client'
import type { ApiResponse, PaymentDto, VNPayCreateResponse } from '@shared/types'

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
 * POST /api/v1/payments/vnpay/create/{orderId}
 * Returns paymentUrl — frontend should redirect user to this URL
 */
export async function createVNPayUrl(orderId: string): Promise<VNPayCreateResponse> {
  const res = await apiClient.post<ApiResponse<VNPayCreateResponse>>(
    `/payments/vnpay/create/${orderId}`,
  )
  return res.data.data
}
