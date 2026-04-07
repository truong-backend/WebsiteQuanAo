import { useParams, Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrice, formatDate, toast } from '@shared/lib'
import { Button, Spinner, Badge, EmptyState } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { fetchMyOrders, fetchOrderById, cancelOrderApi } from '@features/orders/api/ordersApi'
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_VARIANT,
  PAYMENT_METHOD_LABEL,
  canCancelOrder,
} from '@entities/order/model'

// ── Order history list ────────────────────────────────────────────────────────
export function OrdersPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders', 'my'],
    queryFn:  fetchMyOrders,
  })

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">Tài khoản</p>
      <h1 className="font-display text-4xl mb-10">Đơn hàng của tôi</h1>

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner size="lg" /></div>
      ) : !orders || orders.length === 0 ? (
        <EmptyState
          icon="📦"
          title="Chưa có đơn hàng nào"
          description="Bắt đầu mua sắm để tạo đơn hàng đầu tiên của bạn"
          action={
            <Link to={ROUTES.shop}>
              <Button variant="secondary">Khám phá ngay</Button>
            </Link>
          }
        />
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <Link
              key={order.id}
              to={ROUTES.orderPath(order.id)}
              className="block border border-brand-light hover:border-brand-black transition-colors duration-200 group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 gap-4">
                {/* Left */}
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-brand-mid">#{order.id.substring(0, 8).toUpperCase()}</span>
                    <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </Badge>
                  </div>
                  <p className="text-sm text-brand-mid">{formatDate(order.orderTime)}</p>
                  <p className="text-xs text-brand-mid">{order.items.length} sản phẩm</p>
                </div>

                {/* Right */}
                <div className="flex items-center gap-6">
                  <p className="font-display text-xl">{formatPrice(order.totalAmount)}</p>
                  <svg
                    className="w-4 h-4 text-brand-mid group-hover:text-brand-black transition-colors"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </div>
              </div>

              {/* Items preview */}
              <div className="flex gap-2 px-6 pb-6 overflow-x-auto">
                {order.items.slice(0, 5).map((item) => (
                  <img
                    key={item.id}
                    src={item.imageUrl ?? '/placeholder.jpg'}
                    alt={item.productName}
                    className="w-12 h-16 object-cover flex-shrink-0 bg-brand-cream"
                  />
                ))}
                {order.items.length > 5 && (
                  <div className="w-12 h-16 bg-brand-cream flex items-center justify-center text-xs text-brand-mid flex-shrink-0">
                    +{order.items.length - 5}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  )
}

// ── Order detail ──────────────────────────────────────────────────────────────
export function OrderDetailPage() {
  const { id }          = useParams<{ id: string }>()
  const navigate        = useNavigate()
  const queryClient     = useQueryClient()

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', id],
    queryFn:  () => fetchOrderById(id!),
    enabled:  !!id,
  })

  const cancelMutation = useMutation({
    mutationFn: () => cancelOrderApi(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['order', id] })
      queryClient.invalidateQueries({ queryKey: ['orders', 'my'] })
      toast('Đã hủy đơn hàng')
    },
    onError: () => toast('Không thể hủy đơn hàng', 'error'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20"><Spinner size="lg" /></div>
    )
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-3xl">Không tìm thấy đơn hàng</p>
        <Button variant="secondary" onClick={() => navigate(ROUTES.orders)}>Quay lại</Button>
      </div>
    )
  }

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      {/* Header */}
      <button
        onClick={() => navigate(ROUTES.orders)}
        className="flex items-center gap-2 text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors mb-8"
      >
        ← Đơn hàng của tôi
      </button>

      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">Chi tiết đơn</p>
          <h1 className="font-display text-4xl">#{order.id.substring(0, 8).toUpperCase()}</h1>
          <p className="text-sm text-brand-mid mt-1">{formatDate(order.orderTime)}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={ORDER_STATUS_VARIANT[order.status]}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
          {canCancelOrder(order) && (
            <Button
              variant="danger"
              size="sm"
              loading={cancelMutation.isPending}
              onClick={() => {
                if (confirm('Bạn có chắc muốn hủy đơn hàng này?'))
                  cancelMutation.mutate()
              }}
            >
              Hủy đơn
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8">
        {/* Items */}
        <div className="flex flex-col gap-6">
          <h2 className="font-display text-2xl">Sản phẩm</h2>
          <ul className="flex flex-col divide-y divide-brand-light">
            {order.items.map((item) => (
              <li key={item.id} className="flex gap-4 py-5">
                <img
                  src={item.imageUrl ?? '/placeholder.jpg'}
                  alt={item.productName}
                  className="w-20 h-24 object-cover flex-shrink-0 bg-brand-cream"
                />
                <div className="flex flex-col gap-1 flex-1">
                  <p className="font-medium">{item.productName}</p>
                  <p className="text-xs text-brand-mid">{item.variantInfo}</p>
                  <p className="text-xs text-brand-mid">Số lượng: {item.quantity}</p>
                  <p className="text-sm">{formatPrice(item.unitPrice)} / cái</p>
                </div>
                <p className="font-medium flex-shrink-0">{formatPrice(item.lineTotal)}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Summary sidebar */}
        <div className="flex flex-col gap-6">
          {/* Pricing */}
          <div className="bg-brand-cream p-6 flex flex-col gap-4">
            <h3 className="font-display text-xl">Tổng kết</h3>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-mid">Tạm tính</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-mid">Vận chuyển</span>
                <span>{order.shippingFee === 0 ? 'Miễn phí' : formatPrice(order.shippingFee)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-700">
                  <span>Giảm giá</span>
                  <span>-{formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-medium pt-3 border-t border-brand-light">
                <span className="text-xs uppercase tracking-wider">Tổng cộng</span>
                <span className="font-display text-xl">{formatPrice(order.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="bg-brand-cream p-6 flex flex-col gap-3">
            <h3 className="font-display text-xl">Giao hàng</h3>
            <p className="text-sm text-brand-charcoal">{order.shippingAddress}</p>
            <p className="text-sm text-brand-mid">SĐT: {order.phoneNumber}</p>
            {order.note && <p className="text-xs text-brand-mid italic">Ghi chú: {order.note}</p>}
          </div>

          {/* Payment */}
          <div className="bg-brand-cream p-6 flex flex-col gap-3">
            <h3 className="font-display text-xl">Thanh toán</h3>
            {order.payment ? (
              <>
                <p className="text-sm">{PAYMENT_METHOD_LABEL[order.payment.method] ?? order.payment.method}</p>
                <Badge
                  variant={
                    order.payment.status === 'PAID'   ? 'success' :
                    order.payment.status === 'FAILED' ? 'error'   : 'warning'
                  }
                >
                  {order.payment.status === 'PAID'   ? 'Đã thanh toán' :
                   order.payment.status === 'FAILED' ? 'Thất bại'      : 'Chờ thanh toán'}
                </Badge>
                {order.payment.transactionId && (
                  <p className="text-xs font-mono text-brand-mid">TX: {order.payment.transactionId}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-brand-mid">Chưa có thông tin thanh toán</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

export default OrdersPage
