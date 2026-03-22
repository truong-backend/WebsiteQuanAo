// src/pages/admin/AccountPage.tsx
import { useState, useEffect, useMemo } from 'react';
import DynamicForm from '@/components/admin/DynamicForm';
import type { FormField } from '@/components/admin/DynamicForm';
import AdminModal from '@/components/admin/AdminModal';
import AdminPageState from '@/components/admin/AdminPageState';
import { AccountService } from '@/modules';
import type {
  AccountResponse,
  AccountCreateRequest,
  AccountUpdateRequest,
  OrderBasicResponse,
} from '@/types';
import { OrderStatus, OrderStatusLabels } from '@/types';
import styles from './AccountPage.module.scss';

// ─── Form fields ──────────────────────────────────────────────

const CREATE_FIELDS: FormField<AccountCreateRequest>[] = [
  { name: 'name',     label: 'Tên',       type: 'text',     required: true },
  { name: 'email',    label: 'Email',     type: 'email',    required: true },
  { name: 'password', label: 'Mật khẩu', type: 'password', required: true },
  { name: 'roles',    label: 'Role',      type: 'text',     placeholder: 'ROLE_USER' },
];

const UPDATE_FIELDS: FormField<AccountUpdateRequest>[] = [
  { name: 'name',  label: 'Tên',   type: 'text',  placeholder: 'Nhập tên',   required: true },
  { name: 'email', label: 'Email', type: 'email', placeholder: 'Nhập email', required: true },
  { name: 'roles', label: 'Role',  type: 'text',  placeholder: 'ROLE_USER / ROLE_ADMIN' },
];

// ─── Helpers ─────────────────────────────────────────────────

const STATUS_COLOR: Record<OrderStatus, string> = {
  [OrderStatus.PENDING]:   '#f59e0b',
  [OrderStatus.CONFIRMED]: '#3b82f6',
  [OrderStatus.SHIPPING]:  '#8b5cf6',
  [OrderStatus.COMPLETED]: '#22c55e',
  [OrderStatus.CANCELLED]: '#ef4444',
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });

// ─── Create / Update forms ────────────────────────────────────

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
  const [initial, setInitial] = useState<AccountUpdateRequest | null>(null);

  useEffect(() => {
    AccountService.getById(id)
      .then((a) => setInitial({ name: a.name, email: a.email, roles: a.roles }))
      .catch(() => alert('Không thể tải dữ liệu tài khoản'));
  }, [id]);

  if (!initial) return <p className={styles.loadingText}>Đang tải...</p>;

  return (
    <DynamicForm<AccountUpdateRequest>
      fields={UPDATE_FIELDS} mode="update" initialData={initial}
      onSubmit={(data) => AccountService.updateAccount(id, data)}
      successMessage="Cập nhật tài khoản thành công"
      onSuccess={onSuccess}
    />
  );
}

// ─── Order history panel ──────────────────────────────────────

