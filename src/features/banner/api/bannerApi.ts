import { apiClient } from '@shared/api/client'
import type { ApiResponse, BannerDto, BannerRequest, BannerType } from '@shared/types'

// ── Public ──────────────────────────────────────────────────────────────────

export async function fetchActiveBanners(type?: BannerType): Promise<BannerDto[]> {
  const params = type ? { type } : {}
  const res = await apiClient.get<ApiResponse<BannerDto[]>>('/banners/active', { params })
  return res.data.data
}

export async function trackBannerImpression(id: number): Promise<void> {
  await apiClient.post(`/banners/${id}/impression`)
}

export async function trackBannerClick(id: number): Promise<void> {
  await apiClient.post(`/banners/${id}/click`)
}

// ── Admin ────────────────────────────────────────────────────────────────────

export async function adminFetchBanners(): Promise<BannerDto[]> {
  const res = await apiClient.get<ApiResponse<BannerDto[]>>('/banners')
  return res.data.data
}

export async function adminCreateBanner(data: BannerRequest): Promise<BannerDto> {
  const res = await apiClient.post<ApiResponse<BannerDto>>('/banners', data)
  return res.data.data
}

export async function adminUpdateBanner(id: number, data: BannerRequest): Promise<BannerDto> {
  const res = await apiClient.put<ApiResponse<BannerDto>>(`/banners/${id}`, data)
  return res.data.data
}

export async function adminToggleBanner(id: number): Promise<BannerDto> {
  const res = await apiClient.patch<ApiResponse<BannerDto>>(`/banners/${id}/toggle`)
  return res.data.data
}

export async function adminDeleteBanner(id: number): Promise<void> {
  await apiClient.delete(`/banners/${id}`)
}

export async function adminReorderBanners(orderedIds: number[]): Promise<void> {
  await apiClient.put('/banners/reorder', orderedIds)
}