import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField, SelectOption } from "../../../Components/Admin/Form/DynamicForm";
import { categoryService } from "../../../Service/categoryService";

interface CategoryFormUpdateProps {
  id: number;
  onSuccess?: () => void;
}

interface CategoryUpdate  extends Record<string, unknown> {
  categoryName: string;
  parentCategoryId: number | null;
}

function CategoryFormUpdate({ id, onSuccess }: CategoryFormUpdateProps) {
  const [initialData, setInitialData] = useState<CategoryUpdate | null>(null);

  const fields: FormField<CategoryUpdate>[] = [
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
      loadOptions: () => categoryService.getCategorySelectOptions() as Promise<SelectOption[]>
    },
  ];

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const category = await categoryService.getCategoryById(id);

        setInitialData({
          categoryName: category.categoryName,
          parentCategoryId: category.parentCategoryId ?? null
        });
      } catch (err) {
        console.error("Error fetching category:", err);
        alert("Không thể tải dữ liệu danh mục");
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (data: CategoryUpdate) => {
    await categoryService.updateCategory(id, {
      categoryName: data.categoryName,
      parentCategoryId: data.parentCategoryId,
    });
  };

  if (!initialData) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <DynamicForm<CategoryUpdate>
      fields={fields}
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      successMessage="Cập nhật danh mục thành công"
      onSuccess={onSuccess}
    />
  );
}

export default CategoryFormUpdate;