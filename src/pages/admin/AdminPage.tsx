import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrice, formatDate, toast, cn } from '@shared/lib'
import {
  Button, Badge, Input, Select, Spinner, Modal, EmptyState,
} from '@shared/ui'
import { ROUTES } from '@shared/config'
import { useAuthStore } from '@features/auth/model/authStore'
import { isAdmin } from '@entities/user/model'
import { fetchProducts, fetchCategories } from '@features/catalog/api/catalogApi'
import {
  adminDeleteProduct, adminCreateProduct, adminUpdateProduct,
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  fetchAllColors, fetchAllSizes,
  adminCreateColor, adminUpdateColor, adminDeleteColor,
  adminCreateSize, adminUpdateSize, adminDeleteSize,
  fetchVariants, adminCreateVariant, adminUpdateVariant, adminDeleteVariant,
  fetchAllOrdersAdmin, updateOrderStatusApi,
  adminFetchVouchers, adminCreateVoucher, adminUpdateVoucher, adminDeleteVoucher,
  fetchDashboardStats, fetchRevenueByDay, fetchTopProducts, fetchOrderStatusDistribution,
  adminFetchReviews, adminApproveReview, adminDeleteReviewApi,
} from '@features/admin/api/adminApi'
import { ImageUploader } from '@features/upload/ui/ImageUploader'
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from '@entities/order/model'
import type {
  OrderStatus,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductDetailDto,
  ProductListDto,
  VariantFullDto,
  VariantCreateRequest,
  VariantUpdateRequest,
  ColorDto,
  SizeDto,
  VoucherDto,
  VoucherRequest,
} from '@shared/types'
import {
  fetchAllUsersAdmin, adminDeleteUser, adminToggleUserStatus, adminChangeUserRole,
} from '@features/user/api/userApi'
import type { UserDto } from '@shared/types'
import { AdminInventoryTab } from './AdminInventoryTab'

type Tab = 'dashboard' | 'products' | 'orders' | 'categories' | 'colors' | 'sizes' | 'vouchers' | 'reviews' | 'inventory' | 'users'

export default function AdminPage() {
  const user = useAuthStore((s) => s.user)
  const [tab, setTab] = useState<Tab>('dashboard')

  if (!isAdmin(user)) return <Navigate to={ROUTES.home} replace />

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

// ══════════════════════════════════════════════════════════════════
// ── Dashboard tab ─────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminDashboard() {
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
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {statCards.map((c) => (
          <div key={c.label} className="p-5 bg-brand-cream border border-brand-light">
            <p className="text-[10px] uppercase tracking-wider text-brand-mid mb-1">{c.label}</p>
            <p className="font-display text-2xl mb-1">{c.value}</p>
            <p className="text-xs text-brand-mid">{c.sub}</p>
          </div>
        ))}
      </div>

      {/* Revenue chart */}
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
        {/* Top products */}
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

        {/* Order status distribution */}
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
                      {/* fix: Badge không có className — dùng span wrapper */}
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

// ══════════════════════════════════════════════════════════════════
// ── Products tab ──────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminProducts() {
  const [search, setSearch]           = useState('')
  const [page, setPage]               = useState(0)
  const [createOpen, setCreateOpen]   = useState(false)
  const [editProduct, setEditProduct] = useState<ProductListDto | null>(null)
  const [variantProduct, setVariantProduct] = useState<ProductListDto | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search],
    queryFn:  () => fetchProducts({ page, size: 15, search: search || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast('Đã xóa') },
    onError:    () => toast('Xóa thất bại', 'error'),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="max-w-xs"
        />
        <Button onClick={() => setCreateOpen(true)}>+ Thêm sản phẩm</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.content.length ? (
        <EmptyState icon="📦" title="Không có sản phẩm nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {['Ảnh', 'Tên sản phẩm', 'Danh mục', 'Giá', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/50">
                {data.content.map((p) => (
                  <tr key={p.id} className="hover:bg-brand-cream/50 transition-colors">
                    <td className="py-3 pr-4">
                      <img src={p.mainImage} alt={p.name} className="w-12 h-14 object-cover bg-brand-cream" />
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-medium line-clamp-1">{p.name}</p>
                      <p className="text-xs font-mono text-brand-mid">{p.id.substring(0, 8)}</p>
                    </td>
                    <td className="py-3 pr-4 text-brand-mid">{p.categoryName}</td>
                    <td className="py-3 pr-4">
                      <p>{formatPrice(p.salePrice ?? p.basePrice)}</p>
                      {p.salePrice && <p className="text-xs text-brand-mid line-through">{formatPrice(p.basePrice)}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      <Badge variant={p.inStock ? 'success' : 'error'}>{p.inStock ? 'Còn hàng' : 'Hết hàng'}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setVariantProduct(p)} className="text-xs uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors">Variants</button>
                        <button onClick={() => setEditProduct(p)} className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                        <button onClick={() => { if (confirm(`Xóa "${p.name}"?`)) deleteMutation.mutate(p.id) }} className="text-xs text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button disabled={data.first} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">← Trước</button>
              <span className="text-xs text-brand-mid">{data.number + 1} / {data.totalPages}</span>
              <button disabled={data.last} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">Sau →</button>
            </div>
          )}
        </>
      )}

      <CreateProductModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={() => { invalidate(); setCreateOpen(false) }}
      />
      {editProduct && (
        <EditProductModal
          productId={editProduct.id}
          open={!!editProduct}
          onClose={() => setEditProduct(null)}
          onUpdated={() => { invalidate(); setEditProduct(null) }}
        />
      )}
      {variantProduct && (
        <VariantManagerModal
          product={variantProduct}
          open={!!variantProduct}
          onClose={() => setVariantProduct(null)}
        />
      )}
    </div>
  )
}

