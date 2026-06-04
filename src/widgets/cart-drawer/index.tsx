import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { cn, formatPrice, resolveImageUrl } from '@shared/lib'
import { Button, Spinner, EmptyState } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { useCartStore } from '@features/cart/model/cartStore'
import { useAuthStore } from '@features/auth/model/authStore'

export function CartDrawer() {
  const { cart, isOpen, loading, closeDrawer, updateItem, removeItem, loadCart } = useCartStore()
  const isAuth = useAuthStore((s) => s.isAuth)

  useEffect(() => {
    if (isOpen && isAuth) loadCart()
  }, [isOpen, isAuth, loadCart])

  // Lock scroll when open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-brand-black/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <aside
        className={cn(
          'fixed right-0 top-0 h-full w-full max-w-md bg-brand-white z-50',
          'flex flex-col shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-light">
          <h2 className="font-display text-2xl">
            Giỏ hàng
            {cart && cart.totalItems > 0 && (
              <span className="ml-2 font-body text-sm text-brand-mid">
                ({cart.totalItems} sản phẩm)
              </span>
            )}
          </h2>
          <button
            onClick={closeDrawer}
            className="w-8 h-8 flex items-center justify-center text-brand-mid hover:text-brand-black transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Spinner size="lg" />
            </div>
          ) : !cart || cart.items.length === 0 ? (
            <EmptyState
              icon="🛍"
              title="Giỏ hàng trống"
              description="Thêm sản phẩm vào giỏ để tiếp tục mua sắm"
              action={
                <Button variant="secondary" onClick={closeDrawer}>
                  Khám phá ngay
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-brand-light">
              {cart.items.map((item) => (
                <li key={item.cartItemId} className="flex gap-4 p-5">
                  {/* Image */}
                  <Link
                    to={ROUTES.productPath(item.productSlug)}
                    onClick={closeDrawer}
                    className="flex-shrink-0"
                  >
                    <img
                      src={resolveImageUrl(item.imageUrl) ?? `https://placehold.co/80x96/f5f0eb/999999?text=${encodeURIComponent(item.productName[0] ?? '?')}`}
                      alt={item.productName}
                      className="w-20 h-24 object-cover bg-brand-cream"
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src =
                          `https://placehold.co/80x96/f5f0eb/999999?text=${encodeURIComponent(item.productName[0] ?? '?')}`
                      }}
                    />
                  </Link>

                  {/* Details */}
                  <div className="flex flex-col flex-1 gap-1">
                    <Link
                      to={ROUTES.productPath(item.productSlug)}
                      onClick={closeDrawer}
                      className="font-medium text-sm hover:text-brand-gold transition-colors line-clamp-2"
                    >
                      {item.productName}
                    </Link>
                    <p className="text-xs text-brand-mid">
                      {item.colorName} · Size {item.sizeCode}
                    </p>
                    <p className="text-sm font-medium">{formatPrice(item.unitPrice)}</p>

                    {/* Quantity controls */}
                    <div className="flex items-center gap-3 mt-auto">
                      <div className="flex items-center border border-brand-light">
                        <button
                          onClick={() => updateItem(item.cartItemId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center text-brand-mid hover:text-brand-black disabled:opacity-30 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{item.quantity}</span>
                        <button
                          onClick={() => updateItem(item.cartItemId, item.quantity + 1)}
                          disabled={item.quantity >= item.stockQuantity}
                          className="w-8 h-8 flex items-center justify-center text-brand-mid hover:text-brand-black disabled:opacity-30 transition-colors"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.cartItemId)}
                        className="text-[10px] uppercase tracking-wider text-brand-mid hover:text-red-500 transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>

                  {/* Line total */}
                  <p className="text-sm font-medium flex-shrink-0 self-start">
                    {formatPrice(item.lineTotal)}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {cart && cart.items.length > 0 && (
          <div className="border-t border-brand-light px-6 py-5 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm uppercase tracking-wider text-brand-mid">Tạm tính</span>
              <span className="font-display text-xl">{formatPrice(cart.subtotal)}</span>
            </div>
            <p className="text-xs text-brand-mid">Phí vận chuyển sẽ được tính khi đặt hàng</p>
            <Link to={ROUTES.checkout} onClick={closeDrawer}>
              <Button className="w-full" size="lg">
                Tiến hành thanh toán
              </Button>
            </Link>
            <button
              onClick={closeDrawer}
              className="text-center text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors underline underline-offset-4"
            >
              Tiếp tục mua sắm
            </button>
          </div>
        )}
      </aside>
    </>
  )
}