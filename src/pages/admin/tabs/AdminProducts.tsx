import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrice, toast, cn } from '@shared/lib'
import { Button, Badge, Input, Select, Spinner, Modal, EmptyState } from '@shared/ui'
import { fetchCategories } from '@features/catalog/api/catalogApi'
import {
  adminDeleteProduct, adminCreateProduct, adminUpdateProduct,
  adminRestoreProduct, adminHardDeleteProduct, adminFetchProducts,
  fetchAllColors, fetchAllSizes,
  adminCreateVariant, adminUpdateVariant, adminDeleteVariant, fetchVariants,
} from '@features/admin/api/adminApi'
import { ImageUploader } from '@features/upload/ui/ImageUploader'
import type {
  ProductCreateRequest, ProductUpdateRequest,
  ProductDetailDto, ProductListDto,
  VariantFullDto, VariantCreateRequest, VariantUpdateRequest,
} from '@shared/types'

export function AdminProducts() {
  const [search, setSearch]               = useState('')
  const [page, setPage]                   = useState(0)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [createOpen, setCreateOpen]       = useState(false)
  const [editProduct, setEditProduct]     = useState<ProductListDto | null>(null)
  const [variantProduct, setVariantProduct] = useState<ProductListDto | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page, search, includeDeleted],
    queryFn:  () => adminFetchProducts({ page, size: 15, search: search || undefined, includeDeleted: includeDeleted || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteProduct,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast('Đã xóa (soft)') },
    onError:    () => toast('Xóa thất bại', 'error'),
  })
  const restoreMutation = useMutation({
    mutationFn: adminRestoreProduct,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast('Đã khôi phục sản phẩm') },
    onError:    () => toast('Khôi phục thất bại', 'error'),
  })
  const hardDeleteMutation = useMutation({
    mutationFn: adminHardDeleteProduct,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast('Đã xóa vĩnh viễn') },
    onError:    () => toast('Xóa vĩnh viễn thất bại', 'error'),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <Input
            placeholder="Tìm kiếm sản phẩm..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            className="max-w-xs"
          />
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-brand-mid hover:text-brand-black transition-colors">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(0) }}
              className="w-4 h-4 accent-brand-gold"
            />
            Hiển thị sản phẩm đã xóa
          </label>
        </div>
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
                  <tr key={p.id} className={cn('transition-colors', p.deleted ? 'opacity-50 bg-red-50/30' : 'hover:bg-brand-cream/50')}>
                    <td className="py-3 pr-4">
                      <img src={p.mainImage} alt={p.name} className="w-12 h-14 object-cover bg-brand-cream" />
                    </td>
                    <td className="py-3 pr-4">
                      <p className={cn('font-medium line-clamp-1', p.deleted && 'line-through text-brand-mid')}>{p.name}</p>
                      <p className="text-xs font-mono text-brand-mid">{p.id.substring(0, 8)}</p>
                      {p.deleted && p.deletedAt && (
                        <p className="text-[10px] text-red-400 mt-0.5">Đã xóa: {new Date(p.deletedAt).toLocaleDateString('vi-VN')}</p>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-brand-mid">{p.categoryName}</td>
                    <td className="py-3 pr-4">
                      <p>{formatPrice(p.salePrice ?? p.basePrice)}</p>
                      {p.salePrice && <p className="text-xs text-brand-mid line-through">{formatPrice(p.basePrice)}</p>}
                    </td>
                    <td className="py-3 pr-4">
                      {p.deleted
                        ? <Badge variant="error">Đã xóa</Badge>
                        : <Badge variant={p.inStock ? 'success' : 'error'}>{p.inStock ? 'Còn hàng' : 'Hết hàng'}</Badge>
                      }
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {p.deleted ? (
                          <>
                            <button onClick={() => { if (confirm(`Khôi phục "${p.name}"?`)) restoreMutation.mutate(p.id) }} className="text-[10px] text-green-600 hover:text-green-800 uppercase tracking-wider transition-colors">Khôi phục</button>
                            <button onClick={() => { if (confirm(`Xóa VĨNH VIỄN "${p.name}"? Không thể hoàn tác!`)) hardDeleteMutation.mutate(p.id) }} className="text-[10px] text-red-700 hover:text-red-900 uppercase tracking-wider transition-colors font-medium">Xóa vĩnh viễn</button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => setVariantProduct(p)} className="text-xs uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors">Variants</button>
                            <button onClick={() => setEditProduct(p)} className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                            <button onClick={() => { if (confirm(`Xóa "${p.name}"?`)) deleteMutation.mutate(p.id) }} className="text-xs text-red-500 hover:text-red-700 transition-colors uppercase tracking-wider">Xóa</button>
                          </>
                        )}
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

      <CreateProductModal open={createOpen} onClose={() => setCreateOpen(false)} onCreated={() => { invalidate(); setCreateOpen(false) }} />
      {editProduct && <EditProductModal productId={editProduct.id} open={!!editProduct} onClose={() => setEditProduct(null)} onUpdated={() => { invalidate(); setEditProduct(null) }} />}
      {variantProduct && <VariantManagerModal product={variantProduct} open={!!variantProduct} onClose={() => setVariantProduct(null)} />}
    </div>
  )
}

