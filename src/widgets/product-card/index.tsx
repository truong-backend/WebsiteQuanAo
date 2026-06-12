import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/config'
import { formatPrice, cn } from '@shared/lib'
import { getEffectivePrice, hasDiscount } from '@entities/product/model'
import { StarRating, DiscountBadge } from '@entities/product/ui'
import { useCartStore } from '@features/cart/model/cartStore'
import { useAuthStore } from '@features/auth/model/authStore'
import type { ProductListDto } from '@shared/types'

interface ProductCardProps {
  product:   ProductListDto
  className?: string
}

export function ProductCard({ product, className }: ProductCardProps) {
  const addItem    = useCartStore((s: ReturnType<typeof useCartStore.getState>) => s.addItem)
  const isAuth     = useAuthStore((s: ReturnType<typeof useAuthStore.getState>) => s.isAuth)
  const effectivePrice = getEffectivePrice(product)

  return (
    <article
      className={cn(
        'group relative flex flex-col bg-brand-white overflow-hidden',
        'border border-transparent hover:border-brand-light transition-all duration-500',
        className,
      )}
    >
      {/* Image */ }
      <Link
        to={ROUTES.productPath(product.slug)}
        className="relative block overflow-hidden aspect-[3/4] bg-brand-cream"
      >
        <img
          src={product.mainImage}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-500 group-hover:opacity-0"
          loading="lazy"
        />
        {product.hoverImage && (
          <img
            src={product.hoverImage}
            alt={product.name}
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            loading="lazy"
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          <DiscountBadge product={product} />
          {!product.inStock && (
            <span className="bg-brand-charcoal text-brand-white text-[10px] font-medium px-2 py-0.5 uppercase tracking-wider">
              Hết hàng
            </span>
          )}
        </div>

        {/* Quick add */}
        {product.inStock && isAuth && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <button
              onClick={(e) => {
                e.preventDefault()
                // Add first available variant
                addItem('', 1)
              }}
              className="w-full bg-brand-black text-brand-white text-xs uppercase tracking-widest py-3 hover:bg-brand-gold hover:text-brand-black transition-colors"
            >
              Thêm vào giỏ
            </button>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <p className="text-[10px] uppercase tracking-widest text-brand-mid">
          {product.categoryName}
        </p>

        <Link
          to={ROUTES.productPath(product.slug)}
          className="font-display text-lg leading-tight hover:text-brand-gold transition-colors line-clamp-2"
        >
          {product.name}
        </Link>

        <StarRating value={product.ratingAvg} count={product.ratingCount} />

        {/* Colors */}
        {product.availableColors.length > 0 && (
          <div className="flex items-center gap-1 flex-wrap">
            {product.availableColors.slice(0, 5).map((color: string) => (
              <span key={color} className="text-[10px] text-brand-mid border border-brand-light px-1.5 py-0.5">
                {color}
              </span>
            ))}
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="font-medium text-sm text-brand-black">
            {formatPrice(effectivePrice)}
          </span>
          {hasDiscount(product) && (
            <span className="text-xs text-brand-mid line-through">
              {formatPrice(product.basePrice)}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}

/** Skeleton loading state */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      <div className="aspect-[3/4] bg-brand-cream animate-pulse" />
      <div className="px-4 flex flex-col gap-2">
        <div className="h-3 bg-brand-light/60 rounded w-1/3 animate-pulse" />
        <div className="h-5 bg-brand-light/60 rounded w-3/4 animate-pulse" />
        <div className="h-3 bg-brand-light/60 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-brand-light/60 rounded w-1/4 animate-pulse mt-1" />
      </div>
    </div>
  )
}
