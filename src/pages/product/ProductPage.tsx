import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { formatPrice, toast } from '@shared/lib'
import { Button, Spinner, Badge } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { fetchProductBySlug } from '@features/catalog/api/catalogApi'
import { useCartStore } from '@features/cart/model/cartStore'
import { useAuthStore } from '@features/auth/model/authStore'
import {
  getUniqueColors,
  getSizesForColor,
  findVariant,
} from '@entities/product/model'
import {
  StarRating,
  DiscountBadge,
  ColorSwatch,
  SizeButton,
} from '@entities/product/ui'
import { ReviewList } from '@widgets/review-list'

export default function ProductPage() {
  const { slug }     = useParams<{ slug: string }>()
  const addItem      = useCartStore((s) => s.addItem)
  const isAuth       = useAuthStore((s) => s.isAuth)

  const [activeImage, setActiveImage]     = useState(0)
  const [selectedColor, setSelectedColor] = useState<string | null>(null)
  const [selectedSize,  setSelectedSize]  = useState<string | null>(null)
  const [qty, setQty]                     = useState(1)

  const { data: product, isLoading, isError } = useQuery({
    queryKey: ['product', slug],
    queryFn:  () => fetchProductBySlug(slug!),
    enabled:  !!slug,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  if (isError || !product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-3xl">Không tìm thấy sản phẩm</p>
        <Link to={ROUTES.shop}>
          <Button variant="secondary">Quay lại cửa hàng</Button>
        </Link>
      </div>
    )
  }

  const colors      = getUniqueColors(product.variants)
  const currentColor = selectedColor ?? (colors[0]?.code ?? null)
  const sizesForColor = currentColor ? getSizesForColor(product.variants, currentColor) : []
  const selectedVariant = (currentColor && selectedSize)
    ? findVariant(product.variants, currentColor, selectedSize)
    : null

  const images = [
    product.mainImage,
    ...(product.hoverImage ? [product.hoverImage] : []),
    ...product.variants.filter((v) => v.imageUrl).map((v) => v.imageUrl!),
  ].filter(Boolean)

  async function handleAddToCart() {
    if (!isAuth) { toast('Vui lòng đăng nhập để thêm vào giỏ', 'error'); return }
    if (!selectedVariant) { toast('Vui lòng chọn màu và size', 'error'); return }
    await addItem(selectedVariant.id, qty)
  }

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-brand-mid mb-8">
        <Link to={ROUTES.home} className="hover:text-brand-black transition-colors">Trang chủ</Link>
        <span>/</span>
        <Link to={ROUTES.shop} className="hover:text-brand-black transition-colors">Cửa hàng</Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              to={`${ROUTES.shop}?categoryId=${product.category.id}`}
              className="hover:text-brand-black transition-colors"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-brand-black truncate max-w-xs">{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
        {/* ── Left: Image gallery ── */}
        <div className="flex flex-col gap-4">
          {/* Main image */}
          <div className="relative aspect-[4/5] bg-brand-cream overflow-hidden">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            {/* Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              <DiscountBadge product={product} />
              {!product.active && (
                <Badge variant="error">Ngừng bán</Badge>
              )}
            </div>
            {/* Nav arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setActiveImage((i) => (i - 1 + images.length) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-brand-white/90 flex items-center justify-center hover:bg-brand-white transition-colors text-sm"
                >
                  ‹
                </button>
                <button
                  onClick={() => setActiveImage((i) => (i + 1) % images.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-brand-white/90 flex items-center justify-center hover:bg-brand-white transition-colors text-sm"
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-20 border-2 overflow-hidden transition-all duration-200 ${
                    i === activeImage ? 'border-brand-black' : 'border-transparent hover:border-brand-light'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Right: Product info ── */}
        <div className="flex flex-col gap-6 lg:py-4">
          {/* Category + name */}
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">
              {product.category?.name}
            </p>
            <h1 className="font-display text-4xl leading-tight">{product.name}</h1>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <StarRating value={product.ratingAvg} count={product.ratingCount} size="md" />
            <span className="text-sm text-brand-mid">{product.ratingAvg.toFixed(1)} / 5</span>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="font-display text-3xl">
              {formatPrice(product.effectivePrice)}
            </span>
            {product.salePrice && (
              <span className="text-brand-mid line-through text-lg">
                {formatPrice(product.basePrice)}
              </span>
            )}
          </div>

          {/* Divider */}
          <div className="h-px bg-brand-light" />

          {/* Color selector */}
          {colors.length > 0 && (
            <div className="flex flex-col gap-3">
              <p className="text-xs uppercase tracking-wider font-medium">
                Màu sắc:{' '}
                <span className="font-normal text-brand-mid normal-case tracking-normal">
                  {colors.find((c) => c.code === currentColor)?.name ?? ''}
                </span>
              </p>
              <div className="flex gap-2">
                {colors.map((c) => (
                  <ColorSwatch
                    key={c.code}
                    colorCode={c.code}
                    colorName={c.name}
                    selected={currentColor === c.code}
                    onClick={() => {
                      setSelectedColor(c.code)
                      setSelectedSize(null)
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size selector */}
          {sizesForColor.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-wider font-medium">
                  Kích cỡ:{' '}
                  <span className="font-normal text-brand-mid normal-case tracking-normal">
                    {selectedSize ?? 'Chưa chọn'}
                  </span>
                </p>
                <button className="text-xs text-brand-mid underline underline-offset-4 hover:text-brand-black transition-colors">
                  Hướng dẫn chọn size
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {sizesForColor.map((v) => (
                  <SizeButton
                    key={v.sizeCode}
                    size={v.sizeCode}
                    available={v.inStock}
                    selected={selectedSize === v.sizeCode}
                    onClick={() => setSelectedSize(v.sizeCode)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Quantity + stock info */}
          {selectedVariant && (
            <div className="flex items-center gap-6">
              <div className="flex items-center border border-brand-light">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-10 h-10 flex items-center justify-center text-brand-mid hover:text-brand-black disabled:opacity-30 transition-colors"
                >
                  −
                </button>
                <span className="w-12 text-center text-sm font-medium">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(selectedVariant.quantity, q + 1))}
                  disabled={qty >= selectedVariant.quantity}
                  className="w-10 h-10 flex items-center justify-center text-brand-mid hover:text-brand-black disabled:opacity-30 transition-colors"
                >
                  +
                </button>
              </div>
              <p className="text-xs text-brand-mid">
                Còn <strong>{selectedVariant.quantity}</strong> sản phẩm
              </p>
            </div>
          )}

          {/* Add to cart */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              size="lg"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={!product.active}
            >
              {!isAuth
                ? 'Đăng nhập để mua'
                : !selectedVariant
                ? 'Chọn màu & size'
                : 'Thêm vào giỏ hàng'}
            </Button>
            <Button size="lg" variant="secondary" className="flex-1">
              Mua ngay
            </Button>
          </div>

          {/* Features */}
          <ul className="flex flex-col gap-2 pt-2 border-t border-brand-light">
            {[
              '✓ Miễn phí vận chuyển cho đơn từ 500k',
              '✓ Đổi trả trong vòng 30 ngày',
              '✓ Cam kết hàng chính hãng 100%',
            ].map((f) => (
              <li key={f} className="text-xs text-brand-mid">{f}</li>
            ))}
          </ul>

          {/* Description */}
          {product.description && (
            <div className="pt-4 border-t border-brand-light">
              <h3 className="text-xs uppercase tracking-wider font-medium mb-3">Mô tả sản phẩm</h3>
              <p className="text-sm text-brand-charcoal leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Reviews section ── */}
      <section className="mt-20 pt-12 border-t border-brand-light">
        <h2 className="font-display text-3xl mb-10">Đánh giá từ khách hàng</h2>
        <ReviewList productId={product.id} />
      </section>
    </main>
  )
}
