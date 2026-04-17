import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  PageResponse,
  ProductListDto,
  ProductDetailDto,
  ProductFilterDto,
  Category,
} from '@shared/types'

export async function fetchProducts(filter: ProductFilterDto = {}): Promise<PageResponse<ProductListDto>> {
  const params = Object.fromEntries(
    Object.entries(filter).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  )
  const res = await apiClient.get<ApiResponse<PageResponse<ProductListDto>>>('/products', { params })
  return res.data.data
}

export async function fetchProductBySlug(slug: string): Promise<ProductDetailDto> {
  const res = await apiClient.get<ApiResponse<ProductDetailDto>>(`/products/slug/${slug}`)
  return res.data.data
}

export async function fetchProductById(id: string): Promise<ProductDetailDto> {
  const res = await apiClient.get<ApiResponse<ProductDetailDto>>(`/products/${id}`)
  return res.data.data
}

export async function fetchCategories(params?: { includeDeleted?: boolean }): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>('/categories', {
    params,
  })

  return res.data.data ?? []
}

export async function fetchRootCategories(): Promise<Category[]> {
  const res = await apiClient.get<ApiResponse<Category[]>>('/categories/roots')
  return res.data.data ?? [] 
}
