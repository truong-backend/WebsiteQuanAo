import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField, SelectOption } from "../../../Components/Admin/Form/DynamicForm";
import { ProductService } from "../../../Service/ProductService";
import { categoryService } from "../../../Service/categoryService";
import type { ProductCreateRequest } from "../../../type/product/ProductCreateRequest";

const fields: FormField<ProductCreateRequest>[] = [
  {
    name: "name",
    label: "Tên sản phẩm",
    type: "text",
    required: true,
    placeholder: "Nhập tên sản phẩm",
  },
  {
    name: "description",
    label: "Mô tả",
    type: "textarea",
    required: true,
    placeholder: "Nhập mô tả sản phẩm",
  },
  {
    name: "price",
    label: "Giá",
    type: "number",
    required: true,
    placeholder: "Nhập giá sản phẩm",
  },
  {
    name: "path",
    label: "Đường dẫn",
    type: "text",
    required: true,
    placeholder: "vd: /san-pham/ao-thun-nam",
  },
  {
    name: "img",
    label: "Hình ảnh chính",
    type: "image",
    required: true,
  },
  {
    name: "hoverImg",
    label: "Hình ảnh hover",
    type: "image",
    uploadType: "product",
  },
  {
    name: "categoryId",
    label: "Danh mục sản phẩm",
    type: "select",
    required: true,
    loadOptions: () => categoryService.getCategorySelectOptions() as Promise<SelectOption[]>

  },
];

function ProductFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  const handleSubmit = async (data: ProductCreateRequest) => {
    await ProductService.createProduct(data);
  };

  return (
    <DynamicForm
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo sản phẩm thành công"
      onSuccess={onSuccess}
    />
  );
}

export default ProductFormCreate;
