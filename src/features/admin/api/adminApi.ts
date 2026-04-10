import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  PageResponse,
  ProductDetailDto,
  ProductCreateRequest,
  ProductUpdateRequest,
  Category,
  VariantFullDto,
  VariantCreateRequest,
  VariantUpdateRequest,
  ColorDto,
  ColorRequest,
  SizeDto,
  SizeRequest,
  VoucherDto,
  VoucherRequest,
  ApplyVoucherRequest,
  ApplyVoucherResponse,
  DashboardStatsDto,
  RevenueByDayDto,
  TopProductDto,
  OrderStatusCountDto,
  ReviewDto,
} from '@shared/types'

// ─── Products ──────────────────────────────────────────────────────────────────

export async function adminCreateProduct(data: ProductCreateRequest): Promise<ProductDetailDto> {
  const res = await apiClient.post<ApiResponse<ProductDetailDto>>('/products', data)
  return res.data.data
}

export async function adminUpdateProduct(id: string, data: ProductUpdateRequest): Promise<ProductDetailDto> {
  const res = await apiClient.put<ApiResponse<ProductDetailDto>>(`/products/${id}`, data)
  return res.data.data
}

export async function adminDeleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}

// ─── Variants ──────────────────────────────────────────────────────────────────

export async function fetchVariants(productId: string): Promise<VariantFullDto[]> {
  const res = await apiClient.get<ApiResponse<VariantFullDto[]>>(`/products/${productId}/variants`)
  return res.data.data
}

export async function adminCreateVariant(productId: string, data: VariantCreateRequest): Promise<VariantFullDto> {
  const res = await apiClient.post<ApiResponse<VariantFullDto>>(`/products/${productId}/variants`, data)
  return res.data.data
}

export async function adminUpdateVariant(productId: string, variantId: string, data: VariantUpdateRequest): Promise<VariantFullDto> {
  const res = await apiClient.put<ApiResponse<VariantFullDto>>(`/products/${productId}/variants/${variantId}`, data)
  return res.data.data
}