function CreateProductModal({
  open, onClose, onCreated,
}: {
  open: boolean; onClose: () => void; onCreated: () => void
}) {
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const [form, setForm] = useState<ProductCreateRequest>({
    name: '', slug: '', description: '', basePrice: 0,
    salePrice: null, mainImage: '', hoverImage: '', categoryId: 0,
  })

  const mutation = useMutation({
    mutationFn: () => adminCreateProduct(form),
    onSuccess:  () => { toast('Đã tạo sản phẩm'); onCreated() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Tạo thất bại',
      'error',
    ),
  })

  const catOptions = [
    { value: '0', label: 'Chọn danh mục...' },
    ...(cats ?? []).flatMap((c) => [
      { value: String(c.categoryId), label: c.categoryName },
      ...(c.childCategories ?? []).map((ch) => ({ value: String(ch.categoryId), label: `  └ ${ch.categoryName}` })),
    ]),
  ]

  const handleNameChange = (name: string) => {
    const slug = name.toLowerCase().normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
      .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
    setForm((f) => ({ ...f, name, slug }))
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm sản phẩm mới" className="max-w-2xl mx-4 p-8">
      <div className="max-h-[75vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Tên sản phẩm" value={form.name} onChange={(e) => handleNameChange(e.target.value)} />
          </div>
          <Input label="Slug (URL)" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} />
          <Select label="Danh mục" options={catOptions} value={String(form.categoryId)} onChange={(e) => setForm((f) => ({ ...f, categoryId: Number(e.target.value) }))} />
          <Input label="Giá gốc (VNĐ)" type="number" value={String(form.basePrice)} onChange={(e) => setForm((f) => ({ ...f, basePrice: Number(e.target.value) }))} />
          <Input label="Giá khuyến mãi" type="number" value={form.salePrice ? String(form.salePrice) : ''} placeholder="Để trống nếu không có" onChange={(e) => setForm((f) => ({ ...f, salePrice: e.target.value ? Number(e.target.value) : null }))} />
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <ImageUploader label="Ảnh chính" value={form.mainImage || null} onChange={(url) => setForm((f) => ({ ...f, mainImage: url }))} folder="products" />
            <ImageUploader label="Ảnh hover" value={form.hoverImage || null} onChange={(url) => setForm((f) => ({ ...f, hoverImage: url }))} folder="products" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">Mô tả</label>
            <textarea rows={4} value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none" />
          </div>
        </div>
      </div>
      <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button loading={mutation.isPending} disabled={!form.name || !form.mainImage || !form.categoryId} onClick={() => mutation.mutate()}>
          Tạo sản phẩm
        </Button>
      </div>
    </Modal>
  )
}

function EditProductModal({
  productId, open, onClose, onUpdated,
}: {
  productId: string; open: boolean; onClose: () => void; onUpdated: () => void
}) {
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })
  const { data: product, isLoading } = useQuery<ProductDetailDto>({
    queryKey: ['product-detail', productId],
    queryFn:  () => import('@features/catalog/api/catalogApi').then((m) => m.fetchProductById(productId)),
    enabled:  open,
  })

  // fix: type explicit thay vì dùng typeof import(...)
  const [form, setForm] = useState<ProductUpdateRequest | null>(null)

  if (product && !form) {
    setForm({
      name:        product.name,
      slug:        product.slug,
      description: product.description ?? '',
      basePrice:   product.basePrice,
      salePrice:   product.salePrice ?? null,
      mainImage:   product.mainImage,
      hoverImage:  product.hoverImage ?? '',
      categoryId:  product.category.id,
      active:      product.active,
    })
  }

  const mutation = useMutation({
    mutationFn: () => adminUpdateProduct(productId, form!),
    onSuccess:  () => { toast('Đã cập nhật sản phẩm'); onUpdated() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Cập nhật thất bại',
      'error',
    ),
  })

  const catOptions = [
    { value: '0', label: 'Chọn danh mục...' },
    ...(cats ?? []).flatMap((c) => [
      { value: String(c.categoryId), label: c.categoryName },
      ...(c.childCategories ?? []).map((ch) => ({ value: String(ch.categoryId), label: `  └ ${ch.categoryName}` })),
    ]),
  ]

  return (
    <Modal open={open} onClose={() => { setForm(null); onClose() }} title="Chỉnh sửa sản phẩm" className="max-w-2xl mx-4 p-8">
      {isLoading || !form ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : (
        <>
          <div className="max-h-[70vh] overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                {/* fix: explicit typed setter — no implicit any */}
                <Input label="Tên sản phẩm" value={form.name}
                  onChange={(e) => setForm((prev): ProductUpdateRequest | null =>
                    prev ? { ...prev, name: e.target.value } : null)} />
              </div>
              <Input label="Slug (URL)" value={form.slug}
                onChange={(e) => setForm((prev): ProductUpdateRequest | null =>
                  prev ? { ...prev, slug: e.target.value } : null)} />
              <Select label="Danh mục" options={catOptions} value={String(form.categoryId)}
                onChange={(e) => setForm((prev): ProductUpdateRequest | null =>
                  prev ? { ...prev, categoryId: Number(e.target.value) } : null)} />
              <Input label="Giá gốc (VNĐ)" type="number" value={String(form.basePrice)}
                onChange={(e) => setForm((prev): ProductUpdateRequest | null =>
                  prev ? { ...prev, basePrice: Number(e.target.value) } : null)} />
              <Input label="Giá khuyến mãi" type="number"
                value={form.salePrice ? String(form.salePrice) : ''}
                placeholder="Để trống nếu không có"
                onChange={(e) => setForm((prev): ProductUpdateRequest | null =>
                  prev ? { ...prev, salePrice: e.target.value ? Number(e.target.value) : null } : null)} />
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <ImageUploader label="Ảnh chính" value={form.mainImage || null}
                  onChange={(url) => setForm((prev): ProductUpdateRequest | null =>
                    prev ? { ...prev, mainImage: url } : null)}
                  folder="products" />
                <ImageUploader label="Ảnh hover" value={form.hoverImage || null}
                  onChange={(url) => setForm((prev): ProductUpdateRequest | null =>
                    prev ? { ...prev, hoverImage: url } : null)}
                  folder="products" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">Mô tả</label>
                <textarea rows={4} value={form.description ?? ''}
                  onChange={(e) => setForm((prev): ProductUpdateRequest | null =>
                    prev ? { ...prev, description: e.target.value } : null)}
                  className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="active-toggle" checked={form.active ?? true}
                  onChange={(e) => setForm((prev): ProductUpdateRequest | null =>
                    prev ? { ...prev, active: e.target.checked } : null)}
                  className="w-4 h-4 accent-brand-gold" />
                <label htmlFor="active-toggle" className="text-sm">Sản phẩm đang hoạt động</label>
              </div>
            </div>
          </div>
          <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
            <Button variant="ghost" onClick={() => { setForm(null); onClose() }}>Hủy</Button>
            <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>Lưu thay đổi</Button>
          </div>
        </>
      )}
    </Modal>
  )
}

