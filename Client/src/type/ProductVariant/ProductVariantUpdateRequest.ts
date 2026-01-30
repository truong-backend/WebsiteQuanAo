export interface ProductVariantUpdateRequest extends Record<string, unknown> {
  quantity: number;
  img: string;
  productId: string;
  colorCode: string;
  sizeId: string;
}