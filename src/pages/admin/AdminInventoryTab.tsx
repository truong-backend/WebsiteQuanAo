import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDate, toast, cn } from '@shared/lib'
import { Button, Input, Spinner, EmptyState, Modal, Select } from '@shared/ui'
import { fetchInventoryLogs, importStockApi, adjustStockApi } from '@features/admin/api/inventoryApi'
import { fetchVariants } from '@features/admin/api/adminApi'
import { fetchProducts } from '@features/catalog/api/catalogApi'
import type { VariantFullDto } from '@shared/types'

const CHANGE_TYPE_LABEL: Record<string, string> = {
  IMPORT:      'Nhập kho',
  EXPORT_SALE: 'Xuất bán',
  RETURN:      'Hoàn kho',
  ADJUST:      'Điều chỉnh',
}

const CHANGE_TYPE_COLOR: Record<string, string> = {
  IMPORT:      'text-green-700 bg-green-50',
  EXPORT_SALE: 'text-red-700 bg-red-50',
  RETURN:      'text-blue-700 bg-blue-50',
  ADJUST:      'text-amber-700 bg-amber-50',
}

export function AdminInventoryTab() {
  const [page, setPage]             = useState(0)
  const [importOpen, setImportOpen] = useState(false)
  const [adjustOpen, setAdjustOpen] = useState(false)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'inventory', 'logs', page],
    queryFn:  () => fetchInventoryLogs({ page, size: 20 }),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'inventory'] })

  return (
    <div className="flex flex-col gap-6">
      {/* Actions */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <p className="text-sm text-brand-mid">Lịch sử nhập/xuất kho theo variant</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={() => setAdjustOpen(true)}>Điều chỉnh tồn kho</Button>
          <Button onClick={() => setImportOpen(true)}>+ Nhập hàng</Button>
        </div>
      </div>

      {/* Log table */}
      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.content.length ? (
        <EmptyState icon="📦" title="Chưa có lịch sử kho nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {['Loại', 'SKU / Sản phẩm', 'Màu / Size', 'Số lượng', 'Sau khi', 'Ghi chú', 'Người thực hiện', 'Thời gian'].map((h) => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/50">
                {data.content.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-cream/30 transition-colors">
                    <td className="py-3 pr-4">
                      <span className={cn('text-[10px] uppercase tracking-wide font-medium px-2 py-1 rounded', CHANGE_TYPE_COLOR[log.changeType])}>
                        {CHANGE_TYPE_LABEL[log.changeType]}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="font-mono text-xs font-medium">{log.variantSku}</p>
                      <p className="text-xs text-brand-mid line-clamp-1">{log.productName}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <p className="text-xs">{log.colorName}</p>
                      <p className="text-xs text-brand-mid">{log.sizeCode}</p>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={cn('font-medium', log.changeType === 'IMPORT' || log.changeType === 'RETURN' ? 'text-green-700' : 'text-red-700')}>
                        {log.changeType === 'IMPORT' || log.changeType === 'RETURN' ? '+' : '-'}{log.quantity}
                      </span>
                    </td>
                    <td className="py-3 pr-4 font-medium">{log.quantityAfter}</td>
                    <td className="py-3 pr-4 text-xs text-brand-mid max-w-[160px] line-clamp-2">{log.note ?? '—'}</td>
                    <td className="py-3 pr-4 text-xs text-brand-mid">{log.createdByName}</td>
                    <td className="py-3 pr-4 text-xs text-brand-mid whitespace-nowrap">{formatDate(log.createdAt)}</td>
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

      {/* Modals */}
      <ImportStockModal
        open={importOpen}
        onClose={() => setImportOpen(false)}
        onSuccess={() => { invalidate(); setImportOpen(false) }}
      />
      <AdjustStockModal
        open={adjustOpen}
        onClose={() => setAdjustOpen(false)}
        onSuccess={() => { invalidate(); setAdjustOpen(false) }}
      />
    </div>
  )
}

// ── Import Stock Modal ────────────────────────────────────────────────────────

function ImportStockModal({
  open, onClose, onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [productId, setProductId] = useState('')
  const [variantId, setVariantId] = useState('')
  const [quantity,  setQuantity]  = useState(1)
  const [note,      setNote]      = useState('')

  const { data: products } = useQuery({
    queryKey: ['products', 'shop', { size: 200 }],
    queryFn:  () => fetchProducts({ size: 200 }),
    enabled:  open,
  })

  const { data: variants } = useQuery({
    queryKey: ['admin', 'variants', productId],
    queryFn:  () => fetchVariants(productId),
    enabled:  !!productId,
  })

  const mutation = useMutation({
    mutationFn: () => importStockApi({ variantId, quantity, note: note || undefined }),
    onSuccess:  () => { toast('Nhập kho thành công'); onSuccess() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Thất bại',
      'error',
    ),
  })

  const productOptions = [
    { value: '', label: 'Chọn sản phẩm...' },
    ...(products?.content ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  const variantOptions = [
    { value: '', label: 'Chọn variant...' },
    ...(variants ?? []).map((v) => ({
      value: v.id,
      label: `${v.sku} — ${v.colorName} / ${v.sizeCode} (tồn: ${v.quantity})`,
    })),
  ]

  return (
    <Modal open={open} onClose={onClose} title="Nhập hàng vào kho" className="max-w-lg mx-4 p-8">
      <div className="flex flex-col gap-4">
        <Select
          label="Sản phẩm *"
          options={productOptions}
          value={productId}
          onChange={(e) => { setProductId(e.target.value); setVariantId('') }}
        />
        {productId && (
          <Select
            label="Variant *"
            options={variantOptions}
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
          />
        )}
        <Input
          label="Số lượng nhập *"
          type="number"
          min="1"
          value={String(quantity)}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
        />
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">
            Ghi chú
          </label>
          <textarea
            rows={3}
            placeholder="VD: Nhập hàng Q1 2025, nhà cung cấp ABC..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button
          loading={mutation.isPending}
          disabled={!variantId || quantity < 1}
          onClick={() => mutation.mutate()}
        >
          Nhập kho
        </Button>
      </div>
    </Modal>
  )
}

// ── Adjust Stock Modal ────────────────────────────────────────────────────────

function AdjustStockModal({
  open, onClose, onSuccess,
}: {
  open: boolean
  onClose: () => void
  onSuccess: () => void
}) {
  const [productId,   setProductId]   = useState('')
  const [variantId,   setVariantId]   = useState('')
  const [newQuantity, setNewQuantity] = useState(0)
  const [note,        setNote]        = useState('')

  const { data: products } = useQuery({
    queryKey: ['products', 'shop', { size: 200 }],
    queryFn:  () => fetchProducts({ size: 200 }),
    enabled:  open,
  })

  const { data: variants } = useQuery({
    queryKey: ['admin', 'variants', productId],
    queryFn:  () => fetchVariants(productId),
    enabled:  !!productId,
  })

  const mutation = useMutation({
    mutationFn: () => adjustStockApi({ variantId, newQuantity, note: note || undefined }),
    onSuccess:  () => { toast('Điều chỉnh kho thành công'); onSuccess() },
    onError:    (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Thất bại',
      'error',
    ),
  })

  const productOptions = [
    { value: '', label: 'Chọn sản phẩm...' },
    ...(products?.content ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  const variantOptions = [
    { value: '', label: 'Chọn variant...' },
    ...(variants ?? []).map((v) => ({
      value: v.id,
      label: `${v.sku} — ${v.colorName} / ${v.sizeCode} (tồn: ${v.quantity})`,
    })),
  ]

  const currentVariant: VariantFullDto | undefined = variants?.find((v) => v.id === variantId)

  const handleVariantChange = (id: string) => {
    setVariantId(id)
    const v = variants?.find((x) => x.id === id)
    if (v) setNewQuantity(v.quantity)
  }

  return (
    <Modal open={open} onClose={onClose} title="Điều chỉnh tồn kho" className="max-w-lg mx-4 p-8">
      <div className="flex flex-col gap-4">
        <Select
          label="Sản phẩm *"
          options={productOptions}
          value={productId}
          onChange={(e) => { setProductId(e.target.value); setVariantId('') }}
        />
        {productId && (
          <Select
            label="Variant *"
            options={variantOptions}
            value={variantId}
            onChange={(e) => handleVariantChange(e.target.value)}
          />
        )}
        {currentVariant && (
          <div className="p-3 bg-brand-cream text-xs text-brand-mid">
            Tồn kho hiện tại: <strong className="text-brand-black">{currentVariant.quantity}</strong> cái
          </div>
        )}
        <Input
          label="Số lượng mới *"
          type="number"
          min="0"
          value={String(newQuantity)}
          onChange={(e) => setNewQuantity(Math.max(0, Number(e.target.value)))}
        />
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">
            Lý do điều chỉnh
          </label>
          <textarea
            rows={3}
            placeholder="Giải thích lý do điều chỉnh tồn kho..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none"
          />
        </div>
      </div>
      <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button
          loading={mutation.isPending}
          disabled={!variantId}
          onClick={() => mutation.mutate()}
        >
          Điều chỉnh
        </Button>
      </div>
    </Modal>
  )
}