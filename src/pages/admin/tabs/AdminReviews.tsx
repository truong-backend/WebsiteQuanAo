import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDate, toast, cn } from '@shared/lib'
import { Select, Spinner, EmptyState, Badge } from '@shared/ui'
import { adminFetchReviews, adminApproveReview, adminDeleteReviewApi } from '@features/admin/api/adminApi'

export function AdminReviews() {
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
                    {!r.approved && <button onClick={() => approveMutation.mutate(r.id)} className="text-xs uppercase tracking-wider text-green-600 hover:text-green-800 transition-colors">Duyệt</button>}
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