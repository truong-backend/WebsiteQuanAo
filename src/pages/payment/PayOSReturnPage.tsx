import { useMemo } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { useEffect } from 'react'
import { ROUTES } from '@shared/config'
import { Button, Spinner } from '@shared/ui'

type ResultState = 'loading' | 'success' | 'cancelled' | 'failed'

export default function PayOSReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate       = useNavigate()

  const { result, code } = useMemo(() => {
    const status    = searchParams.get('status')
    const cancel    = searchParams.get('cancel')
    const payosCode = searchParams.get('code') ?? ''

    let result: ResultState
    if (cancel === 'true' || status === 'CANCELLED') {
      result = 'cancelled'
    } else if (status === 'PAID' || payosCode === '00') {
      result = 'success'
    } else if (!status && !cancel && !payosCode) {
      result = 'loading'
    } else {
      result = 'failed'
    }

    return { result, code: payosCode }
  }, [searchParams])

  useEffect(() => {
    if (result === 'success') {
      const timer = setTimeout(() => navigate(ROUTES.orders), 5000)
      return () => clearTimeout(timer)
    }
  }, [result, navigate])

  if (result === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-6 text-center">
      {result === 'success' ? (
        <>
          <div className="text-6xl">✅</div>
          <p className="font-display text-4xl">Thanh toán thành công!</p>
          <p className="text-brand-mid text-sm max-w-sm">
            Đơn hàng của bạn đã được thanh toán qua PayOS thành công.
            Bạn sẽ được chuyển về trang đơn hàng sau 5 giây.
          </p>
          <Link to={ROUTES.orders}>
            <Button variant="secondary">Xem đơn hàng</Button>
          </Link>
        </>
      ) : result === 'cancelled' ? (
        <>
          <div className="text-6xl">🚫</div>
          <p className="font-display text-4xl">Đã huỷ thanh toán</p>
          <p className="text-brand-mid text-sm max-w-sm">
            Bạn đã huỷ giao dịch. Đơn hàng vẫn được lưu,
            bạn có thể thử thanh toán lại từ trang đơn hàng.
          </p>
          <div className="flex gap-3">
            <Link to={ROUTES.orders}>
              <Button variant="secondary">Xem đơn hàng</Button>
            </Link>
            <Link to={ROUTES.shop}>
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </>
      ) : (
        <>
          <div className="text-6xl">❌</div>
          <p className="font-display text-4xl">Thanh toán thất bại</p>
          <p className="text-brand-mid text-sm max-w-sm">
            Giao dịch không thành công{code ? ` (Mã lỗi: ${code})` : ''}.
            Đơn hàng của bạn vẫn được lưu, bạn có thể thử thanh toán lại.
          </p>
          <div className="flex gap-3">
            <Link to={ROUTES.orders}>
              <Button variant="secondary">Xem đơn hàng</Button>
            </Link>
            <Link to={ROUTES.shop}>
              <Button>Tiếp tục mua sắm</Button>
            </Link>
          </div>
        </>
      )}
    </main>
  )
}