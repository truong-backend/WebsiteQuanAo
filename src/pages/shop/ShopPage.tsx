import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@shared/lib'
// import { Spinner, EmptyState } from '@shared/ui'
import { EmptyState } from '@shared/ui'
import { fetchProducts } from '@features/catalog/api/catalogApi'
import { useFilterStore } from '@features/catalog/model/filterStore'
import { ProductCard, ProductCardSkeleton } from '@widgets/product-card'
import { FilterBar } from '@widgets/filter-bar'

export default function ShopPage() {
  const [searchParams]    = useSearchParams()
  const [sidebarOpen, setSidebar] = useState(false)
  const filter            = useFilterStore()

  // Sync URL params → filter store mỗi khi searchParams thay đổi
  // (bao gồm cả khi user click category trên navbar từ trong /shop)
  useEffect(() => {
    const catId  = searchParams.get('categoryId')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy')

    filter.resetFilter()                          // reset trước để tránh stale filter

    const patch: Parameters<typeof filter.setFilter>[0] = {}
    if (catId)  patch.categoryId = Number(catId)
    if (search) patch.search     = search
    if (sortBy) patch.sortBy     = sortBy as typeof filter.sortBy
    if (Object.keys(patch).length) filter.setFilter(patch)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['products', 'shop', filter],
    queryFn:  () => fetchProducts(filter),
    placeholderData: (prev) => prev,
  })

  const totalResults = data?.totalElements ?? 0

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">Cửa hàng</p>
        <div className="flex items-center justify-between">
          <h1 className="font-display text-4xl">
            {filter.search ? `Kết quả: "${filter.search}"` : 'Tất cả sản phẩm'}
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-xs text-brand-mid">
              {isLoading ? '...' : `${totalResults} sản phẩm`}
            </span>
            {/* Mobile filter toggle */}
            <button
              onClick={() => setSidebar(!sidebarOpen)}
              className="lg:hidden flex items-center gap-2 text-xs uppercase tracking-wider border border-brand-light px-4 py-2 hover:border-brand-black transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z" />
              </svg>
              Bộ lọc
            </button>
          </div>
        </div>
      </div>

      <div className="flex gap-10">
        {/* Sidebar — desktop always visible, mobile overlay */}
        <aside
          className={cn(
            'lg:block lg:w-64 lg:flex-shrink-0',
            // Mobile: fixed overlay
            'fixed lg:static inset-y-0 left-0 z-40 w-72 bg-brand-white lg:bg-transparent',
            'overflow-y-auto lg:overflow-visible',
            'transition-transform duration-300 lg:transform-none',
            sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0',
            'p-6 lg:p-0',
          )}
        >
          {/* Mobile close */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h2 className="font-display text-xl">Bộ lọc</h2>
            <button onClick={() => setSidebar(false)} className="text-brand-mid">✕</button>
          </div>
          <FilterBar />
        </aside>

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-30 bg-brand-black/40 lg:hidden"
            onClick={() => setSidebar(false)}
          />
        )}

        {/* Products grid */}
        <div className="flex-1 min-w-0">
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {Array.from({ length: 12 }).map((_, i) => <ProductCardSkeleton key={i} />)}
            </div>
          ) : !data || data.content.length === 0 ? (
            <EmptyState
              icon="🔍"
              title="Không tìm thấy sản phẩm"
              description="Thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác"
            />
          ) : (
            <>
              <div
                className={cn(
                  'grid grid-cols-2 md:grid-cols-3 gap-6 transition-opacity duration-300',
                  isFetching && 'opacity-60',
                )}
              >
                {data.content.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>

              {/* Pagination */}
              {data.totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-12">
                  <button
                    disabled={data.first}
                    onClick={() => filter.setFilter({ page: (filter.page ?? 0) - 1 })}
                    className="w-10 h-10 border border-brand-light flex items-center justify-center hover:border-brand-black disabled:opacity-30 transition-colors text-sm"
                  >
                    ‹
                  </button>

                  {Array.from({ length: data.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => filter.setFilter({ page: i })}
                      className={cn(
                        'w-10 h-10 border text-xs transition-colors',
                        i === data.number
                          ? 'bg-brand-black text-brand-white border-brand-black'
                          : 'border-brand-light hover:border-brand-black',
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    disabled={data.last}
                    onClick={() => filter.setFilter({ page: (filter.page ?? 0) + 1 })}
                    className="w-10 h-10 border border-brand-light flex items-center justify-center hover:border-brand-black disabled:opacity-30 transition-colors text-sm"
                  >
                    ›
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  )
}