function VariantManagerModal({
  product, open, onClose,
}: {
  product: ProductListDto; open: boolean; onClose: () => void
}) {
  const [addOpen, setAddOpen]         = useState(false)
  const [editVariant, setEditVariant] = useState<VariantFullDto | null>(null)
  const queryClient = useQueryClient()

  const { data: variants, isLoading } = useQuery({
    queryKey: ['admin', 'variants', product.id],
    queryFn:  () => fetchVariants(product.id),
    enabled:  open,
  })

  const deleteMutation = useMutation({
    mutationFn: ({ variantId }: { variantId: string }) => adminDeleteVariant(product.id, variantId),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'variants', product.id] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      toast('Đã xóa variant')
    },
    onError: () => toast('Xóa thất bại', 'error'),
  })

  const invalidateVariants = () => {
    queryClient.invalidateQueries({ queryKey: ['admin', 'variants', product.id] })
    queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
  }

  return (
    <Modal open={open} onClose={onClose} title={`Variants — ${product.name}`} className="max-w-3xl mx-4 p-8">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-brand-mid">{variants?.length ?? 0} biến thể</p>
          <Button size="sm" onClick={() => setAddOpen(true)}>+ Thêm variant</Button>
        </div>
        {isLoading ? (
          <div className="flex justify-center py-10"><Spinner /></div>
        ) : !variants?.length ? (
          <EmptyState icon="🎨" title="Chưa có variant nào" description="Thêm variant để khách hàng chọn màu và size" />
        ) : (
          <div className="overflow-x-auto max-h-[50vh] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white z-10">
                <tr className="border-b border-brand-light">
                  {['SKU', 'Màu', 'Size', 'Ảnh', 'Số lượng', 'Trạng thái', ''].map((h) => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/50">
                {variants.map((v) => (
                  <tr key={v.id} className="hover:bg-brand-cream/30 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs">{v.sku}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full border border-brand-light flex-shrink-0" style={{ backgroundColor: v.colorCode }} />
                        <span className="text-xs">{v.colorName}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="inline-flex items-center justify-center w-8 h-8 border border-brand-mid text-xs font-medium">{v.sizeCode}</span>
                    </td>
                    <td className="py-3 pr-4">
                      {v.imageUrl
                        ? <img src={v.imageUrl} alt="" className="w-10 h-12 object-cover border border-brand-light" />
                        : <span className="text-xs text-brand-light">—</span>}
                    </td>
                    <td className="py-3 pr-4 font-medium">{v.quantity}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={v.inStock ? 'success' : 'error'}>{v.inStock ? 'Còn' : 'Hết'}</Badge>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3">
                        <button onClick={() => setEditVariant(v)} className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                        <button onClick={() => { if (confirm(`Xóa variant ${v.sku}?`)) deleteMutation.mutate({ variantId: v.id }) }} className="text-xs text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <AddVariantModal productId={product.id} open={addOpen} onClose={() => setAddOpen(false)} onCreated={() => { invalidateVariants(); setAddOpen(false) }} />
      {editVariant && <EditVariantModal productId={product.id} variant={editVariant} open={!!editVariant} onClose={() => setEditVariant(null)} onUpdated={() => { invalidateVariants(); setEditVariant(null) }} />}
    </Modal>
  )
}

function AddVariantModal({
  productId, open, onClose, onCreated,
}: {
  productId: string; open: boolean; onClose: () => void; onCreated: () => void
}) {
  const { data: colors } = useQuery({ queryKey: ['colors', 'all'], queryFn: fetchAllColors })
  const { data: sizes }  = useQuery({ queryKey: ['sizes', 'all'],  queryFn: fetchAllSizes })
  const [form, setForm]  = useState<VariantCreateRequest & { sku: string }>({
    sku: '', colorId: 0, sizeId: 0, quantity: 0, imageUrl: '',
  })

  const mutation = useMutation({
    mutationFn: () => adminCreateVariant(productId, form),
    onSuccess:  () => { toast('Đã thêm variant'); onCreated() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Tạo thất bại',
      'error',
    ),
  })

  const activeColors = (colors ?? []).filter((c) => c.active)
  const activeSizes  = (sizes ?? []).filter((s) => s.active).sort((a, b) => a.sortOrder - b.sortOrder)
  const colorOptions = [{ value: '0', label: 'Chọn màu...' }, ...activeColors.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))]
  const sizeOptions  = [{ value: '0', label: 'Chọn size...' }, ...activeSizes.map((s) => ({ value: String(s.id), label: s.code }))]

  const autoSku = () => {
    const color = activeColors.find((c) => c.id === form.colorId)
    const size  = activeSizes.find((s) => s.id === form.sizeId)
    if (color && size) {
      const prefix    = productId.substring(0, 6).toUpperCase()
      const colorCode = (color.nameEn ?? color.name).substring(0, 3).toUpperCase().replace(/\s/g, '')
      setForm((f) => ({ ...f, sku: `${prefix}-${colorCode}-${size.code}` }))
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Thêm variant mới" className="max-w-lg mx-4 p-8">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Màu sắc *" options={colorOptions} value={String(form.colorId)} onChange={(e) => setForm((f) => ({ ...f, colorId: Number(e.target.value) }))} />
          <Select label="Kích cỡ *"  options={sizeOptions}  value={String(form.sizeId)}  onChange={(e) => setForm((f) => ({ ...f, sizeId:  Number(e.target.value) }))} />
        </div>
        <div className="flex gap-2 items-end">
          <Input label="SKU *" value={form.sku} className="flex-1" onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value.toUpperCase() }))} />
          <button type="button" onClick={autoSku} disabled={!form.colorId || !form.sizeId} className="h-10 px-3 text-[10px] uppercase tracking-wider border border-brand-light hover:border-brand-black disabled:opacity-40 transition-colors whitespace-nowrap mb-0">Tự tạo</button>
        </div>
        <Input label="Số lượng *" type="number" min="0" value={String(form.quantity)} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
        <ImageUploader label="Ảnh variant (tuỳ chọn)" value={form.imageUrl || null} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} folder="variants" variant="inline" />
      </div>
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button loading={mutation.isPending} disabled={!form.sku || !form.colorId || !form.sizeId} onClick={() => mutation.mutate()}>Tạo variant</Button>
      </div>
    </Modal>
  )
}

