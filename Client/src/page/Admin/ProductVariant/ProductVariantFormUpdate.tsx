import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { ProductVariantService } from "../../../Service/ProductVariantService";
import type { ProductVariantUpdateRequest } from "../../../type/ProductVariant/ProductVariantUpdateRequest";

// Import services to fetch products, colors, sizes for dropdowns
import { ProductService } from "../../../Service/ProductService";
import { ColorService } from "../../../Service/ColorService";
import { SizeService } from "../../../Service/SizeService";

interface ProductVariantFormUpdateProps {
  id: string;
  onSuccess?: () => void;
}

function ProductVariantFormUpdate({ id, onSuccess }: ProductVariantFormUpdateProps) {
  const [initialData, setInitialData] = useState<ProductVariantUpdateRequest | null>(null);
  const [products, setProducts] = useState<Array<{ value: string; label: string }>>([]);
  const [colors, setColors] = useState<Array<{ value: string; label: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);

  const fields: FormField<ProductVariantUpdateRequest>[] = [
    {
      name: "productId",
      label: "Sản phẩm",
      type: "select",
      options: products,
      placeholder: "Chọn sản phẩm",
      required: true,
    },
    {
      name: "colorCode",
      label: "Màu sắc",
      type: "select",
      options: colors,
      placeholder: "Chọn màu",
      required: true,
    },
    {
      name: "sizeId",
      label: "Kích cỡ",
      type: "select",
      options: sizes,
      placeholder: "Chọn size",
      required: true,
    },
    {
      name: "quantity",
      label: "Số lượng",
      type: "number",
      placeholder: "Nhập số lượng",
      required: true,
      min: 0,
    },
    {
      name: "img",
      label: "URL hình ảnh",
      type: "text",
      placeholder: "Nhập URL hình ảnh",
      required: true,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch variant data and dropdown options in parallel
        const [variant, productsData, colorsData, sizesData] = await Promise.all([
          ProductVariantService.getProductVariantById(id),
          ProductService.getProductsPaged(0, 100),
          ColorService.getColorsPaged(0, 100),
          SizeService.getSizesPaged(0, 100),
        ]);

        if (!variant) return;

        setInitialData({
          quantity: variant.quantity,
          img: variant.img,
          productId: variant.productId,
          colorCode: variant.colorCode,
          sizeId: variant.sizeId,
        });

        setProducts(
          productsData.content.map((p) => ({
            value: p.id,
            label: p.name,
          }))
        );

        setColors(
          colorsData.content.map((c) => ({
            value: c.code,
            label: c.name,
          }))
        );

        setSizes(
          sizesData.content.map((s) => ({
            value: s.id,
            label: s.name,
          }))
        );
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