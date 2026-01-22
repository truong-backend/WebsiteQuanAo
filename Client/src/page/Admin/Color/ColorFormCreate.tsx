import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { ColorService } from "../../../Service/ColorService";
import type { ColorCreateRequest } from "../../../type/Color/ColorCreateRequest";

interface ColorFormCreateProps {
  onSuccess?: () => void;
}

function ColorFormCreate({ onSuccess }: ColorFormCreateProps) {
  const fields: FormField<ColorCreateRequest>[] = [
    {
      name: "code",
      label: "Mã màu",
      type: "text",
      placeholder: "Nhập mã màu",
      required: true,
    },
    {
      name: "name",
      label: "Tên màu",
      type: "text",
      required: true,
    },
  ];

  const handleSubmit = async (data: ColorCreateRequest) => {
    await ColorService.createColor({
      name: data.name,
      code: data.code,
    });
  };

  return (
    <DynamicForm<ColorCreateRequest>
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo màu thành công"
      onSuccess={onSuccess}
    />
  );
}

export default ColorFormCreate;
