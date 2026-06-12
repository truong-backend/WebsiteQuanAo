import { cn } from '@shared/lib'
import { hasDiscount, discountPercent } from '@entities/product/model'
import type { ProductListDto } from '@shared/types'

export function StarRating({ value, count, size = 'sm' }: {
  value: number
  count?: number
  size?:  'sm' | 'md'
}) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={cn(
              size === 'sm' ? 'w-3 h-3' : 'w-4 h-4',
              star <= Math.round(value) ? 'text-brand-gold' : 'text-brand-light',
            )}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      {count !== undefined && (
        <span className="text-[10px] text-brand-mid">({count})</span>
      )}
    </div>
  )
}

export function DiscountBadge({ product }: { product: Pick<ProductListDto, 'basePrice' | 'salePrice'> }) {
  if (!hasDiscount(product)) return null
  return (
    <span className="bg-brand-gold text-brand-black text-[10px] font-medium px-2 py-0.5 uppercase tracking-wider">
      -{discountPercent(product)}%
    </span>
  )
}

export function StockBadge({ inStock }: { inStock: boolean }) {
  return (
    <span className={cn(
      'text-[10px] uppercase tracking-wider font-medium',
      inStock ? 'text-green-700' : 'text-red-500',
    )}>
      {inStock ? 'Còn hàng' : 'Hết hàng'}
    </span>
  )
}

export function ColorSwatch({ colorCode, colorName, selected, onClick }: {
  colorCode: string
  colorName: string
  selected:  boolean
  onClick:   () => void
}) {
  return (
    <button
      title={colorName}
      onClick={onClick}
      className={cn(
        'w-6 h-6 rounded-full border-2 transition-all duration-200',
        selected ? 'border-brand-black scale-110' : 'border-transparent hover:border-brand-mid',
      )}
      style={{ backgroundColor: colorCode }}
    />
  )
}

export function SizeButton({ size, available, selected, onClick }: {
  size:      string
  available: boolean
  selected:  boolean
  onClick:   () => void
}) {
  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={cn(
        'w-10 h-10 text-xs font-medium border transition-all duration-200',
        selected
          ? 'bg-brand-black text-brand-white border-brand-black'
          : available
          ? 'border-brand-light hover:border-brand-black text-brand-charcoal'
          : 'border-brand-light text-brand-light cursor-not-allowed line-through',
      )}
    >
      {size}
    </button>
  )
}
