import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { ColorService } from "../../../Service/ColorService";
import type { SizeUpdateRequest } from "../../../type/size/SizeUpdateRequest";

interface ColorFormUpdateProps {
  id: string;
  onSuccess?: () => void;
}

function ColorFormUpdate({ id, onSuccess }: ColorFormUpdateProps) {
  const [initialData, setInitialData] = useState<SizeUpdateRequest | null>(null);

  const fields: FormField<SizeUpdateRequest>[] = [
    // {
    //   name: "code",
    //   label: "Mã màu",
    //   type: "text",
    //   placeholder: "Nhập mã kích cỡ",
    //   required: true,
    // },
    {
      name: "name",
      label: "Tên màu",
      type: "text",
      placeholder: "Nhập tên màu",
    },
  ];

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const size = await ColorService.getColorById(id); // ← Dùng id

        if (!size) return;

        setInitialData({
          name: size.name,
          code: size.code,
        });
      } catch (err) {
        console.error("Error fetching size:", err);
        alert("Không thể tải dữ liệu kích cỡ");
      }
    };

    fetchCategory();
  }, [id]);

  const handleSubmit = async (data: SizeUpdateRequest) => {
    await ColorService.updateColor(id, data);
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

export default ColorFormUpdate;
