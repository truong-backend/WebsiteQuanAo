// src/pages/admin/AccountPage.tsx
import { useState, useEffect } from 'react';
import DynamicList from '@/components/admin/DynamicList';
import type { Column, Action } from '@/components/admin/DynamicList';
import DynamicForm from '@/components/admin/DynamicForm';
import type { FormField } from '@/components/admin/DynamicForm';
import AdminModal from '@/components/admin/AdminModal';
import AdminPageState from '@/components/admin/AdminPageState';
import { AccountService } from '@/modules';
import type { AccountResponse, AccountCreateRequest, AccountUpdateRequest } from '@/types';
import styles from './AccountPage.module.scss';

type AccountRecord = AccountResponse & Record<string, unknown>;

// ─── Form fields ──────────────────────────────────────────────

const CREATE_FIELDS: FormField<AccountCreateRequest>[] = [
  { name: 'name',     label: 'Tên',       type: 'text',     required: true },
  { name: 'email',    label: 'Email',     type: 'email',    required: true },
  { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
  { name: 'roles',    label: 'Role',      type: 'text' },
];

const UPDATE_FIELDS: FormField<AccountUpdateRequest>[] = [
  { name: 'name',  label: 'Tên',   type: 'text',  placeholder: 'Nhập tên',   required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Nhập email', required: true },
  { name: 'roles', label: 'Role',  type: 'text',  placeholder: 'Nhập role' },
];

// ─── Sub-forms ────────────────────────────────────────────────

function AccountFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicForm<AccountCreateRequest>
      fields={CREATE_FIELDS} mode="create"
      onSubmit={(data) => AccountService.createAccount(data)}
      successMessage="Tạo tài khoản thành công"
      onSuccess={onSuccess}
    />
  );
}

function AccountFormUpdate({ id, onSuccess }: { id: string; onSuccess?: () => void }) {
  const [initialData, setInitialData] = useState<AccountUpdateRequest | null>(null);

  useEffect(() => {
    AccountService.getById(id)
      .then((account) => {
        if (!account) return;
        setInitialData({ name: account.name, email: account.email, roles: account.roles });
      })
      .catch(() => alert('Không thể tải dữ liệu tài khoản'));
  }, [id]);

  if (!initialData) return <div>Đang tải dữ liệu...</div>;

  return (
    <DynamicForm<AccountUpdateRequest>
      fields={UPDATE_FIELDS} mode="update" initialData={initialData}
      onSubmit={(data) => AccountService.updateAccount(id, data)}
      successMessage="Cập nhật tài khoản thành công"
      onSuccess={onSuccess}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────

const COLUMNS: Column<AccountRecord>[] = [
  { key: 'name',  label: 'Tên',   sortable: true, searchable: true },
  { key: 'email', label: 'Email', sortable: true, searchable: true },
  { key: 'roles', label: 'Role',  sortable: true },
];

const AccountPage: React.FC = () => {
  const [accounts, setAccounts]     = useState<AccountResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await AccountService.getAccountsPaged(0, 1000, undefined, undefined, 'email', 'asc');
      setAccounts(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: AccountRecord) => {
    if (!confirm('Bạn có chắc muốn xóa?')) return;
    try { await AccountService.deleteAccount(item.id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa'); }
  };

  const handleEdit = (item: AccountRecord) => { setSelectedId(item.id as string); setShowUpdate(true); };

  const actions: Action<AccountRecord>[] = [
    { label: 'Sửa', onClick: handleEdit,   variant: 'primary' },
    { label: 'Xóa', onClick: handleDelete, variant: 'danger'  },
  ];

  if (loading && accounts.length === 0) return <AdminPageState loading error={null} onRetry={load} />;
  if (error   && accounts.length === 0) return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý tài khoản</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo mới</button>
      </div>

      <DynamicList
        data={accounts as AccountRecord[]} columns={COLUMNS} actions={actions}
        keyExtractor={(item) => item.id as string} emptyMessage="Không có dữ liệu"
        loading={loading} showGlobalSearch pageSize={10}
      />

      <AdminModal open={showCreate} title="Tạo mới" onClose={() => setShowCreate(false)}>
        <AccountFormCreate onSuccess={() => { setShowCreate(false); load(); }} />
      </AdminModal>

      <AdminModal
        open={showUpdate && selectedId !== null} title="Cập nhật"
        onClose={() => { setShowUpdate(false); setSelectedId(null); }}
      >
        {selectedId && (
          <AccountFormUpdate id={selectedId}
            onSuccess={() => { setShowUpdate(false); setSelectedId(null); load(); }} />
        )}
      </AdminModal>
    </div>
  );
};

export default AccountPage;