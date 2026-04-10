import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  PageResponse,
  ReviewDto,
  CreateReviewRequest,
  ReviewableOrderDto,
} from '@shared/types'

export async function fetchReviews(
  productId: string,
  page = 0,
  size = 10,
): Promise<PageResponse<ReviewDto>> {
  const res = await apiClient.get<ApiResponse<PageResponse<ReviewDto>>>(
    `/products/${productId}/reviews`,
    { params: { page, size } },
  )
  return res.data.data
}

/** Lấy danh sách đơn hàng mà user đã mua sản phẩm này và có thể review */
export async function fetchReviewableOrders(
  productId: string,
): Promise<ReviewableOrderDto[]> {
  const res = await apiClient.get<ApiResponse<ReviewableOrderDto[]>>(
    `/products/${productId}/reviews/reviewable-orders`,
  )
  return res.data.data
}

export async function createReviewApi(
  productId: string,
  data: CreateReviewRequest,
): Promise<ReviewDto> {
  const res = await apiClient.post<ApiResponse<ReviewDto>>(
    `/products/${productId}/reviews`,
    data,
  )
  return res.data.data
}

export async function deleteReviewApi(productId: string, reviewId: number): Promise<void> {
  await apiClient.delete(`/products/${productId}/reviews/${reviewId}`)
}

// Admin
export async function adminFetchAllReviews(params: {
  page?: number
  size?: number
  approved?: boolean
}): Promise<PageResponse<ReviewDto>> {
  const res = await apiClient.get<ApiResponse<PageResponse<ReviewDto>>>(
    '/admin/reviews',
    { params },
  )
  return res.data.data
}

export async function adminApproveReview(reviewId: number): Promise<ReviewDto> {
  const res = await apiClient.patch<ApiResponse<ReviewDto>>(
    `/admin/reviews/${reviewId}/approve`,
  )
  return res.data.data
}

export async function adminDeleteReview(reviewId: number): Promise<void> {
  await apiClient.delete(`/admin/reviews/${reviewId}`)
}