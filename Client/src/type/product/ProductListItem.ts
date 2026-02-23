export interface ProductListItem {
  id: string;
  name: string;
  price: number;
  img: string;
  categoryId: number;
  categoryName: string;
  description?: string;
}