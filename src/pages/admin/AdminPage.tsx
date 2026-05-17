import { Navigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@shared/config'
import { useAuthStore } from '@features/auth/model/authStore'
import { isAdmin } from '@entities/user/model'
import { cn } from '@shared/lib'
import { AdminDashboard }  from './tabs/AdminDashboard'
import { AdminUsers }      from './tabs/AdminUsers'
import { AdminProducts }   from './tabs/AdminProducts'
import { AdminOrders }     from './tabs/AdminOrders'
import { AdminVouchers }   from './tabs/AdminVouchers'
import { AdminReviews }    from './tabs/AdminReviews'
import { AdminCategories } from './tabs/AdminCategories'
import { AdminColors }     from './tabs/AdminColors'
import { AdminSizes }      from './tabs/AdminSizes'
import { AdminInventoryTab } from './AdminInventoryTab'

type Tab = 'dashboard' | 'users' | 'products' | 'orders' | 'vouchers' | 'reviews' | 'inventory' | 'categories' | 'colors' | 'sizes'

const VALID_TABS: Tab[] = ['dashboard', 'users', 'products', 'orders', 'vouchers', 'reviews', 'inventory', 'categories', 'colors', 'sizes']

export default function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const [searchParams, setSearchParams] = useSearchParams()

  if (!isAdmin(user)) return <Navigate to={ROUTES.home} replace />

  const rawTab = searchParams.get('tab') as Tab | null
  const tab: Tab = rawTab && VALID_TABS.includes(rawTab) ? rawTab : 'dashboard'

  const setTab = (newTab: Tab) => setSearchParams({ tab: newTab }, { replace: true })

  const tabs: { key: Tab; label: string }[] = [
    { key: 'dashboard',  label: 'Dashboard' },
    { key: 'users',      label: 'Người dùng' },
    { key: 'products',   label: 'Sản phẩm' },
    { key: 'orders',     label: 'Đơn hàng' },
    { key: 'vouchers',   label: 'Voucher' },
    { key: 'reviews',    label: 'Đánh giá' },
    { key: 'inventory',  label: 'Kho hàng' },
    { key: 'categories', label: 'Danh mục' },
    { key: 'colors',     label: 'Màu sắc' },
    { key: 'sizes',      label: 'Kích cỡ' },
  ]

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">Admin</p>
      <h1 className="font-display text-4xl mb-8">Quản trị hệ thống</h1>

      <div className="flex gap-0 border-b border-brand-light mb-10 overflow-x-auto">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'px-5 py-3 text-xs uppercase tracking-widest border-b-2 transition-all duration-200 whitespace-nowrap',
              tab === t.key
                ? 'border-brand-black text-brand-black'
                : 'border-transparent text-brand-mid hover:text-brand-black',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboard'  && <AdminDashboard />}
      {tab === 'users'      && <AdminUsers />}
      {tab === 'products'   && <AdminProducts />}
      {tab === 'orders'     && <AdminOrders />}
      {tab === 'vouchers'   && <AdminVouchers />}
      {tab === 'reviews'    && <AdminReviews />}
      {tab === 'inventory'  && <AdminInventoryTab />}
      {tab === 'categories' && <AdminCategories />}
      {tab === 'colors'     && <AdminColors />}
      {tab === 'sizes'      && <AdminSizes />}
    </main>
  )
}