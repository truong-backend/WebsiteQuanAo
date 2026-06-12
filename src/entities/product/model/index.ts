import type { ProductListDto, ProductDetailDto, VariantDto } from '@shared/types'

export type { ProductListDto, ProductDetailDto, VariantDto }

export function getEffectivePrice(p: Pick<ProductListDto, 'basePrice' | 'salePrice'>): number {
  return p.salePrice ?? p.basePrice
}

export function hasDiscount(p: Pick<ProductListDto, 'basePrice' | 'salePrice'>): boolean {
  return p.salePrice !== null && p.salePrice < p.basePrice
}

export function discountPercent(p: Pick<ProductListDto, 'basePrice' | 'salePrice'>): number {
  if (!p.salePrice) return 0
  return Math.round(((p.basePrice - p.salePrice) / p.basePrice) * 100)
}

/** Lấy unique colors từ variants */
export function getUniqueColors(variants: VariantDto[]) {
  const map = new Map<string, string>()
  for (const v of variants) map.set(v.colorCode, v.colorName)
  return Array.from(map.entries()).map(([code, name]) => ({ code, name }))
}

/** Lấy sizes available cho 1 color cụ thể */
export function getSizesForColor(variants: VariantDto[], colorCode: string) {
  return variants.filter((v) => v.colorCode === colorCode)
}

/** Tìm variant theo color + size */
export function findVariant(variants: VariantDto[], colorCode: string, sizeCode: string) {
  return variants.find((v) => v.colorCode === colorCode && v.sizeCode === sizeCode) ?? null
}
