import { useEffect, useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { ROUTES } from '@shared/config'
import { Button, Spinner } from '@shared/ui'

type ResultState = 'loading' | 'success' | 'failed' | 'invalid'

export default function VNPayReturnPage() {
  const [searchParams]       = useSearchParams()
  const navigate             = useNavigate()
  const [result, setResult]  = useState<ResultState>('loading')
  const [responseCode, setResponseCode] = useState<string>('')

  useEffect(() => {
    const status = searchParams.get('status')
    const vnpResponseCode = searchParams.get('vnp_ResponseCode') ?? ''
    setResponseCode(vnpResponseCode)

    if (status === 'SUCCESS' && vnpResponseCode === '00') {
      setResult('success')
    } else if (status === 'INVALID_CHECKSUM') {
      setResult('invalid')
    } else {
      setResult('failed')
    }
  }, [searchParams])

  // Auto-redirect after success
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
            Đơn hàng của bạn đã được thanh toán qua VNPay thành công. Bạn sẽ được chuyển về
            trang đơn hàng sau 5 giây.
          </p>
          <Link to={ROUTES.orders}>
            <Button variant="secondary">Xem đơn hàng</Button>
          </Link>
        </>
      ) : result === 'invalid' ? (
        <>
          <div className="text-6xl">⚠️</div>
          <p className="font-display text-4xl">Chữ ký không hợp lệ</p>
          <p className="text-brand-mid text-sm max-w-sm">
            Phản hồi từ VNPay không hợp lệ. Vui lòng liên hệ hỗ trợ nếu tiền đã bị trừ.
          </p>
          <Link to={ROUTES.orders}>
            <Button variant="secondary">Kiểm tra đơn hàng</Button>
          </Link>
        </>
      ) : (
        <>
          <div className="text-6xl">❌</div>
          <p className="font-display text-4xl">Thanh toán thất bại</p>
          <p className="text-brand-mid text-sm max-w-sm">
            Giao dịch không thành công
            {responseCode ? ` (Mã lỗi: ${responseCode})` : ''}. Đơn hàng của bạn vẫn được
            lưu, bạn có thể thử thanh toán lại từ trang đơn hàng.
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