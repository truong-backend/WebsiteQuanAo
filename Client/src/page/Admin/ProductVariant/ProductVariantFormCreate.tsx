import { useEffect, useState } from "react";
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

function ProductVariantFormCreate({ onSuccess }: ProductVariantFormCreateProps) {
  const [products, setProducts] = useState<Array<{ value: string; label: string }>>([]);
  const [colors, setColors] = useState<Array<{ value: string; label: string }>>([]);
  const [sizes, setSizes] = useState<Array<{ value: string; label: string }>>([]);
  const [loading, setLoading] = useState(true);

  // Fetch dropdown options on mount
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);

        // Fetch products, colors, sizes
        const [productsData, colorsData, sizesData] = await Promise.all([
          ProductService.getProductsPaged(0, 100), // Get first 100 products
          ColorService.getColorsPaged(0, 100),
          SizeService.getSizesPaged(0, 100),
        ]);

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
        console.error("Error fetching options:", err);
        alert("Không thể tải dữ liệu dropdown");
      } finally {
        setLoading(false);
      }
    };

    fetchOptions();
  }, []);

  const fields: FormField<ProductVariantCreateRequest>[] = [
    {
      name: "id",
      label: "ID (tùy chọn)",
      type: "text",
      placeholder: "Để trống để tự động tạo UUID",
      required: false,
    },
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

  const handleSubmit = async (data: ProductVariantCreateRequest) => {
    await ProductVariantService.createProductVariant({
      id: data.id || undefined, // Convert empty string to undefined
      quantity: data.quantity,
      img: data.img,
      productId: data.productId,
      colorCode: data.colorCode,
      sizeId: data.sizeId,
    });
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
        <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
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