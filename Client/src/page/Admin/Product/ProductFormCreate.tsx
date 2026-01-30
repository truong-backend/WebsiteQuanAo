// src/pages/Admin/Product/ProductFormCreate.tsx
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { ProductService } from "../../../Service/ProductService";
import type { ProductCreateRequest } from "../../../type/product/ProductCreateRequest";

const fields: FormField<ProductCreateRequest>[] = [
  { 
    name: "name", 
    label: "Tên sản phẩm", 
    type: "text", 
    required: true,
    placeholder: "Nhập tên sản phẩm"
  },
  { 
    name: "description", 
    label: "Mô tả", 
    type: "textarea", 
    required: true,
    placeholder: "Nhập mô tả sản phẩm"
  },
  { 
    name: "price", 
    label: "Giá", 
    type: "number", 
    required: true,
    placeholder: "Nhập giá sản phẩm"
  },
  { 
    name: "path", 
    label: "Đường dẫn", 
    type: "text", 
    required: true,
    placeholder: "Nhập đường dẫn (path)"
  },
  { 
    name: "img", 
    label: "URL hình ảnh", 
    type: "text", 
    required: true,
    placeholder: "Nhập URL hình ảnh chính"
  },
  { 
    name: "hoverImg", 
    label: "URL hình ảnh hover", 
    type: "text",
    placeholder: "Nhập URL hình ảnh hover (tùy chọn)"
  },
  { 
    name: "productTypeId", 
    label: "Loại sản phẩm", 
    type: "number", 
    required: true,
    placeholder: "Nhập ID loại sản phẩm"
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