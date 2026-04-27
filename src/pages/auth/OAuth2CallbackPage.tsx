import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@features/auth/model/authStore'
import { toast } from '@shared/lib'
import { ROUTES } from '@shared/config'
import { Spinner } from '@shared/ui'

/**
 * Trang callback sau khi đăng nhập Google thành công.
 * Backend redirect về: /oauth2/callback?accessToken=...&refreshToken=...
 */
export default function OAuth2CallbackPage() {
  const [params]  = useSearchParams()
  const setAuth   = useAuthStore((s) => s.setAuth)
  const navigate  = useNavigate()

  useEffect(() => {
    const accessToken  = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (!accessToken || !refreshToken) {
      toast('Đăng nhập Google thất bại', 'error')
      navigate(ROUTES.login, { replace: true })
      return
    }

    // Decode JWT để lấy user info (không cần gọi API thêm)
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]))
      // Gọi API /me để lấy đầy đủ thông tin user
      import('@shared/api/client').then(({ apiClient }) => {
        apiClient.get('/users/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then((res) => {
          const user = res.data.data
          setAuth(user, accessToken, refreshToken)
          toast(`Chào mừng, ${user.name}!`)
          navigate(ROUTES.home, { replace: true })
        }).catch(() => {
          // Fallback: dùng data từ JWT
          setAuth(
            {
              id:            payload.sub,
              name:          payload.name ?? payload.sub,
              email:         payload.sub,
              role:          'ROLE_USER',
              avatarUrl:     null,
              emailVerified: true,
            },
            accessToken,
            refreshToken,
          )
          toast('Đăng nhập Google thành công!')
          navigate(ROUTES.home, { replace: true })
        })
      })
    } catch {
      toast('Đăng nhập Google thất bại', 'error')
      navigate(ROUTES.login, { replace: true })
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex items-center justify-center min-h-[70vh] flex-col gap-4">
      <Spinner size="lg" />
      <p className="text-brand-mid text-sm">Đang xử lý đăng nhập Google...</p>
    </div>
  )
}