function EditVariantModal({
  productId, variant, open, onClose, onUpdated,
}: {
  productId: string; variant: VariantFullDto; open: boolean; onClose: () => void; onUpdated: () => void
}) {
  const { data: colors } = useQuery({ queryKey: ['colors', 'all'], queryFn: fetchAllColors })
  const { data: sizes }  = useQuery({ queryKey: ['sizes', 'all'],  queryFn: fetchAllSizes })
  const [form, setForm]  = useState<VariantUpdateRequest>({
    colorId: variant.colorId, sizeId: variant.sizeId,
    quantity: variant.quantity, imageUrl: variant.imageUrl ?? '',
  })

  const mutation = useMutation({
    mutationFn: () => adminUpdateVariant(productId, variant.id, form),
    onSuccess:  () => { toast('Đã cập nhật variant'); onUpdated() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Cập nhật thất bại',
      'error',
    ),
  })

  const activeColors = (colors ?? []).filter((c) => c.active)
  const activeSizes  = (sizes ?? []).filter((s) => s.active).sort((a, b) => a.sortOrder - b.sortOrder)
  const colorOptions = activeColors.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))
  const sizeOptions  = activeSizes.map((s) => ({ value: String(s.id), label: s.code }))

  return (
    <Modal open={open} onClose={onClose} title={`Sửa variant — ${variant.sku}`} className="max-w-lg mx-4 p-8">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Màu sắc *" options={colorOptions} value={String(form.colorId)} onChange={(e) => setForm((f) => ({ ...f, colorId: Number(e.target.value) }))} />
          <Select label="Kích cỡ *"  options={sizeOptions}  value={String(form.sizeId)}  onChange={(e) => setForm((f) => ({ ...f, sizeId:  Number(e.target.value) }))} />
        </div>
        <Input label="Số lượng *" type="number" min="0" value={String(form.quantity)} onChange={(e) => setForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
        <ImageUploader label="Ảnh variant (tuỳ chọn)" value={form.imageUrl || null} onChange={(url) => setForm((f) => ({ ...f, imageUrl: url }))} folder="variants" variant="inline" />
      </div>
      <div className="flex gap-3 mt-6 justify-end">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button loading={mutation.isPending} onClick={() => mutation.mutate()}>Lưu thay đổi</Button>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── Orders tab ────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminOrders() {
  const [page, setPage]     = useState(0)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page, status, search],
    queryFn:  () => fetchAllOrdersAdmin({ page, size: 15, status: status || undefined, search: search || undefined }),
  })

  const statusMutation = useMutation({
    mutationFn: ({ id, s }: { id: string; s: OrderStatus }) => updateOrderStatusApi(id, s),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }); toast('Đã cập nhật') },
    onError:    () => toast('Cập nhật thất bại', 'error'),
  })

  const statusOptions = [
    { value: '', label: 'Tất cả trạng thái' },
    ...(['PENDING','CONFIRMED','SHIPPING','DELIVERED','COMPLETED','CANCELLED','REFUNDED'] as OrderStatus[])
      .map((s) => ({ value: s, label: ORDER_STATUS_LABEL[s] })),
  ]
  const nextStatus: Partial<Record<OrderStatus, OrderStatus>> = {
    PENDING: 'CONFIRMED', CONFIRMED: 'SHIPPING', SHIPPING: 'DELIVERED', DELIVERED: 'COMPLETED',
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 flex-wrap">
        <Input placeholder="Tìm theo SĐT, mã đơn..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="max-w-xs" />
        <Select options={statusOptions} value={status} onChange={(e) => { setStatus(e.target.value); setPage(0) }} className="max-w-[200px]" />
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.content.length ? (
        <EmptyState icon="📋" title="Không có đơn hàng nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {['Mã đơn', 'Khách hàng', 'Ngày', 'Tổng', 'Trạng thái', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/50">
                {data.content.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-cream/50 transition-colors">
                    <td className="py-3 pr-4"><p className="font-mono text-xs">#{order.id.substring(0, 8).toUpperCase()}</p></td>
                    <td className="py-3 pr-4">
                      <p className="font-medium">{order.user.name}</p>
                      <p className="text-xs text-brand-mid">{order.user.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-brand-mid text-xs">{formatDate(order.orderTime)}</td>
                    <td className="py-3 pr-4 font-medium">{formatPrice(order.totalAmount)}</td>
                    <td className="py-3 pr-4">
                      <Badge variant={ORDER_STATUS_VARIANT[order.status]}>{ORDER_STATUS_LABEL[order.status]}</Badge>
                    </td>
                    <td className="py-3">
                      {nextStatus[order.status] && (
                        <button
                          onClick={() => statusMutation.mutate({ id: order.id, s: nextStatus[order.status]! })}
                          className="text-xs uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors"
                        >
                          → {ORDER_STATUS_LABEL[nextStatus[order.status]!]}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button disabled={data.first} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">← Trước</button>
              <span className="text-xs text-brand-mid">{data.number + 1} / {data.totalPages}</span>
              <button disabled={data.last} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">Sau →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── Vouchers tab ──────────════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════

const VOUCHER_TYPE_LABEL: Record<string, string> = {
  PERCENTAGE:   'Giảm %',
  FIXED_AMOUNT: 'Giảm tiền',
  FREE_SHIPPING:'Miễn ship',
}

function AdminVouchers() {
  const [createOpen, setCreateOpen]   = useState(false)
  const [editVoucher, setEditVoucher] = useState<VoucherDto | null>(null)
  const queryClient = useQueryClient()

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['admin', 'vouchers'],
    queryFn:  adminFetchVouchers,
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteVoucher,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }); toast('Đã xóa voucher') },
    onError:    () => toast('Xóa thất bại', 'error'),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-brand-mid">{vouchers?.length ?? 0} voucher</p>
        <Button onClick={() => setCreateOpen(true)}>+ Tạo voucher</Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !vouchers?.length ? (
        <EmptyState icon="🎫" title="Chưa có voucher nào" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-light">
                {['Mã', 'Loại', 'Giá trị', 'Đơn tối thiểu', 'Đã dùng', 'Hạn dùng', 'Trạng thái', ''].map((h) => (
                  <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-light/50">
              {vouchers.map((v) => (
                <tr key={v.id} className="hover:bg-brand-cream/50 transition-colors">
                  <td className="py-3 pr-4 font-mono font-medium">{v.code}</td>
                  <td className="py-3 pr-4 text-brand-mid">{VOUCHER_TYPE_LABEL[v.type]}</td>
                  <td className="py-3 pr-4">
                    {v.type === 'PERCENTAGE' ? `${v.value}%` : v.type === 'FIXED_AMOUNT' ? formatPrice(v.value) : 'Miễn phí ship'}
                    {v.maxDiscount != null && <span className="text-xs text-brand-mid block">Tối đa {formatPrice(v.maxDiscount)}</span>}
                  </td>
                  <td className="py-3 pr-4">{formatPrice(v.minOrderAmount)}</td>
                  <td className="py-3 pr-4">{v.usedCount}{v.usageLimit ? ` / ${v.usageLimit}` : ''}</td>
                  <td className="py-3 pr-4 text-xs text-brand-mid">
                    {v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '—'}
                  </td>
                  <td className="py-3 pr-4">
                    <Badge variant={v.active ? 'success' : 'error'}>{v.active ? 'Đang hoạt động' : 'Đã tắt'}</Badge>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => setEditVoucher(v)} className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                      <button onClick={() => { if (confirm(`Xóa voucher "${v.code}"?`)) deleteMutation.mutate(v.id) }} className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VoucherFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => { invalidate(); setCreateOpen(false) }} />
      {editVoucher && (
        <VoucherFormModal
          open={!!editVoucher}
          voucher={editVoucher}
          onClose={() => setEditVoucher(null)}
          onSaved={() => { invalidate(); setEditVoucher(null) }}
        />
      )}
    </div>
  )
}

function VoucherFormModal({
  open, voucher, onClose, onSaved,
}: {
  open: boolean; voucher?: VoucherDto; onClose: () => void; onSaved: () => void
}) {
  const isEdit = !!voucher
  const [form, setForm] = useState<VoucherRequest>({
    code:           voucher?.code           ?? '',
    description:    voucher?.description    ?? '',
    type:           (voucher?.type          ?? 'PERCENTAGE') as VoucherRequest['type'],
    value:          voucher?.value          ?? 10,
    minOrderAmount: voucher?.minOrderAmount ?? 0,
    maxDiscount:    voucher?.maxDiscount    ?? undefined,
    usageLimit:     voucher?.usageLimit     ?? undefined,
    startDate:      voucher?.startDate      ?? undefined,
    endDate:        voucher?.endDate        ?? undefined,
    active:         voucher?.active         ?? true,
  })

  const mutation = useMutation({
    mutationFn: () => isEdit ? adminUpdateVoucher(voucher!.id, form) : adminCreateVoucher(form),
    onSuccess:  () => { toast(isEdit ? 'Đã cập nhật voucher' : 'Đã tạo voucher'); onSaved() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Thất bại',
      'error',
    ),
  })

  const typeOptions = [
    { value: 'PERCENTAGE',    label: 'Giảm theo % (phần trăm)' },
    { value: 'FIXED_AMOUNT',  label: 'Giảm số tiền cố định' },
    { value: 'FREE_SHIPPING', label: 'Miễn phí vận chuyển' },
  ]

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? `Sửa voucher — ${voucher?.code}` : 'Tạo voucher mới'} className="max-w-lg mx-4 p-8">
      <div className="flex flex-col gap-4 max-h-[70vh] overflow-y-auto pr-1">
        <Input label="Mã voucher *" value={form.code} placeholder="VD: SUMMER20" onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
        <Input label="Mô tả" value={form.description ?? ''} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
        <Select label="Loại voucher *" options={typeOptions} value={String(form.type)} onChange={(e) => setForm((f) => ({ ...f, type: e.target.value as VoucherRequest['type'] }))} />

        {form.type !== 'FREE_SHIPPING' && (
          <Input
            label={form.type === 'PERCENTAGE' ? 'Giá trị (%) *' : 'Số tiền giảm (VNĐ) *'}
            type="number"
            value={String(form.value)}
            onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))}
          />
        )}

        {form.type === 'PERCENTAGE' && (
          <Input
            label="Giảm tối đa (VNĐ, để trống = không giới hạn)"
            type="number"
            value={form.maxDiscount != null ? String(form.maxDiscount) : ''}
            onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))}
          />
        )}

        <Input label="Đơn hàng tối thiểu (VNĐ)" type="number" value={String(form.minOrderAmount ?? 0)} onChange={(e) => setForm((f) => ({ ...f, minOrderAmount: Number(e.target.value) }))} />
        <Input label="Số lần dùng tối đa (để trống = không giới hạn)" type="number" value={form.usageLimit != null ? String(form.usageLimit) : ''} onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value ? Number(e.target.value) : undefined }))} />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">Ngày bắt đầu</label>
            <input type="datetime-local" value={form.startDate ? String(form.startDate).substring(0, 16) : ''} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value || undefined }))} className="w-full border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">Ngày hết hạn</label>
            <input type="datetime-local" value={form.endDate ? String(form.endDate).substring(0, 16) : ''} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value || undefined }))} className="w-full border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black transition-colors" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input type="checkbox" id="voucher-active" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} className="w-4 h-4 accent-brand-gold" />
          <label htmlFor="voucher-active" className="text-sm">Đang hoạt động</label>
        </div>
      </div>
      <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button loading={mutation.isPending} disabled={!form.code} onClick={() => mutation.mutate()}>
          {isEdit ? 'Lưu thay đổi' : 'Tạo voucher'}
        </Button>
      </div>
    </Modal>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── Reviews tab ───────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminReviews() {
  const [page, setPage]         = useState(0)
  const [approved, setApproved] = useState('')
  const queryClient = useQueryClient()

  const approvedParam = approved === '' ? undefined : approved === 'true'

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', page, approved],
    queryFn:  () => adminFetchReviews({ page, size: 20, approved: approvedParam }),
  })

  const approveMutation = useMutation({
    mutationFn: adminApproveReview,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast('Đã duyệt review') },
    onError:    () => toast('Thất bại', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteReviewApi,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] }); toast('Đã xóa') },
    onError:    () => toast('Xóa thất bại', 'error'),
  })

  const filterOptions = [
    { value: '',      label: 'Tất cả' },
    { value: 'false', label: 'Chờ duyệt' },
    { value: 'true',  label: 'Đã duyệt' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Select options={filterOptions} value={approved} onChange={(e) => { setApproved(e.target.value); setPage(0) }} className="max-w-[200px]" />
        {data && <p className="text-xs text-brand-mid">Tổng: {data.totalElements} review</p>}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.content.length ? (
        <EmptyState icon="💬" title="Không có review nào" />
      ) : (
        <>
          <div className="flex flex-col gap-4">
            {data.content.map((r) => (
              <div key={r.id} className="p-4 border border-brand-light">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium">{r.userName}</span>
                      <span className="text-xs text-brand-mid">{formatDate(r.createdAt)}</span>
                      <div className="flex gap-0.5">
                        {[1,2,3,4,5].map((s) => (
                          <svg key={s} className={cn('w-3 h-3', s <= r.rating ? 'text-brand-gold' : 'text-brand-light')} viewBox="0 0 20 20" fill="currentColor">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <Badge variant={r.approved ? 'success' : 'warning'}>{r.approved ? 'Đã duyệt' : 'Chờ duyệt'}</Badge>
                    </div>
                    {r.comment && <p className="text-sm text-brand-charcoal">{r.comment}</p>}
                    {r.orderId && <p className="text-xs text-brand-mid mt-1">Đơn: #{r.orderId.substring(0, 8).toUpperCase()}</p>}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {!r.approved && (
                      <button onClick={() => approveMutation.mutate(r.id)} className="text-xs uppercase tracking-wider text-green-600 hover:text-green-800 transition-colors">Duyệt</button>
                    )}
                    <button onClick={() => { if (confirm('Xóa review này?')) deleteMutation.mutate(r.id) }} className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors">Xóa</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button disabled={data.first} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">← Trước</button>
              <span className="text-xs text-brand-mid">{data.number + 1} / {data.totalPages}</span>
              <button disabled={data.last} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">Sau →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
// ── Categories / Colors / Sizes / Users ──────────────────────────
// ══════════════════════════════════════════════════════════════════

function AdminCategories() {
  const queryClient = useQueryClient()
  const [newName, setNewName]     = useState('')
  const [newParent, setNewParent] = useState('')

  // State cho modal sửa
  const [editingCat, setEditingCat] = useState<{
    id: number
    name: string
    parentCategoryId: number | null
  } | null>(null)

  const { data: categories, isLoading } = useQuery({ queryKey: ['categories'], queryFn: fetchCategories })

  const createMutation = useMutation({
    mutationFn: () => adminCreateCategory({ categoryName: newName, parentCategory: newParent ? { categoryId: Number(newParent) } : null }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast('Đã tạo danh mục'); setNewName(''); setNewParent('') },
    onError: () => toast('Tạo thất bại', 'error'),
  })
  const updateMutation = useMutation({
    mutationFn: ({ id, name, parentCategoryId }: { id: number; name: string; parentCategoryId: number | null }) =>
      adminUpdateCategory(id, { categoryName: name, parentCategoryId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast('Đã cập nhật'); setEditingCat(null) },
    onError: (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Cập nhật thất bại',
      'error',
    ),
  })
  const deleteMutation = useMutation({
    mutationFn: adminDeleteCategory,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['categories'] }); toast('Đã xóa') },
    onError: () => toast('Xóa thất bại', 'error'),
  })

  // Danh sách options cho dropdown danh mục cha (khi TẠO MỚI)
  const rootCatOptions = [
    { value: '', label: 'Không có (danh mục gốc)' },
    ...(categories ?? []).map((c) => ({ value: String(c.categoryId), label: c.categoryName })),
  ]

  // Danh sách options cho dropdown danh mục cha (khi SỬA) — loại bỏ chính nó và con của nó
  const editParentOptions = editingCat
    ? [
        { value: '', label: 'Không có (danh mục gốc)' },
        ...(categories ?? [])
          .filter((c) => c.categoryId !== editingCat.id)
          .map((c) => ({ value: String(c.categoryId), label: c.categoryName })),
      ]
    : []

  const openEdit = (id: number, name: string, parentCategoryId: number | null) => {
    setEditingCat({ id, name, parentCategoryId })
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Form tạo mới */}
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm danh mục mới</h2>
        <Input label="Tên danh mục" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Áo thun, Quần jeans..." />
        <Select label="Danh mục cha (tuỳ chọn)" options={rootCatOptions} value={newParent} onChange={(e) => setNewParent(e.target.value)} />
        <Button loading={createMutation.isPending} disabled={!newName.trim()} onClick={() => createMutation.mutate()} className="self-start">Tạo danh mục</Button>
      </div>

      {/* Danh sách */}
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">Danh sách danh mục</h2>
        {isLoading ? <Spinner /> : (
          <ul className="flex flex-col gap-2">
            {(categories ?? []).map((cat) => (
              <li key={cat.categoryId}>
                {/* Danh mục cha */}
                <div className="flex items-center justify-between py-3 px-4 border border-brand-light hover:border-brand-mid transition-colors">
                  <div>
                    <p className="font-medium">{cat.categoryName}</p>
                    {cat.childCategories?.length > 0 && (
                      <p className="text-xs text-brand-mid">{cat.childCategories.length} danh mục con</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => openEdit(cat.categoryId, cat.categoryName, null)}
                      className="text-xs text-brand-mid hover:text-brand-black uppercase tracking-wider transition-colors"
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => { if (confirm(`Xóa danh mục "${cat.categoryName}"?`)) deleteMutation.mutate(cat.categoryId) }}
                      className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                    >
                      Xóa
                    </button>
                  </div>
                </div>

                {/* Danh mục con */}
                {cat.childCategories?.map((child) => (
                  <div key={child.categoryId} className="flex items-center justify-between py-2 px-4 ml-6 border-l border-brand-light hover:bg-brand-cream/50 transition-colors">
                    <p className="text-sm text-brand-charcoal">└ {child.categoryName}</p>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => openEdit(child.categoryId, child.categoryName, cat.categoryId)}
                        className="text-xs text-brand-mid hover:text-brand-black uppercase tracking-wider transition-colors"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => { if (confirm(`Xóa danh mục "${child.categoryName}"?`)) deleteMutation.mutate(child.categoryId) }}
                        className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                      >
                        Xóa
                      </button>
                    </div>
                  </div>
                ))}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Modal sửa danh mục */}
      {editingCat && (
        <Modal
          open={!!editingCat}
          onClose={() => setEditingCat(null)}
          title="Sửa danh mục"
          className="max-w-md mx-4 p-8"
        >
          <div className="flex flex-col gap-4">
            <Input
              label="Tên danh mục *"
              value={editingCat.name}
              onChange={(e) => setEditingCat((prev) => prev && { ...prev, name: e.target.value })}
            />
            <Select
              label="Danh mục cha"
              options={editParentOptions}
              value={editingCat.parentCategoryId != null ? String(editingCat.parentCategoryId) : ''}
              onChange={(e) => setEditingCat((prev) => prev && {
                ...prev,
                parentCategoryId: e.target.value ? Number(e.target.value) : null,
              })}
            />
            <p className="text-xs text-brand-mid">
              Chọn "Không có" để đặt làm danh mục gốc, hoặc chọn danh mục cha để đặt làm danh mục con.
            </p>
          </div>
          <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
            <Button variant="ghost" onClick={() => setEditingCat(null)}>Hủy</Button>
            <Button
              loading={updateMutation.isPending}
              disabled={!editingCat.name.trim()}
              onClick={() => updateMutation.mutate({
                id: editingCat.id,
                name: editingCat.name,
                parentCategoryId: editingCat.parentCategoryId,
              })}
            >
              Lưu thay đổi
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}

function AdminColors() {
  const queryClient = useQueryClient()
  const [form, setForm]         = useState({ code: '', name: '', nameEn: '' })
  const [editColor, setEditColor] = useState<ColorDto | null>(null)

  const { data: colors, isLoading } = useQuery({ queryKey: ['admin', 'colors'], queryFn: fetchAllColors })

  const createMutation = useMutation({
    mutationFn: () => adminCreateColor({ code: form.code, name: form.name, nameEn: form.nameEn || undefined }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã tạo màu'); setForm({ code: '', name: '', nameEn: '' }) },
    onError: () => toast('Tạo thất bại', 'error'),
  })
  const updateMutation = useMutation({
    mutationFn: (c: ColorDto) => adminUpdateColor(c.id, { code: c.code, name: c.name, nameEn: c.nameEn ?? '', active: c.active }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã cập nhật màu'); setEditColor(null) },
    onError: () => toast('Cập nhật thất bại', 'error'),
  })
  const deleteMutation = useMutation({
    mutationFn: adminDeleteColor,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã vô hiệu hoá màu') },
    onError: () => toast('Thất bại', 'error'),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm màu sắc mới</h2>
        <div className="flex items-end gap-3">
          <Input label="Mã màu hex" value={form.code} placeholder="#FF0000" onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          {form.code && /^#[0-9A-Fa-f]{3,6}$/.test(form.code) && (
            <div className="w-10 h-10 rounded border border-brand-light mb-0.5 flex-shrink-0" style={{ backgroundColor: form.code }} />
          )}
        </div>
        <Input label="Tên màu (tiếng Việt)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Tên màu (tiếng Anh, tuỳ chọn)" value={form.nameEn} onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))} />
        <Button loading={createMutation.isPending} disabled={!form.code || !form.name} onClick={() => createMutation.mutate()} className="self-start">Tạo màu</Button>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">Danh sách màu</h2>
        {isLoading ? <Spinner /> : (
          <ul className="flex flex-col gap-2">
            {(colors ?? []).map((color) => (
              <li key={color.id} className="flex items-center justify-between py-3 px-4 border border-brand-light">
                {editColor?.id === color.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <input type="color" value={editColor.code} onChange={(e) => setEditColor((c) => c && { ...c, code: e.target.value })} className="w-8 h-8 rounded border cursor-pointer" />
                    <input value={editColor.name} onChange={(e) => setEditColor((c) => c && { ...c, name: e.target.value })} className="flex-1 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black" placeholder="Tên màu" />
                    <button onClick={() => updateMutation.mutate(editColor!)} className="text-xs text-brand-gold uppercase tracking-wider hover:text-brand-black">Lưu</button>
                    <button onClick={() => setEditColor(null)} className="text-xs text-brand-mid uppercase tracking-wider hover:text-brand-black">Hủy</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full border border-brand-light" style={{ backgroundColor: color.code }} />
                    <div>
                      <p className="font-medium text-sm">{color.name}{color.nameEn && <span className="text-brand-mid"> ({color.nameEn})</span>}</p>
                      <p className="text-xs font-mono text-brand-mid">{color.code}</p>
                    </div>
                    {!color.active && <Badge variant="error">Inactive</Badge>}
                  </div>
                )}
                {editColor?.id !== color.id && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setEditColor(color)} className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                    {color.active && <button onClick={() => { if (confirm(`Vô hiệu hoá màu "${color.name}"?`)) deleteMutation.mutate(color.id) }} className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors">Xóa</button>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function AdminSizes() {
  const queryClient = useQueryClient()
  const [form, setForm]       = useState({ code: '', name: '', sortOrder: '0' })
  const [editSize, setEditSize] = useState<SizeDto | null>(null)

  const { data: sizes, isLoading } = useQuery({ queryKey: ['admin', 'sizes'], queryFn: fetchAllSizes })

  const createMutation = useMutation({
    mutationFn: () => adminCreateSize({ code: form.code, name: form.name, sortOrder: Number(form.sortOrder) }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] }); toast('Đã tạo size'); setForm({ code: '', name: '', sortOrder: '0' }) },
    onError: () => toast('Tạo thất bại', 'error'),
  })
  const updateMutation = useMutation({
    mutationFn: (s: SizeDto) => adminUpdateSize(s.id, { code: s.code, name: s.name, sortOrder: s.sortOrder, active: s.active }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] }); toast('Đã cập nhật size'); setEditSize(null) },
    onError: () => toast('Cập nhật thất bại', 'error'),
  })
  const deleteMutation = useMutation({
    mutationFn: adminDeleteSize,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] }); toast('Đã vô hiệu hoá size') },
    onError: () => toast('Thất bại', 'error'),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm kích cỡ mới</h2>
        <Input label="Mã size (VD: S, M, L, XL)" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))} />
        <Input label="Tên size" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Thứ tự hiển thị" type="number" value={form.sortOrder} onChange={(e) => setForm((f) => ({ ...f, sortOrder: e.target.value }))} />
        <Button loading={createMutation.isPending} disabled={!form.code || !form.name} onClick={() => createMutation.mutate()} className="self-start">Tạo size</Button>
      </div>
      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">Danh sách kích cỡ</h2>
        {isLoading ? <Spinner /> : (
          <ul className="flex flex-col gap-2">
            {(sizes ?? []).sort((a, b) => a.sortOrder - b.sortOrder).map((size) => (
              <li key={size.id} className="flex items-center justify-between py-3 px-4 border border-brand-light">
                {editSize?.id === size.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <span className="w-10 h-10 border border-brand-mid flex items-center justify-center text-xs font-bold flex-shrink-0">{editSize.code}</span>
                    <input value={editSize.name} onChange={(e) => setEditSize((s) => s && { ...s, name: e.target.value })} className="flex-1 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black" placeholder="Tên size" />
                    <input type="number" value={editSize.sortOrder} onChange={(e) => setEditSize((s) => s && { ...s, sortOrder: Number(e.target.value) })} className="w-16 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black" />
                    <button onClick={() => updateMutation.mutate(editSize!)} className="text-xs text-brand-gold uppercase tracking-wider hover:text-brand-black">Lưu</button>
                    <button onClick={() => setEditSize(null)} className="text-xs text-brand-mid uppercase tracking-wider hover:text-brand-black">Hủy</button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 border border-brand-mid flex items-center justify-center text-sm font-medium">{size.code}</span>
                    <div>
                      <p className="font-medium text-sm">{size.name}</p>
                      <p className="text-xs text-brand-mid">Thứ tự: {size.sortOrder}</p>
                    </div>
                    {!size.active && <Badge variant="error">Inactive</Badge>}
                  </div>
                )}
                {editSize?.id !== size.id && (
                  <div className="flex items-center gap-3">
                    <button onClick={() => setEditSize(size)} className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                    {size.active && <button onClick={() => { if (confirm(`Vô hiệu hoá size "${size.code}"?`)) deleteMutation.mutate(size.id) }} className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors">Xóa</button>}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function AdminUsers() {
  const [page, setPage]         = useState(0)
  const [search, setSearch]     = useState('')
  const [role, setRole]         = useState('')
  const [enabled, setEnabled]   = useState('')
  const [editUser, setEditUser] = useState<UserDto | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, role, enabled],
    queryFn:  () => fetchAllUsersAdmin({
      page, size: 20,
      search:  search  || undefined,
      role:    role    || undefined,
      enabled: enabled === '' ? undefined : enabled === 'true',
    }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã xóa tài khoản') },
    onError:   () => toast('Xóa thất bại', 'error'),
  })
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, enabled: en }: { id: number; enabled: boolean }) => adminToggleUserStatus(id, en),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã cập nhật') },
    onError:   () => toast('Thất bại', 'error'),
  })
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role: r }: { id: number; role: 'ROLE_USER' | 'ROLE_ADMIN' }) => adminChangeUserRole(id, r),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã cập nhật quyền') },
    onError:   () => toast('Thất bại', 'error'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Input placeholder="Tìm theo tên, email, SĐT..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="max-w-xs" />
        <Select options={[{ value: '', label: 'Tất cả vai trò' }, { value: 'ROLE_USER', label: 'Người dùng' }, { value: 'ROLE_ADMIN', label: 'Admin' }]} value={role} onChange={(e) => { setRole(e.target.value); setPage(0) }} className="max-w-[160px]" />
        <Select options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'true', label: 'Đang hoạt động' }, { value: 'false', label: 'Đã bị khóa' }]} value={enabled} onChange={(e) => { setEnabled(e.target.value); setPage(0) }} className="max-w-[180px]" />
      </div>
      {data && <p className="text-xs text-brand-mid">Tổng cộng: <strong>{data.totalElements}</strong> tài khoản</p>}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.content.length ? (
        <EmptyState icon="👥" title="Không tìm thấy tài khoản nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {['ID', 'Tên / Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/50">
                {data.content.map((u) => (
                  <tr key={u.id} className="hover:bg-brand-cream/50 transition-colors">
                    <td className="py-3 pr-4 font-mono text-xs text-brand-mid">{u.id}</td>
                    <td className="py-3 pr-4">
                      <p className="font-medium line-clamp-1">{u.name}</p>
                      <p className="text-xs text-brand-mid">{u.email}</p>
                    </td>
                    <td className="py-3 pr-4 text-brand-mid text-xs">{u.phone ?? '—'}</td>
                    <td className="py-3 pr-4"><Badge variant={u.role === 'ROLE_ADMIN' ? 'gold' : 'default'}>{u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</Badge></td>
                    <td className="py-3 pr-4"><Badge variant={u.enabled ? 'success' : 'error'}>{u.enabled ? 'Hoạt động' : 'Bị khóa'}</Badge></td>
                    <td className="py-3 pr-4 text-xs text-brand-mid">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={() => toggleStatusMutation.mutate({ id: u.id, enabled: !u.enabled })}
                          className={cn('text-[10px] uppercase tracking-wider transition-colors', u.enabled ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800')}
                        >
                          {u.enabled ? 'Khóa' : 'Mở khóa'}
                        </button>
                        <button
                          onClick={() => {
                            const newRole = u.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN'
                            if (confirm(`Đổi quyền ${u.name} thành ${newRole === 'ROLE_ADMIN' ? 'Admin' : 'User'}?`)) {
                              changeRoleMutation.mutate({ id: u.id, role: newRole })
                            }
                          }}
                          className="text-[10px] uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors"
                        >
                          {u.role === 'ROLE_ADMIN' ? '↓ User' : '↑ Admin'}
                        </button>
                        <button onClick={() => setEditUser(u)} className="text-[10px] uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                        <button onClick={() => { if (confirm(`Xóa tài khoản ${u.email}?`)) deleteMutation.mutate(u.id) }} className="text-[10px] text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors">Xóa</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button disabled={data.first} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">← Trước</button>
              <span className="text-xs text-brand-mid">{data.number + 1} / {data.totalPages}</span>
              <button disabled={data.last} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">Sau →</button>
            </div>
          )}
        </>
      )}

      {editUser && (
        <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Sửa tài khoản — ${editUser.email}`} className="max-w-lg mx-4 p-8">
          <EditUserForm
            user={editUser}
            onClose={() => setEditUser(null)}
            onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); setEditUser(null) }}
          />
        </Modal>
      )}
    </div>
  )
}

function EditUserForm({
  user, onClose, onUpdated,
}: {
  user: UserDto; onClose: () => void; onUpdated: () => void
}) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone ?? '', avatarUrl: user.avatarUrl ?? '' })
  const mutation = useMutation({
    mutationFn: () => import('@features/user/api/userApi').then((m) => m.adminUpdateUser(user.id, form)),
    onSuccess:  () => { toast('Đã cập nhật'); onUpdated() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Thất bại',
      'error',
    ),
  })
  return (
    <div className="flex flex-col gap-4">
      <Input label="Họ và tên *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      <ImageUploader label="Ảnh đại diện" value={form.avatarUrl || null} folder="avatars" variant="inline" onChange={(url) => setForm((f) => ({ ...f, avatarUrl: url }))} />
      <div className="flex gap-3 mt-4 justify-end">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button loading={mutation.isPending} disabled={!form.name.trim()} onClick={() => mutation.mutate()}>Lưu</Button>
      </div>
    </div>
  )
}