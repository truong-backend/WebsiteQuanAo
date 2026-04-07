import { useState, useEffect } from 'react'
import { cn } from '@shared/lib'
import { Input, Select, Spinner } from '@shared/ui'
import { useFilterStore } from '@features/catalog/model/filterStore'
import { fetchCategories } from '@features/catalog/api/catalogApi'
import { fetchActiveColors, fetchActiveSizes } from '@features/admin/api/adminApi'
import { flattenCategories } from '@entities/category/model'
import type { Category, ColorDto, SizeDto } from '@shared/types'

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Mới nhất' },
  { value: 'createdAt_asc',  label: 'Cũ nhất' },
  { value: 'basePrice_asc',  label: 'Giá thấp → cao' },
  { value: 'basePrice_desc', label: 'Giá cao → thấp' },
  { value: 'name_asc',       label: 'Tên A → Z' },
]

export function FilterBar() {
  const filter = useFilterStore()
  const [cats,   setCats]   = useState<Category[]>([])
  const [colors, setColors] = useState<ColorDto[]>([])
  const [sizes,  setSizes]  = useState<SizeDto[]>([])
  const [priceMin, setPriceMin] = useState('')
  const [priceMax, setPriceMax] = useState('')
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    Promise.all([
      fetchCategories(),
      fetchActiveColors(),
      fetchActiveSizes(),
    ]).then(([catData, colorData, sizeData]) => {
      setCats(flattenCategories(catData))
      setColors(colorData.filter((c) => c.active))
      setSizes(sizeData.filter((s) => s.active).sort((a, b) => a.sortOrder - b.sortOrder))
    }).finally(() => setLoading(false))
  }, [])

  const catOptions = [
    { value: '', label: 'Tất cả danh mục' },
    ...cats.map((c) => ({ value: String(c.categoryId), label: c.categoryName })),
  ]

  function handleSort(v: string) {
    const [sortBy, sortDir] = v.split('_') as [typeof filter.sortBy, 'asc' | 'desc']
    filter.setFilter({ sortBy, sortDir })
  }

  function handlePriceApply() {
    filter.setFilter({
      minPrice: priceMin ? Number(priceMin) * 1000 : undefined,
      maxPrice: priceMax ? Number(priceMax) * 1000 : undefined,
    })
  }

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>

  return (
    <div className="flex flex-col gap-6">
      {/* Search */}
      <Input
        placeholder="Tìm kiếm sản phẩm..."
        value={filter.search ?? ''}
        onChange={(e) => filter.setFilter({ search: e.target.value || undefined })}
      />

      {/* Category */}
      <Select
        label="Danh mục"
        options={catOptions}
        value={filter.categoryId ? String(filter.categoryId) : ''}
        onChange={(e) => filter.setFilter({
          categoryId: e.target.value ? Number(e.target.value) : undefined,
        })}
      />

      {/* Sort */}
      <Select
        label="Sắp xếp"
        options={SORT_OPTIONS}
        value={`${filter.sortBy ?? 'createdAt'}_${filter.sortDir ?? 'desc'}`}
        onChange={(e) => handleSort(e.target.value)}
      />

      {/* Price range */}
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">
          Khoảng giá (nghìn đồng)
        </p>
        <div className="flex gap-2 items-center">
          <input type="number" placeholder="Từ" value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black transition-colors" />
          <span className="text-brand-mid">—</span>
          <input type="number" placeholder="Đến" value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full border border-brand-light px-3 py-2 text-sm focus:outline-none focus:border-brand-black transition-colors" />
        </div>
        <button onClick={handlePriceApply}
          className="text-xs uppercase tracking-wider border border-brand-black py-2 hover:bg-brand-black hover:text-brand-white transition-colors">
          Áp dụng
        </button>
      </div>

      {/* Colors — từ backend */}
      {colors.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">Màu sắc</p>
          <div className="flex flex-wrap gap-2">
            {colors.map((c) => (
              <button
                key={c.code}
                title={c.name}
                onClick={() => filter.setFilter({
                  colorCode: filter.colorCode === c.code ? undefined : c.code,
                })}
                className={cn(
                  'w-7 h-7 rounded-full border-2 transition-all duration-200',
                  c.code === '#FFFFFF' || c.code === '#ffffff' ? 'border-brand-light' : '',
                  filter.colorCode === c.code
                    ? 'border-brand-black scale-110'
                    : 'border-transparent hover:border-brand-mid',
                )}
                style={{ backgroundColor: c.code }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Sizes — từ backend */}
      {sizes.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">Kích cỡ</p>
          <div className="flex flex-wrap gap-2">
            {sizes.map((s) => (
              <button
                key={s.code}
                onClick={() => filter.setFilter({
                  sizeCode: filter.sizeCode === s.code ? undefined : s.code,
                })}
                className={cn(
                  'w-10 h-10 text-xs font-medium border transition-all duration-200',
                  filter.sizeCode === s.code
                    ? 'bg-brand-black text-brand-white border-brand-black'
                    : 'border-brand-light hover:border-brand-black text-brand-charcoal',
                )}
              >
                {s.code}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Reset */}
      <button
        onClick={() => { filter.resetFilter(); setPriceMin(''); setPriceMax('') }}
        className="text-xs uppercase tracking-wider text-brand-mid hover:text-red-500 transition-colors underline underline-offset-4">
        Xóa bộ lọc
      </button>
    </div>
  )
}