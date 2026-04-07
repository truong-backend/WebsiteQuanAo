import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@shared/types'
import { scheduleTokenExpiry, cancelTokenExpiry } from '@shared/api'

interface AuthState {
  user:         UserInfo | null
  token:        string | null
  refreshToken: string | null
  isAuth:       boolean
  pendingVerification: boolean
  pendingEmail:        string | null

  setAuth:                  (user: UserInfo, token: string, refreshToken: string) => void
  updateTokens:             (token: string, refreshToken: string) => void
  setPendingVerification:   (email: string) => void
  clearPendingVerification: () => void
  logout:                   () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user:         null,
      token:        null,
      refreshToken: null,
      isAuth:       false,
      pendingVerification: false,
      pendingEmail:        null,

      setAuth: (user, token, refreshToken) => {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        scheduleTokenExpiry(token)
        set({ user, token, refreshToken, isAuth: true, pendingVerification: false, pendingEmail: null })
      },

      /** Gọi sau khi silent refresh thành công — cập nhật cả 2 token */
      updateTokens: (token, refreshToken) => {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        scheduleTokenExpiry(token)
        set({ token, refreshToken })
      },

      setPendingVerification: (email) => {
        set({ pendingVerification: true, pendingEmail: email, isAuth: false })
      },

      clearPendingVerification: () => {
        set({ pendingVerification: false, pendingEmail: null })
      },

      logout: async () => {
        cancelTokenExpiry()
        const rt = get().refreshToken
        if (rt) {
          // Revoke refresh token trên BE (best-effort, không chờ)
          import('@features/auth/api/authApi').then(m => m.logoutApi(rt)).catch(() => {})
        }
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({
          user: null, token: null, refreshToken: null, isAuth: false,
          pendingVerification: false, pendingEmail: null,
        })
        window.location.href = '/'
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({
        user:                s.user,
        token:               s.token,
        refreshToken:        s.refreshToken,
        isAuth:              s.isAuth,
        pendingVerification: s.pendingVerification,
        pendingEmail:        s.pendingEmail,
      }),
    },
  ),
)