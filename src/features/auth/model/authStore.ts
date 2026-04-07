import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserInfo } from '@shared/types'

interface AuthState {
  user:    UserInfo | null
  token:   string | null
  isAuth:  boolean
  /** true after register until OTP verified */
  pendingVerification: boolean
  pendingEmail:        string | null
  setAuth:             (user: UserInfo, token: string) => void
  setPendingVerification: (email: string) => void
  clearPendingVerification: () => void
  logout:              () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user:                null,
      token:               null,
      isAuth:              false,
      pendingVerification: false,
      pendingEmail:        null,

      setAuth: (user, token) => {
        localStorage.setItem('access_token', token)
        set({ user, token, isAuth: true, pendingVerification: false, pendingEmail: null })
      },

      setPendingVerification: (email) => {
        set({ pendingVerification: true, pendingEmail: email, isAuth: false })
      },

      clearPendingVerification: () => {
        set({ pendingVerification: false, pendingEmail: null })
      },

      logout: () => {
        localStorage.removeItem('access_token')
        set({ user: null, token: null, isAuth: false, pendingVerification: false, pendingEmail: null })
        window.location.href = '/'
      },
    }),
    {
      name: 'auth-store',
      partialize: (s) => ({
        user:                s.user,
        token:               s.token,
        isAuth:              s.isAuth,
        pendingVerification: s.pendingVerification,
        pendingEmail:        s.pendingEmail,
      }),
    },
  ),
)
