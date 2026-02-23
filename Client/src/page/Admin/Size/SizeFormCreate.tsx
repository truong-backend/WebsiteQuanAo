import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { SizeService } from "../../../Service/SizeService";
import type { SizeCreateRequest } from "../../../type/size/SizeCreateRequest";

interface SizeFormCreateProps {
  onSuccess?: () => void;
}

function SizeFormCreate({ onSuccess }: SizeFormCreateProps) {
  const fields: FormField<SizeCreateRequest>[] = [
    {
      name: "id",
      label: "Mã kích thước",
      type: "text",
      placeholder: "Nhập mã kích thước",
      required: true,
    },
    {
      name: "name",
      label: "Tên kích thước",
      type: "text",
      required: true,
    },
  ];

  const handleSubmit = async (data: SizeCreateRequest) => {
    await SizeService.createSize({
      name: data.name,
      id: data.id,
    });
  };

  return (
    <DynamicForm<SizeCreateRequest>
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo kích thước thành công"
      onSuccess={onSuccess}
    />
  );
}

export default SizeFormCreate;
