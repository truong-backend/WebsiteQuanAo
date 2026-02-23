export interface ProductVariantCreateRequest extends Record<string, unknown> {
  // id?: string; 
  quantity: number;
  img: string;
  productId: string;
  colorCode: string;
  sizeId: string;
}