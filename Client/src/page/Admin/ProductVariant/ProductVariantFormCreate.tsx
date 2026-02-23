import { useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { ProductVariantService } from "../../../Service/ProductVariantService";
import type { ProductVariantCreateRequest } from "../../../type/ProductVariant/ProductVariantCreateRequest";

// Import services to fetch products, colors, sizes for dropdowns
import { ProductService } from "../../../Service/ProductService";
import { ColorService } from "../../../Service/ColorService";
import { SizeService } from "../../../Service/SizeService";

interface ProductVariantFormCreateProps {
  onSuccess?: () => void;
}

function ProductVariantFormCreate({
  onSuccess,
}: ProductVariantFormCreateProps) {

  // ✅ Khai báo loading
  const [loading, setLoading] = useState(false);

  const fields: FormField<ProductVariantCreateRequest>[] = [
    {
      name: "productId",
      label: "Sản phẩm",
      type: "select",
      loadOptions: async () => {
        const products = await ProductService.getProductSelectOptions();
        return products.map((product) => ({
          value: product.value,
          label: product.label,
        }));
      },
      placeholder: "Chọn sản phẩm",
      required: true,
    },
    {
      name: "colorCode",
      label: "Màu sắc",
      type: "select",
      loadOptions: () => ColorService.getColorSelectOptions(),
      placeholder: "Chọn màu",
      required: true,
    },
    {
      name: "sizeId",
      label: "Kích cỡ",
      type: "select",
      loadOptions: () => SizeService.getSizeSelectOptions(),
      placeholder: "Chọn size",
      required: true,
    },
    {
      name: "quantity",
      label: "Số lượng",
      type: "number",
      placeholder: "Nhập số lượng",
      required: true,
    },
    {
      name: "img",
      label: "URL hình ảnh",
      type: "image",
      placeholder: "Nhập URL hình ảnh",
      required: true,
    },
  ];

  // ✅ Sử dụng loading khi submit
  const handleSubmit = async (data: ProductVariantCreateRequest) => {
    try {
      setLoading(true);

      await ProductVariantService.createProductVariant({
        quantity: data.quantity,
        img: data.img,
        productId: data.productId,
        colorCode: data.colorCode,
        sizeId: data.sizeId,
      });

    } finally {
      setLoading(false);
    }
  };

  // ✅ Hiển thị spinner khi đang submit
  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Đang xử lý...</p>
      </div>
    );
  }

  return (
    <DynamicForm<ProductVariantCreateRequest>
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo biến thể sản phẩm thành công"
      onSuccess={onSuccess}
    />
  );
}

export default ProductVariantFormCreate;
