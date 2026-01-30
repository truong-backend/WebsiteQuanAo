export interface ProductUpdateRequest extends Record<string, unknown> {
  name: string;
  description: string;
  price: number;
  path: string;
  img: string;
  hoverImg?: string;
  productTypeId: number;
}