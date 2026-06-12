import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  PageResponse,
  UserDto,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AdminUpdateUserRequest,
  UserFilterDto,
} from '@shared/types'

// ─── Current User (Profile) ───────────────────────────────────────────────────

/** GET /api/v1/users/me */
export async function fetchMyProfile(): Promise<UserDto> {
  const res = await apiClient.get<ApiResponse<UserDto>>('/users/me')
  return res.data.data
}

/** PUT /api/v1/users/me */
export async function updateMyProfile(data: UpdateProfileRequest): Promise<UserDto> {
  const res = await apiClient.put<ApiResponse<UserDto>>('/users/me', data)
  return res.data.data
}

/** POST /api/v1/users/me/change-password */
export async function changePasswordApi(data: ChangePasswordRequest): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/users/me/change-password', data)
}

// ─── Admin: User Management ───────────────────────────────────────────────────

/** GET /api/v1/admin/users */
export async function fetchAllUsersAdmin(params: UserFilterDto = {}): Promise<PageResponse<UserDto>> {
  const cleanParams = Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== '' && v !== null),
  )
  const res = await apiClient.get<ApiResponse<PageResponse<UserDto>>>('/admin/users', { params: cleanParams })
  return res.data.data
}

/** GET /api/v1/admin/users/{id} */
export async function fetchUserByIdAdmin(id: number): Promise<UserDto> {
  const res = await apiClient.get<ApiResponse<UserDto>>(`/admin/users/${id}`)
  return res.data.data
}

/** PUT /api/v1/admin/users/{id} */
export async function adminUpdateUser(id: number, data: AdminUpdateUserRequest): Promise<UserDto> {
  const res = await apiClient.put<ApiResponse<UserDto>>(`/admin/users/${id}`, data)
  return res.data.data
}

/** DELETE /api/v1/admin/users/{id} */
export async function adminDeleteUser(id: number): Promise<void> {
  await apiClient.delete(`/admin/users/${id}`)
}

/** POST /api/v1/admin/users/{id}/restore */
export async function adminRestoreUser(id: number): Promise<UserDto> {
  const res = await apiClient.post<ApiResponse<UserDto>>(`/admin/users/${id}/restore`)
  return res.data.data
}

/** PATCH /api/v1/admin/users/{id}/status?enabled=true|false */
export async function adminToggleUserStatus(id: number, enabled: boolean): Promise<UserDto> {
  const res = await apiClient.patch<ApiResponse<UserDto>>(`/admin/users/${id}/status`, null, {
    params: { enabled },
  })
  return res.data.data
}

/** PATCH /api/v1/admin/users/{id}/role?role=ROLE_ADMIN|ROLE_USER */
export async function adminChangeUserRole(id: number, role: 'ROLE_USER' | 'ROLE_ADMIN'): Promise<UserDto> {
  const res = await apiClient.patch<ApiResponse<UserDto>>(`/admin/users/${id}/role`, null, {
    params: { role },
  })
  return res.data.data
}