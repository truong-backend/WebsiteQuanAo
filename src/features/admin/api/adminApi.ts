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
} from '@shared/types'

// ─── Products ──────────────────────────────────────────────────────────────────

/** POST /api/v1/products — Admin only */
export async function adminCreateProduct(data: ProductCreateRequest): Promise<ProductDetailDto> {
  const res = await apiClient.post<ApiResponse<ProductDetailDto>>('/products', data)
  return res.data.data
}

/** PUT /api/v1/products/{id} — Admin only */
export async function adminUpdateProduct(id: string, data: ProductUpdateRequest): Promise<ProductDetailDto> {
  const res = await apiClient.put<ApiResponse<ProductDetailDto>>(`/products/${id}`, data)
  return res.data.data
}

/** DELETE /api/v1/products/{id} — Admin only */
export async function adminDeleteProduct(id: string): Promise<void> {
  await apiClient.delete(`/products/${id}`)
}

// ─── Variants ──────────────────────────────────────────────────────────────────

/** GET /api/v1/products/{productId}/variants */
export async function fetchVariants(productId: string): Promise<VariantFullDto[]> {
  const res = await apiClient.get<ApiResponse<VariantFullDto[]>>(`/products/${productId}/variants`)
  return res.data.data
}

/**
 * POST /api/v1/products/{productId}/variants
 * IMPORTANT: request uses colorId and sizeId (Long), NOT colorCode/colorName strings
 */
export async function adminCreateVariant(
  productId: string,
  data: VariantCreateRequest,
): Promise<VariantFullDto> {
  const res = await apiClient.post<ApiResponse<VariantFullDto>>(
    `/products/${productId}/variants`,
    data,
  )
  return res.data.data
}

/**
 * PUT /api/v1/products/{productId}/variants/{variantId}
 * IMPORTANT: request uses colorId and sizeId (Long)
 */
export async function adminUpdateVariant(
  productId: string,
  variantId: string,
  data: VariantUpdateRequest,
): Promise<VariantFullDto> {
  const res = await apiClient.put<ApiResponse<VariantFullDto>>(
    `/products/${productId}/variants/${variantId}`,
    data,
  )
  return res.data.data
}

/** DELETE /api/v1/products/{productId}/variants/{variantId} */
export async function adminDeleteVariant(productId: string, variantId: string): Promise<void> {
  await apiClient.delete(`/products/${productId}/variants/${variantId}`)
}

// ─── Categories ────────────────────────────────────────────────────────────────

export async function adminCreateCategory(data: {
  categoryName:      string
  parentCategory?:   { categoryId: number } | null
}): Promise<Category> {
  const res = await apiClient.post<ApiResponse<Category>>('/categories', data)
  return res.data.data
}

export async function adminUpdateCategory(
  id: number,
  data: { categoryName: string },
): Promise<Category> {
  const res = await apiClient.put<ApiResponse<Category>>(`/categories/${id}`, {
    ...data,
    categoryId: id,
  })
  return res.data.data
}

export async function adminDeleteCategory(id: number): Promise<void> {
  await apiClient.delete(`/categories/${id}`)
}

// ─── Colors ────────────────────────────────────────────────────────────────────

/** GET /api/v1/colors — active only (public) */
export async function fetchActiveColors(): Promise<ColorDto[]> {
  const res = await apiClient.get<ApiResponse<ColorDto[]>>('/colors')
  return res.data.data
}

/** GET /api/v1/colors/all — all including inactive (admin) */
export async function fetchAllColors(): Promise<ColorDto[]> {
  const res = await apiClient.get<ApiResponse<ColorDto[]>>('/colors/all')
  return res.data.data
}

/** POST /api/v1/colors */
export async function adminCreateColor(data: ColorRequest): Promise<ColorDto> {
  const res = await apiClient.post<ApiResponse<ColorDto>>('/colors', data)
  return res.data.data
}

/** PUT /api/v1/colors/{id} */
export async function adminUpdateColor(id: number, data: ColorRequest): Promise<ColorDto> {
  const res = await apiClient.put<ApiResponse<ColorDto>>(`/colors/${id}`, data)
  return res.data.data
}

/** DELETE /api/v1/colors/{id} — soft delete */
export async function adminDeleteColor(id: number): Promise<void> {
  await apiClient.delete(`/colors/${id}`)
}

// ─── Sizes ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/sizes — active only (public) */
export async function fetchActiveSizes(): Promise<SizeDto[]> {
  const res = await apiClient.get<ApiResponse<SizeDto[]>>('/sizes')
  return res.data.data
}

/** GET /api/v1/sizes/all — all including inactive (admin) */
export async function fetchAllSizes(): Promise<SizeDto[]> {
  const res = await apiClient.get<ApiResponse<SizeDto[]>>('/sizes/all')
  return res.data.data
}

/** POST /api/v1/sizes */
export async function adminCreateSize(data: SizeRequest): Promise<SizeDto> {
  const res = await apiClient.post<ApiResponse<SizeDto>>('/sizes', data)
  return res.data.data
}

/** PUT /api/v1/sizes/{id} */
export async function adminUpdateSize(id: number, data: SizeRequest): Promise<SizeDto> {
  const res = await apiClient.put<ApiResponse<SizeDto>>(`/sizes/${id}`, data)
  return res.data.data
}

/** DELETE /api/v1/sizes/{id} — soft delete */
export async function adminDeleteSize(id: number): Promise<void> {
  await apiClient.delete(`/sizes/${id}`)
}

// ─── Re-exports ────────────────────────────────────────────────────────────────
export { fetchAllOrdersAdmin, updateOrderStatusApi } from '@features/orders/api/ordersApi'
export { fetchProducts, fetchCategories }            from '@features/catalog/api/catalogApi'
