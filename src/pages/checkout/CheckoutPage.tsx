import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { formatPrice, toast, cn } from '@shared/lib'
import { Button, Input } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { useCartStore } from '@features/cart/model/cartStore'
import { useAuthStore } from '@features/auth/model/authStore'
import { createOrderApi } from '@features/orders/api/ordersApi'
import { createVNPayUrl } from '@features/payment/api/paymentApi'
import { applyVoucherApi } from '@features/admin/api/adminApi'
import type { PaymentMethod, ApplyVoucherResponse } from '@shared/types'

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: string; desc: string }[] = [
  { value: 'COD',   label: 'Thanh toán khi nhận hàng', icon: '💵', desc: 'Thanh toán bằng tiền mặt khi nhận hàng' },
  { value: 'VNPAY', label: 'VNPay',                    icon: '💳', desc: 'Thanh toán qua cổng thanh toán VNPay' },
]

export default function CheckoutPage() {
  const navigate  = useNavigate()
  const cart      = useCartStore((s) => s.cart)
  const clearCart = useCartStore((s) => s.clearCart)
  const user      = useAuthStore((s) => s.user)

  const [form, setForm] = useState({
    phone:   user?.email ?? '',
    address: '',
    note:    '',
  })
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD')
  const [errors, setErrors]               = useState<Record<string, string>>({})

  // ── Voucher state ──────────────────────────────────────────────────
  const [voucherCode,     setVoucherCode]     = useState('')
  const [appliedVoucher,  setAppliedVoucher]  = useState<ApplyVoucherResponse | null>(null)
  const [voucherError,    setVoucherError]    = useState('')

  const [isRedirectingVNPay, setIsRedirectingVNPay] = useState(false)

  // ── Apply voucher ──────────────────────────────────────────────────
  const applyVoucherMutation = useMutation({
    mutationFn: () => applyVoucherApi({
      code:     voucherCode.trim(),
      subtotal: cart?.subtotal ?? 0,
    }),
    onSuccess: (res) => {
      setAppliedVoucher(res)
      setVoucherError('')
      toast('Áp dụng voucher thành công!')
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Mã voucher không hợp lệ'
      setVoucherError(msg)
      setAppliedVoucher(null)
    },
  })

  function handleRemoveVoucher() {
    setAppliedVoucher(null)
    setVoucherCode('')
    setVoucherError('')
  }

  // ── Create order ───────────────────────────────────────────────────
  const orderMutation = useMutation({
    mutationFn: createOrderApi,
    onSuccess: async (order) => {
      await clearCart()
      if (paymentMethod === 'VNPAY') {
        try {
          setIsRedirectingVNPay(true)
          toast('Đang chuyển đến trang thanh toán VNPay...')
          const vnpayRes = await createVNPayUrl(order.id)
          window.location.href = vnpayRes.paymentUrl
        } catch {
          setIsRedirectingVNPay(false)
          toast('Không thể tạo link thanh toán VNPay', 'error')
          navigate(ROUTES.orderPath(order.id))
        }
      } else {
        toast('Đặt hàng thành công!')
        navigate(ROUTES.orderPath(order.id))
      }
    },
    onError: (err: unknown) => {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Đặt hàng thất bại'
      toast(msg, 'error')
    },
  })

  function validate() {
    const e: Record<string, string> = {}
    if (!form.phone.match(/^[0-9]{10}$/))   e.phone   = 'Số điện thoại không hợp lệ'
    if (!form.address.trim())               e.address = 'Vui lòng nhập địa chỉ giao hàng'
    return e
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    if (!cart || cart.items.length === 0) { toast('Giỏ hàng trống', 'error'); return }

    orderMutation.mutate({
      phoneNumber:     form.phone,
      shippingAddress: form.address,
      note:            form.note || undefined,
      paymentMethod,
      voucherId:       appliedVoucher?.voucherId ?? undefined,
      items: cart.items.map((item) => ({
        variantId: item.variantId,
        quantity:  item.quantity,
      })),
      clearCart: true,
    })
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-3xl">Giỏ hàng trống</p>
        <Link to={ROUTES.shop}><Button variant="secondary">Tiếp tục mua sắm</Button></Link>
      </div>
    )
  }

  const SHIPPING_FEE   = cart.subtotal >= 500_000 ? 0 : 30_000
  const discountAmount = appliedVoucher?.discountAmount ?? 0
  const total          = Math.max(cart.subtotal + SHIPPING_FEE - discountAmount, 0)

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">Đặt hàng</p>
      <h1 className="font-display text-4xl mb-10">Thanh toán</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-12">
          {/* Left: Shipping + voucher + payment */}
          <div className="flex flex-col gap-10">
            {/* Shipping info */}
            <section className="flex flex-col gap-6">
              <h2 className="font-display text-2xl">Thông tin giao hàng</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <Input
                    label="Họ tên người nhận"
                    value={user?.name ?? ''}
                    readOnly
                    className="bg-brand-cream cursor-default"
                  />
                </div>
                <Input
                  label="Số điện thoại"
                  placeholder="0901234567"
                  value={form.phone}
                  error={errors.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
                <Input
                  label="Email"
                  value={user?.email ?? ''}
                  readOnly
                  className="bg-brand-cream cursor-default"
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Địa chỉ giao hàng"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
                    value={form.address}
                    error={errors.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">
                    Ghi chú (tuỳ chọn)
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Ghi chú cho người giao hàng..."
                    value={form.note}
                    onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
                    className="w-full border border-brand-light bg-transparent px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Voucher */}
            <section className="flex flex-col gap-4">
              <h2 className="font-display text-2xl">Mã giảm giá</h2>
              {appliedVoucher ? (
                <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50">
                  <div>
                    <p className="text-sm font-medium text-green-800">
                      {appliedVoucher.code}
                    </p>
                    <p className="text-xs text-green-700">
                      Giảm {formatPrice(appliedVoucher.discountAmount)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveVoucher}
                    className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Input
                    placeholder="Nhập mã voucher..."
                    value={voucherCode}
                    onChange={(e) => { setVoucherCode(e.target.value.toUpperCase()); setVoucherError('') }}
                    error={voucherError}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="secondary"
                    loading={applyVoucherMutation.isPending}
                    disabled={!voucherCode.trim()}
                    onClick={() => applyVoucherMutation.mutate()}
                    className="flex-shrink-0"
                  >
                    Áp dụng
                  </Button>
                </div>
              )}
            </section>

            {/* Payment method */}
            <section className="flex flex-col gap-6">
              <h2 className="font-display text-2xl">Phương thức thanh toán</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setPaymentMethod(m.value)}
                    className={cn(
                      'flex items-center gap-4 p-4 border text-left transition-all duration-200',
                      paymentMethod === m.value
                        ? 'border-brand-black bg-brand-cream'
                        : 'border-brand-light hover:border-brand-mid',
                    )}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{m.label}</p>
                      <p className="text-xs text-brand-mid">{m.desc}</p>
                    </div>
                    <div
                      className={cn(
                        'ml-auto w-4 h-4 rounded-full border-2 flex-shrink-0 transition-colors',
                        paymentMethod === m.value ? 'border-brand-black bg-brand-black' : 'border-brand-light',
                      )}
                    />
                  </button>
                ))}
              </div>
            </section>
          </div>

          {/* Right: Order summary */}
          <div>
            <div className="sticky top-24 bg-brand-cream p-6 flex flex-col gap-6">
              <h2 className="font-display text-2xl">Tóm tắt đơn hàng</h2>

              <ul className="flex flex-col gap-4 max-h-72 overflow-y-auto">
                {cart.items.map((item) => (
                  <li key={item.cartItemId} className="flex gap-3">
                    <div className="relative flex-shrink-0">
                      <img
                        src={item.imageUrl ?? '/placeholder.jpg'}
                        alt={item.productName}
                        className="w-16 h-20 object-cover bg-brand-white"
                      />
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-brand-black text-brand-white text-[10px] rounded-full flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium line-clamp-1">{item.productName}</p>
                      <p className="text-xs text-brand-mid">{item.colorName} · {item.sizeCode}</p>
                    </div>
                    <p className="text-sm font-medium flex-shrink-0">{formatPrice(item.lineTotal)}</p>
                  </li>
                ))}
              </ul>

              <div className="flex flex-col gap-3 pt-4 border-t border-brand-light">
                <div className="flex justify-between text-sm">
                  <span className="text-brand-mid">Tạm tính</span>
                  <span>{formatPrice(cart.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-brand-mid">Phí vận chuyển</span>
                  <span className={SHIPPING_FEE === 0 ? 'text-green-700' : ''}>
                    {SHIPPING_FEE === 0 ? 'Miễn phí' : formatPrice(SHIPPING_FEE)}
                  </span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-700">
                    <span>Giảm giá ({appliedVoucher?.code})</span>
                    <span>-{formatPrice(discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-medium pt-3 border-t border-brand-light">
                  <span className="text-xs uppercase tracking-wider">Tổng cộng</span>
                  <span className="font-display text-xl">{formatPrice(total)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                loading={orderMutation.isPending || isRedirectingVNPay}
                className="w-full"
              >
                {paymentMethod === 'VNPAY' ? 'Đặt hàng & Thanh toán VNPay' : 'Đặt hàng ngay'}
              </Button>

              <p className="text-xs text-center text-brand-mid">
                Bằng cách đặt hàng, bạn đồng ý với{' '}
                <button className="underline hover:text-brand-black transition-colors">
                  điều khoản sử dụng
                </button>
              </p>
            </div>
          </div>
        </div>
      </form>
    </main>
  )
}