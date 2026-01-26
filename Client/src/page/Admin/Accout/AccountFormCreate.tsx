import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { AccountService } from "../../../Service/AccountService";
import type { AccountCreateRequest } from "../../../type/account/AccountCreateRequest";

const fields: FormField<AccountCreateRequest>[] = [
  { name: "name", label: "Tên", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Mật khẩu", type: "password", required: true },
  { name: "roles", label: "Role", type: "text" },
];

function AccountFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  const handleSubmit = async (data: AccountCreateRequest) => {
    await AccountService.createAccount(data);
  };

  return (
    <DynamicForm
      fields={fields}
      mode="create"
      onSubmit={handleSubmit}
      successMessage="Tạo tài khoản thành công"
      onSuccess={onSuccess}
    />
  );
}

export default AccountFormCreate;
