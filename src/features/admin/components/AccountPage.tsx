// src/features/admin/components/AccountPage.tsx
// Moved from: src/pages/admin/AccountPage.tsx
// Changed imports: @/modules → @/features/account | @/types → @/features/account
import { useState, useEffect } from "react";
import DynamicList from "@/components/admin/Dynamic/DynamicList";
import type { Column, Action } from "@/components/admin/Dynamic/DynamicList";
import DynamicForm from "@/components/admin/Dynamic/DynamicForm";
import type { FormField } from "@/components/admin/Dynamic/DynamicForm";
import AdminModal from "@/components/admin/ui/AdminModal";
import AdminPageState from "@/layouts/admin/AdminPageState";
import { AccountService } from "@/features/user/account/services/accountService";
import type {
  AccountResponse,
  AccountCreateRequest,
  AccountUpdateRequest,
} from "@/features/user/account/types/account.types";
import styles from "./AccountPage.module.scss";

type AccountRecord = AccountResponse & Record<string, unknown>;

const CREATE_FIELDS: FormField<AccountCreateRequest>[] = [
  { name: "name", label: "Họ và tên", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  { name: "password", label: "Mật khẩu", type: "password", required: true },
  {
    name: "roles",
    label: "Vai trò",
    type: "select",
    options: [
      { value: "ROLE_USER", label: "Người dùng" },
      { value: "ROLE_ADMIN", label: "Quản trị viên" },
    ],
  },
];

const UPDATE_FIELDS: FormField<AccountUpdateRequest>[] = [
  { name: "name", label: "Họ và tên", type: "text", required: true },
  { name: "email", label: "Email", type: "email", required: true },
  {
    name: "roles",
    label: "Vai trò",
    type: "select",
    options: [
      { value: "ROLE_USER", label: "Người dùng" },
      { value: "ROLE_ADMIN", label: "Quản trị viên" },
    ],
  },
];

function AccountFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicForm<AccountCreateRequest>
      fields={CREATE_FIELDS}
      mode="create"
      onSubmit={(data) => AccountService.createAccount(data)}
      successMessage="Tạo tài khoản thành công"
      onSuccess={onSuccess}
    />
  );
}

function AccountFormUpdate({
  id,
  onSuccess,
}: {
  id: string;
  onSuccess?: () => void;
}) {
  const [initialData, setInitialData] = useState<AccountUpdateRequest | null>(
    null,
  );

  useEffect(() => {
    AccountService.getById(id)
      .then((a) =>
        setInitialData({ name: a.name, email: a.email, roles: a.roles }),
      )
      .catch(() => alert("Không thể tải dữ liệu tài khoản"));
  }, [id]);

  if (!initialData) return <div>Đang tải dữ liệu...</div>;

  return (
    <DynamicForm<AccountUpdateRequest>
      fields={UPDATE_FIELDS}
      mode="update"
      initialData={initialData}
      onSubmit={(data) => AccountService.updateAccount(id, data)}
      successMessage="Cập nhật tài khoản thành công"
      onSuccess={onSuccess}
    />
  );
}

const COLUMNS: Column<AccountRecord>[] = [
  { key: "name", label: "Họ và tên", sortable: true, searchable: true },
  { key: "email", label: "Email", sortable: true, searchable: true },
  {
    key: "roles",
    label: "Vai trò",
    render: (item) => (
      <span
        style={{
          padding: "2px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          background: item.roles === "ROLE_ADMIN" ? "#fee2e2" : "#e0f2fe",
          color: item.roles === "ROLE_ADMIN" ? "#dc2626" : "#0369a1",
        }}
      >
        {item.roles === "ROLE_ADMIN" ? "Admin" : "User"}
      </span>
    ),
  },
  {
    key: "enabled",
    label: "Trạng thái",
    render: (item) => (
      <span
        style={{
          padding: "2px 10px",
          borderRadius: 12,
          fontSize: 12,
          fontWeight: 600,
          background: item.enabled ? "#dcfce7" : "#f1f5f9",
          color: item.enabled ? "#16a34a" : "#64748b",
        }}
      >
        {item.enabled ? "Hoạt động" : "Vô hiệu"}
      </span>
    ),
  },
];

const AccountPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await AccountService.getAccountsPaged(
        0,
        1000,
        undefined,
        undefined,
        "email",
        "asc",
      );
      setAccounts(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (item: AccountRecord) => {
    if (!confirm(`Xóa tài khoản "${item.email}"?`)) return;
    try {
      await AccountService.deleteAccount(item.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xóa");
    }
  };

  const handleEdit = (item: AccountRecord) => {
    setSelectedId(item.id as string);
    setShowUpdate(true);
  };

  const actions: Action<AccountRecord>[] = [
    { label: "Sửa", onClick: handleEdit, variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger" },
  ] as Action<AccountRecord>[];

  if (loading && accounts.length === 0)
    return <AdminPageState loading error={null} onRetry={load} />;
  if (error && accounts.length === 0)
    return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý tài khoản</h2>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreate(true)}
        >
          + Tạo tài khoản mới
        </button>
      </div>
      <DynamicList
        data={accounts as AccountRecord[]}
        columns={COLUMNS}
        actions={actions}
        keyExtractor={(item) => item.id as string}
        emptyMessage="Không có tài khoản nào"
        loading={loading}
        showGlobalSearch
        pageSize={10}
      />
      <AdminModal
        open={showCreate}
        title="Tạo tài khoản mới"
        onClose={() => setShowCreate(false)}
      >
        <AccountFormCreate
          onSuccess={() => {
            setShowCreate(false);
            load();
          }}
        />
      </AdminModal>
      <AdminModal
        open={showUpdate && selectedId !== null}
        title="Cập nhật tài khoản"
        onClose={() => {
          setShowUpdate(false);
          setSelectedId(null);
        }}
      >
        {selectedId && (
          <AccountFormUpdate
            id={selectedId}
            onSuccess={() => {
              setShowUpdate(false);
              setSelectedId(null);
              load();
            }}
          />
        )}
      </AdminModal>
    </div>
  );
};

export default AccountPage;
