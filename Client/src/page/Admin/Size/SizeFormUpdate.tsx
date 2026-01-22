import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { SizeService } from "../../../Service/SizeService";
import type { SizeUpdateRequest } from "../../../type/size/SizeUpdateRequest";

interface SizeFormUpdateProps {
  id: string;
  onSuccess?: () => void;
}

function SizeFormUpdate({ id, onSuccess }: SizeFormUpdateProps) {
  const [initialData, setInitialData] = useState<SizeUpdateRequest | null>(null);

  const fields: FormField<SizeUpdateRequest>[] = [
    {
      name: "id",
      label: "Mã kích cỡ",
      type: "text",
      placeholder: "Nhập mã kích cỡ",
      required: true,
    },
    {
      name: "name",
      label: "Tên kích cỡ",
      type: "text",
      placeholder: "Nhập tên kích cỡ",
    },
  ];

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const size = await SizeService.getSizeById(id); // ← Dùng id

        if (!size) return;

        setInitialData({
          name: size.name,
          id: size.id,
        });
      } catch (err) {
        console.error("Error fetching size:", err);
        alert("Không thể tải dữ liệu kích cỡ");
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (data: SizeUpdateRequest) => {
    await SizeService.updateSize(id, data);
  };

  if (!initialData) {
    return <div>Đang tải dữ liệu...</div>;
  }

  return (
    <DynamicForm
      fields={fields}
      mode="update"
      initialData={initialData}
      onSubmit={handleSubmit}
      successMessage="Cập nhật danh mục thành công"
      onSuccess={onSuccess}
    />
  );
}

export default SizeFormUpdate;
