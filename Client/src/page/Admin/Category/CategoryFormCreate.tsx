import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { categoryService } from "../../../Service/categoryService";
import type { CategoryCreateAndUpdateRequest } from "../../../type/categotry/CategoryCreateAndUpdateRequest";

interface CategoryFormCreateProps {
  onSuccess?: () => void;
}

function CategoryFormCreate({ onSuccess }: CategoryFormCreateProps) {
  const fields: FormField<CategoryCreateAndUpdateRequest>[] = [
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
      loadOptions: () => categoryService.getCategorySelectOptions()
    },
  ];

  const handleSubmit = async (data: CategoryCreateAndUpdateRequest) => {
    await categoryService.createCategory({
      categoryName: data.categoryName,
      parentCategoryId: data.parentCategoryId,
    });
  };

  return (
    <DynamicForm<CategoryCreateAndUpdateRequest>
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo danh mục thành công"
      onSuccess={onSuccess}
    />
  );
}

export default CategoryFormCreate;
