import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { fetchProducts, fetchRootCategories } from '@features/catalog/api/catalogApi'
import { ProductCard, ProductCardSkeleton } from '@widgets/product-card'

export default function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null)

  const { data: newProducts, isLoading: loadingProducts } = useQuery({
    queryKey: ['products', 'home-featured'],
    queryFn:  () => fetchProducts({ page: 0, size: 8, sortBy: 'createdAt', sortDir: 'desc' }),
  })

  const { data: categories } = useQuery({
    queryKey: ['categories', 'roots'],
    queryFn:  fetchRootCategories,
  })

  // Lấy 1 sản phẩm đại diện cho mỗi category để lấy ảnh thực tế
  const { data: catProducts } = useQuery({
    queryKey: ['products', 'category-cover', categories?.map((c) => c.categoryId)],
    queryFn: async () => {
      const entries = await Promise.all(
        categories!.slice(0, 4).map(async (cat) => {
          const page = await fetchProducts({ categoryId: cat.categoryId, page: 0, size: 1 })
          const product = page.content[0]
          return [cat.categoryId, product?.mainImage ?? null] as [number, string | null]
        })
      )
      return Object.fromEntries(entries) as Record<number, string | null>
    },
    enabled: !!categories && categories.length > 0,
  })

  // Parallax on hero
  useEffect(() => {
    const el = heroRef.current
    if (!el) return
    const handler = () => {
      el.style.backgroundPositionY = `${window.scrollY * 0.4}px`
    }
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fallback nếu category chưa có sản phẩm
  const fallbackImages = [
    'https://images.unsplash.com/photo-1594938298603-c8148c4b4f35?w=600&q=80',
    'https://images.unsplash.com/photo-1503341338985-95447e4b4a2f?w=600&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=600&q=80',
    'https://images.unsplash.com/photo-1617952739408-e60af0c0e2e4?w=600&q=80',
  ]

  return (
    <main>
      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative h-[85vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-brand-black"
        style={{
          backgroundImage:
            'url(https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=80)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay */}
        <div className="absolute inset-0 bg-brand-black/50" />

        <div className="relative z-10 text-center text-brand-white flex flex-col items-center gap-8 px-6 animate-fade-up">
          <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold">Bộ sưu tập mới</p>
          <h1 className="font-display text-6xl sm:text-8xl font-light leading-none">
            Thời Trang<br />
            <em className="italic">Cao Cấp</em>
          </h1>
          <p className="text-sm text-brand-white/70 max-w-md leading-relaxed">
            Được chắt lọc từ những chất liệu tinh tế nhất — mỗi thiết kế là một câu chuyện về sự sang trọng và phong cách vượt thời gian.
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link to={ROUTES.shop}>
              <Button size="lg" className="bg-brand-white text-brand-black hover:bg-brand-gold hover:text-brand-black border-0">
                Khám phá ngay
              </Button>
            </Link>
            <Link to={`${ROUTES.shop}?sortBy=ratingAvg`}>
              <Button size="lg" variant="secondary" className="border-brand-white text-brand-white hover:bg-brand-white hover:text-brand-black">
                Bán chạy nhất
              </Button>
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-brand-white/40">
          <span className="text-[10px] uppercase tracking-widest">Cuộn xuống</span>
          <div className="w-px h-12 bg-brand-white/20 relative overflow-hidden">
            <div className="absolute top-0 w-full bg-brand-white/60 h-1/2 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Benefits strip ── */}
      <section className="bg-brand-cream border-y border-brand-light">
        <div className="container mx-auto px-6 max-w-screen-xl">
          <ul className="grid grid-cols-2 md:grid-cols-4 divide-x divide-brand-light">
            {[
              { icon: '✦', title: 'Miễn phí ship', desc: 'Đơn từ 500.000đ' },
              { icon: '↩', title: 'Đổi trả 30 ngày', desc: 'Không cần lý do' },
              { icon: '◈', title: 'Hàng chính hãng', desc: 'Cam kết 100%' },
              { icon: '◉', title: 'Hỗ trợ 24/7',    desc: 'Chat & hotline' },
            ].map((b) => (
              <li key={b.title} className="flex flex-col items-center gap-2 py-8 px-4 text-center">
                <span className="text-brand-gold text-lg">{b.icon}</span>
                <p className="text-xs font-medium uppercase tracking-wider">{b.title}</p>
                <p className="text-xs text-brand-mid">{b.desc}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Categories ── */}
      {categories && categories.length > 0 && (
        <section className="container mx-auto px-6 max-w-screen-xl py-20">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-3">Danh mục</p>
            <h2 className="font-display text-4xl">Khám phá bộ sưu tập</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((cat, i) => {
              const imgSrc = catProducts?.[cat.categoryId] ?? fallbackImages[i % fallbackImages.length]
              return (
                <Link
                  key={cat.categoryId}
                  to={`${ROUTES.shop}?categoryId=${cat.categoryId}`}
                  className="group relative overflow-hidden aspect-[3/4] bg-brand-cream"
                >
                  <img
                    src={imgSrc}
                    alt={cat.categoryName}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-brand-black/30 group-hover:bg-brand-black/50 transition-colors duration-300" />
                  <div className="absolute inset-0 flex items-end p-6">
                    <div>
                      <p className="font-display text-2xl text-brand-white">{cat.categoryName}</p>
                      <p className="text-xs uppercase tracking-widest text-brand-white/70 group-hover:text-brand-gold transition-colors mt-1">
                        Xem tất cả →
                      </p>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      )}

      {/* ── New arrivals ── */}
      <section className="container mx-auto px-6 max-w-screen-xl py-20">
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-3">Mới nhất</p>
            <h2 className="font-display text-4xl">Sản phẩm mới về</h2>
          </div>
          <Link
            to={ROUTES.shop}
            className="text-xs uppercase tracking-widest text-brand-mid hover:text-brand-black transition-colors underline underline-offset-4"
          >
            Xem tất cả
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loadingProducts
            ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
            : newProducts?.content.map((p) => <ProductCard key={p.id} product={p} />)
          }
        </div>
      </section>

      {/* ── Full-width editorial banner ── */}
      <section className="relative h-[50vh] min-h-[400px] overflow-hidden bg-brand-charcoal flex items-center">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=1600&q=80"
          alt="Editorial"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
        />
        <div className="relative z-10 container mx-auto px-6 max-w-screen-xl">
          <div className="max-w-lg">
            <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-4">Ưu đãi đặc biệt</p>
            <h2 className="font-display text-5xl text-brand-white font-light mb-6">
              Sale đến<br />
              <span className="text-brand-gold">50%</span>
            </h2>
            <p className="text-sm text-brand-white/70 mb-8 leading-relaxed">
              Hàng trăm mẫu thiết kế cao cấp đang chờ bạn. Số lượng có hạn — đừng bỏ lỡ.
            </p>
            <Link to={`${ROUTES.shop}?sortBy=basePrice&sortDir=asc`}>
              <Button
                size="lg"
                className="bg-brand-gold text-brand-black border-0 hover:bg-brand-white"
              >
                Mua ngay
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}