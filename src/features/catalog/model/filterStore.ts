import { create } from 'zustand'
import type { ProductFilterDto } from '@shared/types'

interface FilterState extends ProductFilterDto {
  setFilter:   (patch: Partial<ProductFilterDto>) => void
  resetFilter: () => void
}

const defaultFilter: ProductFilterDto = {
  page:    0,
  size:    12,
  sortBy:  'createdAt',
  sortDir: 'desc',
}

export const useFilterStore = create<FilterState>()((set) => ({
  ...defaultFilter,

  setFilter: (patch) =>
    set((s) => ({ ...s, ...patch, page: patch.page ?? 0 })),

  resetFilter: () => set({ ...defaultFilter }),
}))
