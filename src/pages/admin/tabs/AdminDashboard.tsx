import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatPrice, formatDate } from '@shared/lib'
import { Select, Spinner, EmptyState } from '@shared/ui'
import {
  fetchDashboardStats, fetchRevenueByDay,
  fetchTopProducts, fetchOrderStatusDistribution,
} from '@features/admin/api/adminApi'
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from '@entities/order/model'
import type { OrderStatus } from '@shared/types'
import { Badge } from '@shared/ui'
import { cn } from '@shared/lib'

export function AdminDashboard() {
  const [range, setRange] = useState('30')

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['admin', 'dashboard', 'stats'],
    queryFn:  fetchDashboardStats,
  })

  const startDate = new Date()
  startDate.setDate(startDate.getDate() - Number(range) + 1)
  const startStr = startDate.toISOString().split('T')[0]

  const { data: revenue } = useQuery({
    queryKey: ['admin', 'dashboard', 'revenue', range],
    queryFn:  () => fetchRevenueByDay(startStr),
  })

  const { data: topProducts } = useQuery({
    queryKey: ['admin', 'dashboard', 'top-products'],
    queryFn:  () => fetchTopProducts(5),
  })

  const { data: statusDist } = useQuery({
    queryKey: ['admin', 'dashboard', 'status'],
    queryFn:  fetchOrderStatusDistribution,
  })

  if (statsLoading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>

  const statCards = [
    { label: 'Tổng doanh thu',   value: formatPrice(stats?.totalRevenue ?? 0),   sub: `Tháng này: ${formatPrice(stats?.revenueThisMonth ?? 0)}` },
    { label: 'Tổng đơn hàng',    value: String(stats?.totalOrders ?? 0),          sub: `Tháng này: ${stats?.ordersThisMonth ?? 0} đơn` },
    { label: 'Đơn chờ xử lý',    value: String(stats?.pendingOrders ?? 0),        sub: 'Cần xác nhận ngay' },
    { label: 'Review chờ duyệt', value: String(stats?.pendingReviews ?? 0),       sub: 'Chưa hiển thị' },
    { label: 'Tổng sản phẩm',    value: String(stats?.totalProducts ?? 0),        sub: 'Đang hoạt động' },
    { label: 'Tổng người dùng',  value: String(stats?.totalUsers ?? 0),           sub: 'Đã đăng ký' },
  ]

  const maxRevenue = Math.max(...(revenue ?? []).map((r) => r.revenue), 1)

  return (
    <div className="flex flex-col gap-10">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="p-5 bg-brand-cream border border-brand-light">
            <p className="text-[10px] uppercase tracking-wider text-brand-mid mb-1">{c.label}</p>
            <p className="font-display text-2xl mb-1">{c.value}</p>
            <p className="text-xs text-brand-mid">{c.sub}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Doanh thu theo ngày</h2>
          <Select
            options={[
              { value: '7',  label: '7 ngày' },
              { value: '14', label: '14 ngày' },
              { value: '30', label: '30 ngày' },
            ]}
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-32"
          />
        </div>

        {revenue && revenue.length > 0 ? (
          <div className="p-4 border border-brand-light overflow-x-auto">
            <div className="flex items-end gap-1" style={{ height: 160, minWidth: revenue.length * 24 }}>
              {revenue.map((r) => {
                const h = maxRevenue > 0 ? (r.revenue / maxRevenue) * 140 : 0
                return (
                  <div
                    key={r.date}
                    className="flex flex-col items-center gap-1 flex-1 min-w-[20px]"
                    title={`${r.date}: ${formatPrice(r.revenue)} (${r.orders} đơn)`}
                  >
                    <div
                      className="w-full bg-brand-gold hover:bg-brand-black transition-colors cursor-default"
                      style={{ height: Math.max(h, r.revenue > 0 ? 2 : 0) }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="flex justify-between text-[10px] text-brand-mid mt-2">
              <span>{revenue[0]?.date}</span>
              <span>{revenue[revenue.length - 1]?.date}</span>
            </div>
          </div>
        ) : (
          <EmptyState icon="📊" title="Chưa có dữ liệu doanh thu" />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl">Sản phẩm bán chạy</h2>
          {topProducts && topProducts.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {topProducts.map((p, i) => (
                <li key={p.productId} className="flex items-center gap-3 p-3 border border-brand-light">
                  <span className="text-[10px] font-mono text-brand-mid w-5 flex-shrink-0">#{i + 1}</span>
                  <img src={p.mainImage} alt={p.productName} className="w-10 h-12 object-cover bg-brand-cream flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{p.productName}</p>
                    <p className="text-xs text-brand-mid">Đã bán: {p.totalSold} cái</p>
                  </div>
                  <p className="text-sm font-medium flex-shrink-0">{formatPrice(p.totalRevenue)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState icon="🏆" title="Chưa có dữ liệu" />
          )}
        </div>

        <div className="flex flex-col gap-4">
          <h2 className="font-display text-2xl">Phân bố trạng thái đơn</h2>
          {statusDist && (
            <ul className="flex flex-col gap-2">
              {statusDist
                .filter((s) => s.count > 0)
                .sort((a, b) => b.count - a.count)
                .map((s) => {
                  const total = statusDist.reduce((sum, x) => sum + x.count, 0)
                  const pct   = total > 0 ? Math.round((s.count / total) * 100) : 0
                  return (
                    <li key={s.status} className="flex items-center gap-3">
                      <span className="w-28 flex-shrink-0 flex justify-center">
                        <Badge variant={ORDER_STATUS_VARIANT[s.status as OrderStatus]}>
                          {ORDER_STATUS_LABEL[s.status as OrderStatus]}
                        </Badge>
                      </span>
                      <div className="flex-1 h-2 bg-brand-light rounded-full overflow-hidden">
                        <div className="h-full bg-brand-gold rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-medium w-8 text-right flex-shrink-0">{s.count}</span>
                    </li>
                  )
                })}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}