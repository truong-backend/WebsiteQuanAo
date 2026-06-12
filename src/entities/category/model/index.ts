import type { Category } from '@shared/types'

export type { Category }

/** Flatten tất cả categories (root + children) thành 1 list phẳng */
export function flattenCategories(cats: Category[]): Category[] {
  return cats.flatMap((c) => [c, ...(c.childCategories ?? [])])
}
