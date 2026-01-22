import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { categoryService } from "../../../Service/categoryService";

interface CategoryFormCreateProps {
  onSuccess?: () => void;
}

interface CategoryCreate extends Record<string, unknown> {
  categoryName: string;
  parentCategoryId: number | null;
}
function CategoryFormCreate({ onSuccess }: CategoryFormCreateProps) {
  const fields: FormField<CategoryCreate>[] = [
    {
      name: "categoryName",
      label: "Tên danh mục",
      type: "text",
      placeholder: "Nhập tên danh mục",
      required: true,
    },
    {
      name: "parentCategoryId",
      label: "Danh mục cha",
      type: "select",
      loadOptions: async () => {
        const categories = await categoryService.getAllCategoryOptions();
        return categories.map((c) => ({
          value: c.categoryId,
          label: c.categoryName,
          key: c.categoryId.toString(),
        }));
      },
    },
  ];

  const handleSubmit = async (data: CategoryCreate) => {
    await categoryService.createCategory({
      categoryName: data.categoryName,
      parentCategoryId: data.parentCategoryId
    });
  };

  return (
    <DynamicForm<CategoryCreate>
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo danh mục thành công"
      onSuccess={onSuccess} 
    />
  );
}

export default CategoryFormCreate;