import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect, type ReactNode } from 'react'
import { scheduleTokenExpiry, trySilentRefresh } from '@shared/api'
import { ChatBot } from '@widgets/chatbot'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime:            1000 * 60 * 5,
      retry:                1,
      refetchOnWindowFocus: false,
    },
  },
})

/**
 * Khi app khởi động (reload trang):
 * - Nếu access token còn hạn → đặt lại timer
 * - Nếu access token hết hạn nhưng còn refresh token → silent refresh ngay
 * - Nếu không có gì → không làm gì (user chưa login)
 */
function TokenExpiryGuard() {
  useEffect(() => {
    const accessToken  = localStorage.getItem('access_token')
    const refreshToken = localStorage.getItem('refresh_token')

    if (!accessToken && !refreshToken) return

    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]))
        const expiry  = typeof payload.exp === 'number' ? payload.exp * 1000 : null

        if (expiry && Date.now() < expiry) {
          // Token còn hạn → đặt timer
          scheduleTokenExpiry(accessToken)
          return
        }
      } catch {
        /* token malformed */
      }
    }

    // Access token hết hạn hoặc không có → thử dùng refresh token
    if (refreshToken) {
      trySilentRefresh().catch(() => {
        // Refresh token cũng hết hạn → dọn sạch
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('auth-store')
        window.location.href = '/login'
      })
    }
  }, [])

  return null
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      <TokenExpiryGuard />
      {children}
      <ChatBot />
    </QueryClientProvider>
  )
}