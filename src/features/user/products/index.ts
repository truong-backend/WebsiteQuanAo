// src/features/products/index.ts
export { ProductService }                from './services/productService';
export { productApi }                    from './api/productApi';
export { useProductListing }             from './hooks/useProductListing';
export type {
  ProductResponse,
  ProductResponsePageResponse,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductListItem,
  ProductDetailResponse,
  ProductFilter,
  ProductOption,
  ColorDto,
  SizeDto,
  VariantDto,
}                                        from './types/product.types';
export { default as ProductListingPage } from './components/ProductListingPage';
export { default as ProductDetailPage }  from './components/ProductDetailPage';
export { default as ProductCard }        from './components/ProductCard';
