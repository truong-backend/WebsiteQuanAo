import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrice, toast, cn } from '@shared/lib'
import { Button, Badge, Input, Select, Spinner, Modal, EmptyState } from '@shared/ui'
import {
  adminFetchVouchers, adminCreateVoucher, adminUpdateVoucher, adminDeleteVoucher,
  adminRestoreVoucher, adminHardDeleteVoucher,
} from '@features/admin/api/adminApi'
import type { VoucherDto, VoucherRequest } from '@shared/types'

const VOUCHER_TYPE_LABEL: Record<string, string> = {
  PERCENTAGE:   'Giảm %',
  FIXED_AMOUNT: 'Giảm tiền',
  FREE_SHIPPING:'Miễn ship',
}

export function AdminVouchers() {
  const [createOpen, setCreateOpen]         = useState(false)
  const [editVoucher, setEditVoucher]       = useState<VoucherDto | null>(null)
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const queryClient = useQueryClient()

  const { data: vouchers, isLoading } = useQuery({
    queryKey: ['admin', 'vouchers', includeDeleted],
    queryFn:  () => adminFetchVouchers(includeDeleted),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteVoucher,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }); toast('Đã xóa voucher') },
    onError:    () => toast('Xóa thất bại', 'error'),
  })
  const restoreMutation = useMutation({
    mutationFn: adminRestoreVoucher,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }); toast('Đã khôi phục voucher') },
    onError:    () => toast('Khôi phục thất bại', 'error'),
  })
  const hardDeleteMutation = useMutation({
    mutationFn: adminHardDeleteVoucher,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] }); toast('Đã xóa vĩnh viễn') },
    onError:    () => toast('Xóa vĩnh viễn thất bại', 'error'),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['admin', 'vouchers'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <p className="text-sm text-brand-mid">{vouchers?.length ?? 0} voucher</p>
          <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-brand-mid hover:text-brand-black transition-colors">
            <input type="checkbox" checked={includeDeleted} onChange={(e) => setIncludeDeleted(e.target.checked)} className="w-4 h-4 accent-brand-gold" />
            Hiển thị voucher đã xóa
          </label>
        </div>
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
                <tr key={v.id} className={cn('transition-colors', v.deleted ? 'opacity-50 bg-red-50/30' : 'hover:bg-brand-cream/50')}>
                  <td className="py-3 pr-4 font-mono font-medium">
                    <p className={cn(v.deleted && 'line-through text-brand-mid')}>{v.code}</p>
                    {v.deleted && v.deletedAt && <p className="text-[10px] text-red-400 mt-0.5">Đã xóa: {new Date(v.deletedAt).toLocaleDateString('vi-VN')}</p>}
                  </td>
                  <td className="py-3 pr-4 text-brand-mid">{VOUCHER_TYPE_LABEL[v.type]}</td>
                  <td className="py-3 pr-4">
                    {v.type === 'PERCENTAGE' ? `${v.value}%` : v.type === 'FIXED_AMOUNT' ? formatPrice(v.value) : 'Miễn phí ship'}
                    {v.maxDiscount != null && <span className="text-xs text-brand-mid block">Tối đa {formatPrice(v.maxDiscount)}</span>}
                  </td>
                  <td className="py-3 pr-4">{formatPrice(v.minOrderAmount)}</td>
                  <td className="py-3 pr-4">{v.usedCount}{v.usageLimit ? ` / ${v.usageLimit}` : ''}</td>
                  <td className="py-3 pr-4 text-xs text-brand-mid">{v.endDate ? new Date(v.endDate).toLocaleDateString('vi-VN') : '—'}</td>
                  <td className="py-3 pr-4">
                    {v.deleted
                      ? <Badge variant="error">Đã xóa</Badge>
                      : <Badge variant={v.active ? 'success' : 'error'}>{v.active ? 'Đang hoạt động' : 'Đã tắt'}</Badge>
                    }
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-3 flex-wrap">
                      {v.deleted ? (
                        <>
                          <button onClick={() => { if (confirm(`Khôi phục voucher "${v.code}"?`)) restoreMutation.mutate(v.id) }} className="text-[10px] text-green-600 hover:text-green-800 uppercase tracking-wider transition-colors">Khôi phục</button>
                          <button onClick={() => { if (confirm(`Xóa VĨNH VIỄN voucher "${v.code}"? Không thể hoàn tác!`)) hardDeleteMutation.mutate(v.id) }} className="text-[10px] text-red-700 hover:text-red-900 uppercase tracking-wider transition-colors font-medium">Xóa vĩnh viễn</button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => setEditVoucher(v)} className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                          <button onClick={() => { if (confirm(`Xóa voucher "${v.code}"?`)) deleteMutation.mutate(v.id) }} className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors">Xóa</button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <VoucherFormModal open={createOpen} onClose={() => setCreateOpen(false)} onSaved={() => { invalidate(); setCreateOpen(false) }} />
      {editVoucher && <VoucherFormModal open={!!editVoucher} voucher={editVoucher} onClose={() => setEditVoucher(null)} onSaved={() => { invalidate(); setEditVoucher(null) }} />}
    </div>
  )
}

function VoucherFormModal({ open, voucher, onClose, onSaved }: { open: boolean; voucher?: VoucherDto; onClose: () => void; onSaved: () => void }) {
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
    onError:    (err: unknown) => toast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Thất bại', 'error'),
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
          <Input label={form.type === 'PERCENTAGE' ? 'Giá trị (%) *' : 'Số tiền giảm (VNĐ) *'} type="number" value={String(form.value)} onChange={(e) => setForm((f) => ({ ...f, value: Number(e.target.value) }))} />
        )}
        {form.type === 'PERCENTAGE' && (
          <Input label="Giảm tối đa (VNĐ, để trống = không giới hạn)" type="number" value={form.maxDiscount != null ? String(form.maxDiscount) : ''} onChange={(e) => setForm((f) => ({ ...f, maxDiscount: e.target.value ? Number(e.target.value) : undefined }))} />
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
        <Button loading={mutation.isPending} disabled={!form.code} onClick={() => mutation.mutate()}>{isEdit ? 'Lưu thay đổi' : 'Tạo voucher'}</Button>
      </div>
    </Modal>
  )
}