import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { ProductVariantService } from "../../../Service/ProductVariantService";
import type { ProductVariantUpdateRequest } from "../../../type/ProductVariant/ProductVariantUpdateRequest";

// Import services to fetch products, colors, sizes for dropdowns
import { ProductService } from "../../../Service/ProductService";
import { ColorService } from "../../../Service/ColorService";
import { SizeService } from "../../../Service/SizeService";
import type { SelectOption } from "../../../Components/Admin/Form/DynamicForm";

interface ProductVariantFormUpdateProps {
  id: string;
  onSuccess?: () => void;
}

function ProductVariantFormUpdate({ id, onSuccess }: ProductVariantFormUpdateProps) {
  const [initialData, setInitialData] = useState<ProductVariantUpdateRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fields: FormField<ProductVariantUpdateRequest>[] = [
    {
      name: "productId",
      label: "Sản phẩm",
      type: "select",
      loadOptions: () => ProductService.getProductSelectOptions() as Promise<SelectOption[]>,
      placeholder: "Chọn sản phẩm",
      required: true,
    },
    {
      name: "colorCode",
      label: "Màu sắc",
      type: "select",
      loadOptions: () => ColorService.getColorSelectOptions() as Promise<SelectOption[]>,
      placeholder: "Chọn màu",
      required: true,
    },
    {
      name: "sizeId",
      label: "Kích cỡ",
      type: "select",
      loadOptions: () => SizeService.getSizeSelectOptions() as Promise<SelectOption[]>,
      placeholder: "Chọn size",
      required: true,
    },
    {
      name: "quantity",
      label: "Số lượng",
      type: "number",
      placeholder: "Nhập số lượng",
      required: true,
      // min: 0,
    },
    {
      name: "img",
      label: "URL hình ảnh",
      type: "image",
      placeholder: "Nhập URL hình ảnh",
      required: true,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch variant data and dropdown options in parallel
        const [variant] = await Promise.all([
          ProductVariantService.getProductVariantById(id),
        ]);

        if (!variant) return;

        setInitialData({
          quantity: variant.quantity,
          img: variant.img,
          productId: variant.productId,
          colorCode: variant.colorCode,
          sizeId: variant.sizeId,
        });
      } catch (err) {
        console.error("Error fetching data:", err);
        alert("Không thể tải dữ liệu biến thể sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSubmit = async (data: ProductVariantUpdateRequest) => {
    await ProductVariantService.updateProductVariant(id, data);
  };

  if (loading || !initialData) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <DynamicForm<ProductVariantUpdateRequest>
      fields={fields}
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      successMessage="Cập nhật biến thể sản phẩm thành công"
      onSuccess={onSuccess}
    />
  );
}

export default ProductVariantFormUpdate;