function CreateProductModal({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated: () => void }) {
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => fetchCategories() })
  const [form, setForm] = useState<ProductCreateRequest>({
    name: '', slug: '', description: '', basePrice: 0,
    salePrice: null, mainImage: '', hoverImage: '', categoryId: 0,
  })

  const mutation = useMutation({
    mutationFn: () => adminCreateProduct(form),
    onSuccess:  () => { toast('Đã tạo sản phẩm'); onCreated() },
    onError:    (err: unknown) => toast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Tạo thất bại', 'error'),
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
          <div className="col-span-2"><Input label="Tên sản phẩm" value={form.name} onChange={(e) => handleNameChange(e.target.value)} /></div>
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
        <Button loading={mutation.isPending} disabled={!form.name || !form.mainImage || !form.categoryId} onClick={() => mutation.mutate()}>Tạo sản phẩm</Button>
      </div>
    </Modal>
  )
}

function EditProductModal({ productId, open, onClose, onUpdated }: { productId: string; open: boolean; onClose: () => void; onUpdated: () => void }) {
  const queryClient = useQueryClient()
  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: () => fetchCategories() })
  const { data: product, isLoading } = useQuery<ProductDetailDto>({
    queryKey: ['product-detail', productId],
    queryFn:  () => import('@features/catalog/api/catalogApi').then((m) => m.fetchProductById(productId)),
    enabled:  open,
  })
  const [form, setForm] = useState<ProductUpdateRequest | null>(null)

  if (product && !form) {
    setForm({
      name: product.name, slug: product.slug, description: product.description ?? '',
      basePrice: product.basePrice, salePrice: product.salePrice ?? null,
      mainImage: product.mainImage, hoverImage: product.hoverImage ?? '',
      categoryId: product.category.id, active: product.active,
    })
  }

const mutation = useMutation({
    mutationFn: () => adminUpdateProduct(productId, form!),
    onSuccess:  () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] })
      queryClient.invalidateQueries({ queryKey: ['product-detail', productId] })
      toast('Đã cập nhật sản phẩm')
      onUpdated()
    },
    onError:    (err: unknown) => toast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Cập nhật thất bại', 'error'),
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
              <div className="col-span-2"><Input label="Tên sản phẩm" value={form.name} onChange={(e) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, name: e.target.value } : null)} /></div>
              <Input label="Slug (URL)" value={form.slug} onChange={(e) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, slug: e.target.value } : null)} />
              <Select label="Danh mục" options={catOptions} value={String(form.categoryId)} onChange={(e) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, categoryId: Number(e.target.value) } : null)} />
              <Input label="Giá gốc (VNĐ)" type="number" value={String(form.basePrice)} onChange={(e) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, basePrice: Number(e.target.value) } : null)} />
              <Input label="Giá khuyến mãi" type="number" value={form.salePrice ? String(form.salePrice) : ''} placeholder="Để trống nếu không có" onChange={(e) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, salePrice: e.target.value ? Number(e.target.value) : null } : null)} />
              <div className="col-span-2 grid grid-cols-2 gap-4">
                <ImageUploader label="Ảnh chính" value={form.mainImage || null} onChange={(url) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, mainImage: url } : null)} folder="products" />
                <ImageUploader label="Ảnh hover" value={form.hoverImage || null} onChange={(url) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, hoverImage: url } : null)} folder="products" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">Mô tả</label>
                <textarea rows={4} value={form.description ?? ''} onChange={(e) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, description: e.target.value } : null)} className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="active-toggle" checked={form.active ?? true} onChange={(e) => setForm((prev): ProductUpdateRequest | null => prev ? { ...prev, active: e.target.checked } : null)} className="w-4 h-4 accent-brand-gold" />
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

