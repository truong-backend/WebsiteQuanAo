export interface CategoryCreateAndUpdateRequest extends Record<string, unknown> {
  categoryName: string;
  parentCategoryId: number | null;
}
