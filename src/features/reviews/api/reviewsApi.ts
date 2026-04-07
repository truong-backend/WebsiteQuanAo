import { apiClient } from '@shared/api/client'
import type { ApiResponse, PageResponse, ReviewDto, CreateReviewRequest } from '@shared/types'

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
