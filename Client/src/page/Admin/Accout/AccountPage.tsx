// src/pages/Admin/AccountPage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type { Column, Action } from "../../../Components/Admin/List/DynamicList";
import { AccountService } from "../../../Service/AccountService";
import type { AccountResponse } from "../../../type/account/AccountResponse";
import AccountFormCreate from "./AccountFormCreate";
import AccountFormUpdate from "./AccountFormUpdate";
import AdminModal from "../../../Components/Admin/common/AdminModal/AdminModal";
import AdminPageState from "../../../Components/Admin/common/AdminPageState/AdminPageState";
import styles from "./AccountPage.module.scss";

type AccountResponseRecord = AccountResponse & Record<string, unknown>;

const AccountPage: React.FC = () => {
  const [accounts, setAccountResponses] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showUpdate, setShowUpdate]   = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true); setError(null);
      const res = await AccountService.getAccountsPaged(0, 1000, undefined, undefined, "email", "asc");
      setAccountResponses(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : "Có lỗi xảy ra"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: AccountResponseRecord) => {
    if (!confirm(`Bạn có chắc muốn xóa?`)) return;
    try { await AccountService.deleteAccount(item.id); fetch(); }
    catch (err) { alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa"); }
  };

  const handleEdit = (item: AccountResponseRecord) => { setSelectedId(item.id as string); setShowUpdate(true); };
  const onCreateOk = () => { setShowCreate(false); fetch(); };
  const onUpdateOk = () => { setShowUpdate(false); setSelectedId(null); fetch(); };

  const columns: Column<AccountResponseRecord>[] = [{ key: "name",  label: "Tên",   sortable: true, searchable: true },
    { key: "email", label: "Email", sortable: true, searchable: true },
    { key: "roles", label: "Role",  sortable: true }];
  const actions: Action<AccountResponseRecord>[] = [
    { label: "Sửa", onClick: handleEdit,   variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger"  },
  ];

  if (loading && accounts.length === 0) return <AdminPageState loading error={null} onRetry={fetch} />;
  if (error   && accounts.length === 0) return <AdminPageState loading={false} error={error} onRetry={fetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý tài khoản</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo mới</button>
      </div>
      <DynamicList
        data={accounts as AccountResponseRecord[]}
        columns={columns} actions={actions}
        keyExtractor={(item) => item.id as string | number}
        emptyMessage="Không có dữ liệu" loading={loading}
        showGlobalSearch pageSize={10}
      />
      <AdminModal open={showCreate} title="Tạo mới" onClose={() => setShowCreate(false)}>
        <AccountFormCreate onSuccess={onCreateOk} />
      </AdminModal>
      <AdminModal open={showUpdate && selectedId !== null} title="Cập nhật" onClose={() => { setShowUpdate(false); setSelectedId(null); }}>
        {selectedId !== null && <AccountFormUpdate id={selectedId} onSuccess={onUpdateOk} />}
      </AdminModal>
    </div>
  );
};
export default AccountPage;