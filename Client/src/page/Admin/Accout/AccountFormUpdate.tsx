import { useEffect, useState } from "react";
import DynamicForm from "../../../Components/Admin/Form/DynamicForm";
import type { FormField } from "../../../Components/Admin/Form/DynamicForm";
import { AccountService } from "../../../Service/AccountService";
import type { AccountUpdateRequest } from "../../../type/account/AccountUpdateRequest";

interface AccountFormUpdateProps {
  id: string;
  onSuccess?: () => void;
}

function AccountFormUpdate({ id, onSuccess }: AccountFormUpdateProps) {
  const [initialData, setInitialData] = useState<AccountUpdateRequest | null>(null);

  const fields: FormField<AccountUpdateRequest>[] = [
    {
      name: "name",
      label: "Tên",
      type: "text",
      placeholder: "Nhập tên",
      required: true,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Nhập email",
      required: true,
    },
    {
      name: "roles",
      label: "Role",
      type: "text",
      placeholder: "Nhập role",
    },
  ];

  useEffect(() => {
    const fetchAccount = async () => {
      try {
        const account = await AccountService.getById(id);

        if (!account) return;

        setInitialData({
          name: account.name,
          email: account.email,
          roles: account.roles,
        });
      } catch (err) {
        console.error("Error fetching account:", err);
        alert("Không thể tải dữ liệu tài khoản");
      }
    };

    fetchAccount();
  }, [id]);

  const handleSubmit = async (data: AccountUpdateRequest) => {
    await AccountService.updateAccount(id, data);
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
      successMessage="Cập nhật tài khoản thành công"
      onSuccess={onSuccess}
    />
  );
}

export default AccountFormUpdate;