import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatPrice, formatDate, toast } from '@shared/lib'
import { Input, Select, Spinner, EmptyState, Badge } from '@shared/ui'
import { fetchAllOrdersAdmin, updateOrderStatusApi } from '@features/admin/api/adminApi'
import { ORDER_STATUS_LABEL, ORDER_STATUS_VARIANT } from '@entities/order/model'
import type { OrderStatus } from '@shared/types'

export function AdminOrders() {
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