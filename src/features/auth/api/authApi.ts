import { apiClient } from '@shared/api/client'
import type {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  VerifyEmailRequest,
  ResendOtpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@shared/types'

/** POST /api/v1/auth/login */
export async function loginApi(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data)
  return res.data.data
}

/** POST /api/v1/auth/register */
export async function registerApi(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data)
  return res.data.data
}

/** POST /api/v1/auth/verify-email */
export async function verifyEmailApi(data: VerifyEmailRequest): Promise<AuthResponse> {
  const res = await apiClient.post<ApiResponse<AuthResponse>>('/auth/verify-email', data)
  return res.data.data
}

/** POST /api/v1/auth/resend-otp */
export async function resendOtpApi(data: ResendOtpRequest): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/resend-otp', data)
}

/** POST /api/v1/auth/forgot-password */
export async function forgotPasswordApi(data: ForgotPasswordRequest): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/forgot-password', data)
}

/** POST /api/v1/auth/verify-reset-otp */
export async function verifyResetOtpApi(data: VerifyEmailRequest): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/verify-reset-otp', data)
}

/** POST /api/v1/auth/reset-password */
export async function resetPasswordApi(data: ResetPasswordRequest): Promise<void> {
  await apiClient.post<ApiResponse<null>>('/auth/reset-password', data)
}

/**
 * POST /api/v1/auth/refresh
 * Dùng axios thuần (không qua apiClient) để tránh interceptor loop
 */
export async function refreshTokenApi(refreshToken: string): Promise<AuthResponse> {
  const { default: axios } = await import('axios')
  const { API_BASE } = await import('@shared/config')
  const res = await axios.post<ApiResponse<AuthResponse>>(
    `${API_BASE}/v1/auth/refresh`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  )
  return res.data.data
}

/**
 * POST /api/v1/auth/logout
 * Gửi refreshToken lên BE để revoke — dùng axios thuần tránh interceptor
 */
export async function logoutApi(refreshToken: string): Promise<void> {
  const { default: axios } = await import('axios')
  const { API_BASE } = await import('@shared/config')
  await axios.post(
    `${API_BASE}/v1/auth/logout`,
    { refreshToken },
    { headers: { 'Content-Type': 'application/json' } },
  ).catch(() => { /* ignore — logout locally regardless */ })
}
/** Redirect đến Google OAuth2 — backend Spring Boot xử lý */
export function loginWithGoogle(): void {
  const base = import.meta.env.VITE_API_BASE ?? 'http://localhost:8081'
  window.location.href = `${base}/oauth2/authorization/google`
}