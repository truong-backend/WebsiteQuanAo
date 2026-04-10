import { apiClient } from '@shared/api/client'
import type { ApiResponse, AddressDto, AddressRequest } from '@shared/types'

export async function fetchMyAddresses(): Promise<AddressDto[]> {
  const res = await apiClient.get<ApiResponse<AddressDto[]>>('/users/me/addresses')
  return res.data.data
}

export async function addAddressApi(data: AddressRequest): Promise<AddressDto> {
  const res = await apiClient.post<ApiResponse<AddressDto>>('/users/me/addresses', data)
  return res.data.data
}

export async function updateAddressApi(id: number, data: AddressRequest): Promise<AddressDto> {
  const res = await apiClient.put<ApiResponse<AddressDto>>(`/users/me/addresses/${id}`, data)
  return res.data.data
}

export async function deleteAddressApi(id: number): Promise<void> {
  await apiClient.delete(`/users/me/addresses/${id}`)
}

export async function setDefaultAddressApi(id: number): Promise<AddressDto> {
  const res = await apiClient.patch<ApiResponse<AddressDto>>(`/users/me/addresses/${id}/default`)
  return res.data.data
}