function VariantManagerModal({ product, open, onClose }: { product: ProductListDto; open: boolean; onClose: () => void }) {
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
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'variants', product.id] }); queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }); toast('Đã xóa variant') },
    onError:    () => toast('Xóa thất bại', 'error'),
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
                    <td className="py-3 pr-4"><span className="inline-flex items-center justify-center w-8 h-8 border border-brand-mid text-xs font-medium">{v.sizeCode}</span></td>
                    <td className="py-3 pr-4">{v.imageUrl ? <img src={v.imageUrl} alt="" className="w-10 h-12 object-cover border border-brand-light" /> : <span className="text-xs text-brand-light">—</span>}</td>
                    <td className="py-3 pr-4 font-medium">{v.quantity}</td>
                    <td className="py-3 pr-4"><Badge variant={v.inStock ? 'success' : 'error'}>{v.inStock ? 'Còn' : 'Hết'}</Badge></td>
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

function AddVariantModal({ productId, open, onClose, onCreated }: { productId: string; open: boolean; onClose: () => void; onCreated: () => void }) {
  const { data: colors } = useQuery({ queryKey: ['colors', 'all'], queryFn: fetchAllColors })
  const { data: sizes }  = useQuery({ queryKey: ['sizes', 'all'],  queryFn: fetchAllSizes })
  const [form, setForm]  = useState<VariantCreateRequest & { sku: string }>({ sku: '', colorId: 0, sizeId: 0, quantity: 0, imageUrl: '' })

  const mutation = useMutation({
    mutationFn: () => adminCreateVariant(productId, form),
    onSuccess:  () => { toast('Đã thêm variant'); onCreated() },
    onError:    (err: unknown) => toast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Tạo thất bại', 'error'),
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

function EditVariantModal({ productId, variant, open, onClose, onUpdated }: { productId: string; variant: VariantFullDto; open: boolean; onClose: () => void; onUpdated: () => void }) {
  const { data: colors } = useQuery({ queryKey: ['colors', 'all'], queryFn: fetchAllColors })
  const { data: sizes }  = useQuery({ queryKey: ['sizes', 'all'],  queryFn: fetchAllSizes })
  const [form, setForm]  = useState<VariantUpdateRequest>({ colorId: variant.colorId, sizeId: variant.sizeId, quantity: variant.quantity, imageUrl: variant.imageUrl ?? '' })

  const mutation = useMutation({
    mutationFn: () => adminUpdateVariant(productId, variant.id, form),
    onSuccess:  () => { toast('Đã cập nhật variant'); onUpdated() },
    onError:    (err: unknown) => toast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Cập nhật thất bại', 'error'),
  })

  const activeColors = (colors ?? []).filter((c) => c.active)
  const activeSizes  = (sizes ?? []).filter((s) => s.active).sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <Modal open={open} onClose={onClose} title={`Sửa variant — ${variant.sku}`} className="max-w-lg mx-4 p-8">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Select label="Màu sắc *" options={activeColors.map((c) => ({ value: String(c.id), label: `${c.name} (${c.code})` }))} value={String(form.colorId)} onChange={(e) => setForm((f) => ({ ...f, colorId: Number(e.target.value) }))} />
          <Select label="Kích cỡ *"  options={activeSizes.map((s) => ({ value: String(s.id), label: s.code }))}  value={String(form.sizeId)}  onChange={(e) => setForm((f) => ({ ...f, sizeId:  Number(e.target.value) }))} />
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