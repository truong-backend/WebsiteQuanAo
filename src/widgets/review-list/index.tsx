import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { formatDate, toast, cn } from '@shared/lib'
import { Button, Spinner, EmptyState } from '@shared/ui'
import { StarRating } from '@entities/product/ui'
import { fetchReviews, createReviewApi } from '@features/reviews/api/reviewsApi'
import { useAuthStore } from '@features/auth/model/authStore'

interface ReviewListProps {
  productId: string
}

export function ReviewList({ productId }: ReviewListProps) {
  const [page, setPage]   = useState(0)
  const isAuth            = useAuthStore((s) => s.isAuth)
  const user              = useAuthStore((s) => s.user)
  const queryClient       = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['reviews', productId, page],
    queryFn:  () => fetchReviews(productId, page),
  })

  const createMutation = useMutation({
    mutationFn: (payload: { rating: number; comment: string }) =>
      createReviewApi(productId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', productId] })
      toast('Đã gửi đánh giá')
    },
    onError: () => toast('Gửi đánh giá thất bại', 'error'),
  })

  return (
    <div className="flex flex-col gap-8">
      {/* Write review */}
      {isAuth && (
        <ReviewForm
          userName={user?.name ?? ''}
          onSubmit={(rating, comment) => createMutation.mutate({ rating, comment })}
          loading={createMutation.isPending}
        />
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner size="lg" /></div>
      ) : !data || data.content.length === 0 ? (
        <EmptyState
          icon="💬"
          title="Chưa có đánh giá"
          description="Hãy là người đầu tiên chia sẻ cảm nhận về sản phẩm"
        />
      ) : (
        <ul className="flex flex-col gap-6">
          {data.content.map((review) => (
            <li key={review.id} className="flex flex-col gap-2 pb-6 border-b border-brand-light last:border-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-brand-black text-sm font-medium">
                  {review.userName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium">{review.userName}</p>
                  <p className="text-[10px] text-brand-mid">{formatDate(review.createdAt)}</p>
                </div>
                <div className="ml-auto"><StarRating value={review.rating} /></div>
              </div>
              {review.comment && (
                <p className="text-sm text-brand-charcoal leading-relaxed pl-12">{review.comment}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            disabled={data.first}
            onClick={() => setPage((p) => p - 1)}
            className="px-4 py-2 text-xs uppercase tracking-wider border border-brand-light hover:border-brand-black disabled:opacity-30 transition-colors"
          >
            ← Trước
          </button>
          <span className="text-sm text-brand-mid">
            {data.number + 1} / {data.totalPages}
          </span>
          <button
            disabled={data.last}
            onClick={() => setPage((p) => p + 1)}
            className="px-4 py-2 text-xs uppercase tracking-wider border border-brand-light hover:border-brand-black disabled:opacity-30 transition-colors"
          >
            Sau →
          </button>
        </div>
      )}
    </div>
  )
}

function ReviewForm({ userName, onSubmit, loading }: {
  userName: string
  onSubmit: (rating: number, comment: string) => void
  loading:  boolean
}) {
  const [rating,  setRating]  = useState(5)
  const [comment, setComment] = useState('')
  const [hover,   setHover]   = useState(0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!comment.trim()) { toast('Vui lòng nhập nội dung', 'error'); return }
    onSubmit(rating, comment)
    setComment('')
    setRating(5)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-brand-cream">
      <h3 className="font-display text-xl">Viết đánh giá của bạn</h3>
      <p className="text-xs text-brand-mid">Đăng với tư cách: <strong>{userName}</strong></p>

      {/* Star selector */}
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setRating(star)}
          >
            <svg
              className={cn(
                'w-7 h-7 transition-colors',
                star <= (hover || rating) ? 'text-brand-gold' : 'text-brand-light',
              )}
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </button>
        ))}
        <span className="text-sm text-brand-mid ml-2">{rating} / 5 sao</span>
      </div>

      <textarea
        rows={4}
        placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        className="w-full border border-brand-light bg-brand-white px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none"
      />

      <Button type="submit" loading={loading} className="self-start">
        Gửi đánh giá
      </Button>
    </form>
  )
}
