export interface ProductCreateRequest extends Record<string, unknown> {
  name: string;
  description: string;
  price: number;
  path: string;
  img: string;
  hoverImg?: string;
  productTypeId: number;
}