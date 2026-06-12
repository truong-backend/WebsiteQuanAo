import { apiClient } from '@shared/api/client'
import type { ApiResponse, CartDto } from '@shared/types'

export async function fetchCart(): Promise<CartDto> {
  const res = await apiClient.get<ApiResponse<CartDto>>('/cart')
  return res.data.data
}

export async function addToCartApi(variantId: string, quantity: number): Promise<CartDto> {
  const res = await apiClient.post<ApiResponse<CartDto>>('/cart/items', { variantId, quantity })
  return res.data.data
}

export async function updateCartItemApi(cartItemId: number, quantity: number): Promise<CartDto> {
  const res = await apiClient.put<ApiResponse<CartDto>>(`/cart/items/${cartItemId}`, { quantity })
  return res.data.data
}

export async function removeCartItemApi(cartItemId: number): Promise<CartDto> {
  const res = await apiClient.delete<ApiResponse<CartDto>>(`/cart/items/${cartItemId}`)
  return res.data.data
}

export async function clearCartApi(): Promise<CartDto> {
  const res = await apiClient.delete<ApiResponse<CartDto>>('/cart')
  return res.data.data
}
