// src/pages/Admin/Product/ProductFormUpdate.tsx
import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { ProductService } from "../../../Service/ProductService";
import type { ProductUpdateRequest } from "../../../type/product/ProductUpdateRequest";

interface ProductFormUpdateProps {
  id: string;
  onSuccess?: () => void;
}

function ProductFormUpdate({ id, onSuccess }: ProductFormUpdateProps) {
  const [initialData, setInitialData] = useState<ProductUpdateRequest | null>(null);
  const [loading, setLoading] = useState(true);

  const fields: FormField<ProductUpdateRequest>[] = [
    {
      name: "name",
      label: "Tên sản phẩm",
      type: "text",
      placeholder: "Nhập tên sản phẩm",
      required: true,
    },
    {
      name: "description",
      label: "Mô tả",
      type: "textarea",
      placeholder: "Nhập mô tả sản phẩm",
      required: true,
    },
    {
      name: "price",
      label: "Giá",
      type: "number",
      placeholder: "Nhập giá sản phẩm",
      required: true,
    },
    {
      name: "path",
      label: "Đường dẫn",
      type: "text",
      placeholder: "Nhập đường dẫn (path)",
      required: true,
    },
    {
      name: "img",
      label: "URL hình ảnh",
      type: "text",
      placeholder: "Nhập URL hình ảnh chính",
      required: true,
    },
    {
      name: "hoverImg",
      label: "URL hình ảnh hover",
      type: "text",
      placeholder: "Nhập URL hình ảnh hover (tùy chọn)",
    },
    {
      name: "productTypeId",
      label: "Loại sản phẩm",
      type: "number",
      placeholder: "Nhập ID loại sản phẩm",
      required: true,
    },
  ];

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const product = await ProductService.getById(id);

        if (!product) return;

        setInitialData({
          name: product.name,
          description: product.description,
          price: product.price,
          path: product.path,
          img: product.img,
          hoverImg: product.hoverImg,
          productTypeId: product.productTypeId,
        });
      } catch (err) {
        console.error("Error fetching product:", err);
        alert("Không thể tải dữ liệu sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleSubmit = async (data: ProductUpdateRequest) => {
    await ProductService.updateProduct(id, data);
  };

  if (loading) {
    return <div className="text-center py-4">Đang tải dữ liệu...</div>;
  }

  if (!initialData) {
    return <div className="text-center py-4 text-red-600">Không tìm thấy sản phẩm</div>;
  }

  return (
    <DynamicForm
      fields={fields}
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      successMessage="Cập nhật sản phẩm thành công"
      onSuccess={onSuccess}
    />
  );
}

export default ProductFormUpdate;