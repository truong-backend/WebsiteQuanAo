// src/type/product/ProductDetailResponse.ts

export interface ColorDto {
  code: string;
  name: string;
}

export interface SizeDto {
  id: string;
  name: string;
}

export interface VariantDto {
  id: string;
  colorCode: string;
  sizeId: string;
  quantity: number;
  img: string;
}

export interface ProductDetailResponse {
  id: string;
  name: string;
  description: string;
  price: number;
  salePrice: number | null;
  img: string;
  hoverImg: string | null;
  rating: number | null;
  ratingCount: number | null;
  categoryId: number;
  categoryName: string;
  colors: ColorDto[];
  sizes: SizeDto[];
  variants: VariantDto[];
}