function OrderHistory({ accountId }: { accountId: string }) {
  const [orders, setOrders]   = useState<OrderBasicResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AccountService.getOrdersByAccountId(accountId)
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) return <p className={styles.loadingText}>Đang tải đơn hàng...</p>;
  if (orders.length === 0) return <p className={styles.emptyText}>Chưa có đơn hàng.</p>;

  return (
    <div className={styles.orderList}>
      {orders.map((order) => (
        <div key={order.id} className={styles.orderRow}>
          <div>
            <span className={styles.orderRow__id}>#{order.id.slice(0, 8).toUpperCase()}</span>
            <span className={styles.orderRow__date}>
              {formatDate(order.orderTime as unknown as string)}
            </span>
          </div>
          <span
            className={styles.orderRow__badge}
            style={{
              background: STATUS_COLOR[order.status] + '22',
              color: STATUS_COLOR[order.status],
            }}
          >
            {OrderStatusLabels[order.status]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────

const AccountPage: React.FC = () => {
  const [accounts, setAccounts]       = useState<AccountResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [busyId, setBusyId]           = useState<string | null>(null); // id đang xử lý

  // Modals
  const [showCreate, setShowCreate]   = useState(false);
  const [showUpdate, setShowUpdate]   = useState(false);
  const [showOrders, setShowOrders]   = useState(false);
  const [selected, setSelected]       = useState<AccountResponse | null>(null);

  // ── Load ──
  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await AccountService.getAccountsPaged(0, 1000, undefined, undefined, 'email', 'asc');
      setAccounts(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtered list
  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return accounts;
    return accounts.filter(
      (a) => a.name.toLowerCase().includes(kw) || a.email.toLowerCase().includes(kw),
    );
  }, [accounts, search]);

  // ── Generic action runner ──
  const runAction = async (
    id: string,
    fn: () => Promise<AccountResponse | void>,
    confirmMsg?: string,
  ) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setBusyId(id);
    try {
      const updated = await fn();
      if (updated && typeof updated === 'object' && 'id' in updated) {
        // Cập nhật item trong danh sách mà không cần reload toàn bộ
        setAccounts((prev) =>
          prev.map((a) => (String(a.id) === id ? (updated as AccountResponse) : a)),
        );
      } else {
        await load();
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = (account: AccountResponse) =>
    runAction(
      String(account.id),
      async () => { await AccountService.deleteAccount(String(account.id)); await load(); },
      `Xóa tài khoản "${account.name}"? Hành động này không thể hoàn tác.`,
    );

  const handleToggleRole = (account: AccountResponse) => {
    const newRole = account.roles === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN';
    runAction(
      String(account.id),
      () => AccountService.updateRole(String(account.id), newRole),
      `Đổi role "${account.name}" → ${newRole === 'ROLE_ADMIN' ? 'Admin' : 'User'}?`,
    );
  };

  const handleToggleEnabled = (account: AccountResponse) => {
    if (account.enabled) {
      runAction(
        String(account.id),
        () => AccountService.disableAccount(String(account.id)),
        `Khóa tài khoản "${account.name}"? Họ sẽ không thể đăng nhập.`,
      );
    } else {
      runAction(
        String(account.id),
        () => AccountService.enableAccount(String(account.id)),
        `Kích hoạt lại tài khoản "${account.name}"?`,
      );
    }
  };

  if (loading && accounts.length === 0) return <AdminPageState loading error={null} onRetry={load} />;
  if (error   && accounts.length === 0) return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>

      {/* ── Toolbar ── */}
      <div className={styles.toolbar}>
        <h2 className={styles.title}>Quản lý tài khoản</h2>
        <div className={styles.toolbar__right}>
          <input
            className={styles.searchInput}
            type="text"
            placeholder="Tìm tên, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button className={styles.createBtn} onClick={() => setShowCreate(true)}>
            + Tạo mới
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Trạng thái</th>
              <th className={styles.actionCol}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.emptyRow}>
                  {search ? 'Không tìm thấy kết quả.' : 'Chưa có tài khoản nào.'}
                </td>
              </tr>
            ) : (
              filtered.map((account) => {
                const id       = String(account.id);
                const isBusy   = busyId === id;
                const isAdmin  = account.roles === 'ROLE_ADMIN';

                return (
                  <tr
                    key={id}
                    className={[
                      styles.row,
                      !account.enabled ? styles['row--disabled'] : '',
                    ].join(' ')}
                  >
                    {/* Tên */}
                    <td className={styles.cell}>
                      <div className={styles.nameCell}>
                        <div className={styles.avatar}>
                          {account.name.charAt(0).toUpperCase()}
                        </div>
                        <span className={styles.nameCellText}>{account.name}</span>
                      </div>
                    </td>

                    {/* Email */}
                    <td className={styles.cell}>
                      <span className={styles.emailText}>{account.email}</span>
                    </td>

                    {/* Role */}
                    <td className={styles.cell}>
                      <span className={[
                        styles.roleBadge,
                        isAdmin ? styles['roleBadge--admin'] : styles['roleBadge--user'],
                      ].join(' ')}>
                        {isAdmin ? 'Admin' : 'User'}
                      </span>
                    </td>

                    {/* Trạng thái */}
                    <td className={styles.cell}>
                      <span className={[
                        styles.statusBadge,
                        account.enabled ? styles['statusBadge--active'] : styles['statusBadge--locked'],
                      ].join(' ')}>
                        {account.enabled ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>

                    {/* Thao tác */}
                    <td className={`${styles.cell} ${styles.actionCell}`}>
                      {/* Sửa thông tin */}
                      <button
                        className={styles.btn}
                        disabled={isBusy}
                        onClick={() => { setSelected(account); setShowUpdate(true); }}
                        title="Sửa thông tin"
                      >
                        Sửa
                      </button>

                      {/* Đổi role */}
                      <button
                        className={[styles.btn, styles['btn--role']].join(' ')}
                        disabled={isBusy}
                        onClick={() => handleToggleRole(account)}
                        title={isAdmin ? 'Hạ xuống User' : 'Nâng lên Admin'}
                      >
                        {isBusy ? '...' : isAdmin ? '↓ User' : '↑ Admin'}
                      </button>

                      {/* Enable / Disable */}
                      <button
                        className={[
                          styles.btn,
                          account.enabled ? styles['btn--lock'] : styles['btn--unlock'],
                        ].join(' ')}
                        disabled={isBusy}
                        onClick={() => handleToggleEnabled(account)}
                        title={account.enabled ? 'Khóa tài khoản' : 'Kích hoạt'}
                      >
                        {isBusy ? '...' : account.enabled ? 'Khóa' : 'Kích hoạt'}
                      </button>

                      {/* Xem đơn hàng */}
                      <button
                        className={[styles.btn, styles['btn--orders']].join(' ')}
                        disabled={isBusy}
                        onClick={() => { setSelected(account); setShowOrders(true); }}
                        title="Xem đơn hàng"
                      >
                        Đơn hàng
                      </button>

                      {/* Xóa */}
                      <button
                        className={[styles.btn, styles['btn--delete']].join(' ')}
                        disabled={isBusy}
                        onClick={() => handleDelete(account)}
                        title="Xóa tài khoản"
                      >
                        Xóa
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Đếm kết quả */}
      {!loading && (
        <p className={styles.countText}>
          {search
            ? `${filtered.length} / ${accounts.length} tài khoản`
            : `${accounts.length} tài khoản`}
        </p>
      )}

      {/* ── Modal: Tạo mới ── */}
      <AdminModal open={showCreate} title="Tạo tài khoản mới" onClose={() => setShowCreate(false)}>
        <AccountFormCreate onSuccess={() => { setShowCreate(false); load(); }} />
      </AdminModal>

      {/* ── Modal: Cập nhật ── */}
      <AdminModal
        open={showUpdate && selected !== null}
        title={`Cập nhật: ${selected?.name ?? ''}`}
        onClose={() => { setShowUpdate(false); setSelected(null); }}
      >
        {selected && (
          <AccountFormUpdate
            id={String(selected.id)}
            onSuccess={() => { setShowUpdate(false); setSelected(null); load(); }}
          />
        )}
      </AdminModal>

      {/* ── Modal: Đơn hàng ── */}
      <AdminModal
        open={showOrders && selected !== null}
        title={`Đơn hàng của ${selected?.name ?? ''}`}
        onClose={() => { setShowOrders(false); setSelected(null); }}
      >
        {selected && <OrderHistory accountId={String(selected.id)} />}
      </AdminModal>
    </div>
  );
};

export default AccountPage;