export async function adminDeleteVariant(productId: string, variantId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}/variants/${variantId}`)
}

// ─── Categories ────────────────────────────────────────────────────────────────

export async function adminCreateCategory(data: {
  categoryName:    string
  parentCategory?: { categoryId: number } | null
}): Promise<Category> {
  const res = await apiClient.post<ApiResponse<Category>>('/categories', data)
  return res.data.data
}

export async function adminUpdateCategory(id: number, data: { categoryName: string }): Promise<Category> {
  const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, { ...data, categoryId: id })
  return res.data.data
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}

// ─── Colors ────────────────────────────────────────────────────────────────────

export async function fetchActiveColors(): Promise<ColorDto[]> {
  const res = await apiClient.get<ApiResponse<ColorDto[]>>('/colors')
  return res.data.data
}

export async function fetchAllColors(): Promise<ColorDto[]> {
  const res = await apiClient.get<ApiResponse<ColorDto[]>>('/colors/all')
  return res.data.data
}

export async function adminCreateColor(data: ColorRequest): Promise<ColorDto> {
  const res = await apiClient.post<ApiResponse<ColorDto>>('/colors', data)
  return res.data.data
}

export async function adminUpdateColor(id: number, data: ColorRequest): Promise<ColorDto> {
  const res = await apiClient.put<ApiResponse<ColorDto>>(`/colors/${id}`, data)
  return res.data.data
}

export async function adminDeleteColor(id: number): Promise<void> {
  await apiClient.delete(`/colors/${id}`)
}

// ─── Sizes ─────────────────────────────────────────────────────────────────────

export async function fetchActiveSizes(): Promise<SizeDto[]> {
  const res = await apiClient.get<ApiResponse<SizeDto[]>>('/sizes')
  return res.data.data
}

export async function fetchAllSizes(): Promise<SizeDto[]> {
  const res = await apiClient.get<ApiResponse<SizeDto[]>>('/sizes/all')
  return res.data.data
}

export async function adminCreateSize(data: SizeRequest): Promise<SizeDto> {
  const res = await apiClient.post<ApiResponse<SizeDto>>('/sizes', data)
  return res.data.data
}

export async function adminUpdateSize(id: number, data: SizeRequest): Promise<SizeDto> {
  const res = await apiClient.put<ApiResponse<SizeDto>>(`/sizes/${id}`, data)
  return res.data.data
}

export async function adminDeleteSize(id: number): Promise<void> {
  await apiClient.delete(`/sizes/${id}`)
}

// ─── Vouchers ──────────────────────────────────────────────────────────────────

export async function adminFetchVouchers(): Promise<VoucherDto[]> {
  const res = await apiClient.get<ApiResponse<VoucherDto[]>>('/vouchers')
  return res.data.data
}

export async function adminCreateVoucher(data: VoucherRequest): Promise<VoucherDto> {
  const res = await apiClient.post<ApiResponse<VoucherDto>>('/vouchers', data)
  return res.data.data
}

export async function adminUpdateVoucher(id: number, data: VoucherRequest): Promise<VoucherDto> {
  const res = await apiClient.put<ApiResponse<VoucherDto>>(`/vouchers/${id}`, data)
  return res.data.data
}

export async function adminDeleteVoucher(id: number): Promise<void> {
  await apiClient.delete(`/vouchers/${id}`)
}

/** User dùng để kiểm tra mã giảm giá khi checkout */
export async function applyVoucherApi(data: ApplyVoucherRequest): Promise<ApplyVoucherResponse> {
  const res = await apiClient.post<ApiResponse<ApplyVoucherResponse>>('/vouchers/apply', data)
  return res.data.data
}

// ─── Dashboard ─────────────────────────────────────────────────────────────────

export async function fetchDashboardStats(): Promise<DashboardStatsDto> {
  const res = await apiClient.get<ApiResponse<DashboardStatsDto>>('/admin/dashboard/stats')
  return res.data.data
}

export async function fetchRevenueByDay(
  startDate?: string,
  endDate?: string,
): Promise<RevenueByDayDto[]> {
  const res = await apiClient.get<ApiResponse<RevenueByDayDto[]>>('/admin/dashboard/revenue', {
    params: { startDate, endDate },
  })
  return res.data.data
}

export async function fetchTopProducts(limit = 10): Promise<TopProductDto[]> {
  const res = await apiClient.get<ApiResponse<TopProductDto[]>>('/admin/dashboard/top-products', {
    params: { limit },
  })
  return res.data.data
}

export async function fetchOrderStatusDistribution(): Promise<OrderStatusCountDto[]> {
  const res = await apiClient.get<ApiResponse<OrderStatusCountDto[]>>('/admin/dashboard/order-status')
  return res.data.data
}

// ─── Reviews (Admin) ───────────────────────────────────────────────────────────

export async function adminFetchReviews(params: {
  page?: number
  size?: number
  approved?: boolean
}): Promise<PageResponse<ReviewDto>> {
  const res = await apiClient.get<ApiResponse<PageResponse<ReviewDto>>>('/admin/reviews', { params })
  return res.data.data
}

export async function adminApproveReview(reviewId: number): Promise<ReviewDto> {
  const res = await apiClient.patch<ApiResponse<ReviewDto>>(`/admin/reviews/${reviewId}/approve`)
  return res.data.data
}

export async function adminDeleteReviewApi(reviewId: number): Promise<void> {
  await apiClient.delete(`/admin/reviews/${reviewId}`)
}

// ─── Re-exports ────────────────────────────────────────────────────────────────
export { fetchAllOrdersAdmin, updateOrderStatusApi } from '@features/orders/api/ordersApi'
export { fetchProducts, fetchCategories }            from '@features/catalog/api/catalogApi'