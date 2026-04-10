import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  PageResponse,
  InventoryLogDto,
  ImportStockRequest,
  AdjustStockRequest,
} from '@shared/types'

export async function fetchInventoryLogs(params: {
  page?: number
  size?: number
}): Promise<PageResponse<InventoryLogDto>> {
  const res = await apiClient.get<ApiResponse<PageResponse<InventoryLogDto>>>(
    '/admin/inventory/logs',
    { params },
  )
  return res.data.data
}

export async function fetchInventoryLogsByVariant(
  variantId: string,
  page = 0,
): Promise<PageResponse<InventoryLogDto>> {
  const res = await apiClient.get<ApiResponse<PageResponse<InventoryLogDto>>>(
    `/admin/inventory/logs/variant/${variantId}`,
    { params: { page } },
  )
  return res.data.data
}

export async function fetchInventoryLogsByProduct(
  productId: string,
): Promise<InventoryLogDto[]> {
  const res = await apiClient.get<ApiResponse<InventoryLogDto[]>>(
    `/admin/inventory/logs/product/${productId}`,
  )
  return res.data.data
}

export async function importStockApi(data: ImportStockRequest): Promise<InventoryLogDto> {
  const res = await apiClient.post<ApiResponse<InventoryLogDto>>(
    '/admin/inventory/import',
    data,
  )
  return res.data.data
}

export async function adjustStockApi(data: AdjustStockRequest): Promise<InventoryLogDto> {
  const res = await apiClient.post<ApiResponse<InventoryLogDto>>(
    '/admin/inventory/adjust',
    data,
  )
  return res.data.data
}