// src/pages/admin/OrderPage.tsx
import { useState, useEffect } from 'react';
import DynamicList from '@/components/admin/DynamicList';
import type { Column, Action } from '@/components/admin/DynamicList';
import AdminPageState from '@/components/admin/AdminPageState';
import { OrderService } from '@/modules';
import type { OrderResponse } from '@/types';
import { OrderStatus, OrderStatusLabels } from '@/types';
import styles from './OrderPage.module.scss';

type SortDir      = 'asc' | 'desc';
type OrderFilters = { status: OrderStatus | ''; startDate: string; endDate: string; accountId: string };

const DEFAULT_FILTERS: OrderFilters = { status: '', startDate: '', endDate: '', accountId: '' };

// ─── Columns ──────────────────────────────────────────────────

const buildColumns = (onStatusChange: (item: OrderResponse, newStatus: string) => void): Column<OrderResponse>[] => [
  { key: 'id', label: 'Mã đơn',
    render: (item) => <span style={{ fontFamily: 'monospace', fontSize: 13 }}>{item.id}</span> },
  { key: 'orderTime', label: 'Thời gian',
    render: (item) => {
      const d = new Date(item.orderTime);
      return (
        <div style={{ fontSize: 13 }}>
          <div>{d.toLocaleDateString('vi-VN')}</div>
          <div style={{ color: '#9ca3af' }}>{d.toLocaleTimeString('vi-VN')}</div>
        </div>
      );
    },
  },
  { key: 'phoneNumber', label: 'SĐT' },
  { key: 'address', label: 'Địa chỉ',
    render: (item) => (
      <span style={{ display: 'block', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
        title={item.address}>{item.address}</span>
    ),
  },
  { key: 'status', label: 'Trạng thái',
    render: (item) => (
      <select value={item.status} className={styles.statusSelect}
        onChange={(e) => onStatusChange(item, e.target.value)}>
        {Object.values(OrderStatus).map((s) => (
          <option key={s} value={s}>{OrderStatusLabels[s]}</option>
        ))}
      </select>
    ),
  },
  { key: 'accountId', label: 'Khách hàng',
    render: (item) => item.accountId != null ? `#${item.accountId}` : '—' },
  { key: 'note', label: 'Ghi chú',
    render: (item) => item.note
      ? <span style={{ display: 'block', maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
          title={item.note}>{item.note}</span>
      : '—',
  },
];

// ─── Page ─────────────────────────────────────────────────────

const OrderPage: React.FC = () => {
  const [orders, setOrders]           = useState<OrderResponse[]>([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [page, setPage]               = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [search, setSearch]           = useState('');
  const [sortBy, setSortBy]           = useState('orderTime');
  const [sortDir, setSortDir]         = useState<SortDir>('desc');
  const [filters, setFilters]         = useState<OrderFilters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await OrderService.getOrdersPaged(
        page, 10, search || undefined, sortBy, sortDir,
        filters.status || undefined,
        filters.startDate || undefined,
        filters.endDate || undefined,
        filters.accountId ? Number(filters.accountId) : undefined,
      );
      setOrders(res.content);
      setTotalPages(res.totalPages);
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [page, search, sortBy, sortDir, filters]);
  useEffect(() => { setPage(0); }, [search, sortBy, sortDir, filters]);

  const handleStatusChange = async (item: OrderResponse, newStatus: string) => {
    try { await OrderService.updateOrderStatus(item.id, newStatus as OrderStatus); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Lỗi cập nhật trạng thái'); }
  };

  const handleDelete = async (item: OrderResponse) => {
    if (!confirm(`Xóa đơn hàng #${item.id}?`)) return;
    try { await OrderService.deleteOrder(item.id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Lỗi khi xóa'); }
  };

  const columns = buildColumns(handleStatusChange);
  const actions: Action<OrderResponse>[] = [
    { label: 'Xóa', onClick: handleDelete, variant: 'danger' },
  ];

  const hasFilters = !!(filters.status || filters.startDate || filters.endDate || filters.accountId);

  if (loading && orders.length === 0) return <AdminPageState loading error={null} onRetry={load} />;
  if (error   && orders.length === 0) return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý đơn hàng</h2>
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <input className={styles.searchInput} type="search"
          placeholder="Tìm mã đơn, SĐT, địa chỉ..."
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={styles.sortSelect} value={`${sortBy}-${sortDir}`}
          onChange={(e) => {
            const [b, d] = e.target.value.split('-') as [string, SortDir];
            setSortBy(b); setSortDir(d);
          }}>
          <option value="orderTime-desc">Mới nhất</option>
          <option value="orderTime-asc">Cũ nhất</option>
          <option value="id-desc">Mã đơn</option>
          <option value="status-asc">Trạng thái</option>
        </select>
        <button
          className={`${styles.filterToggle} ${(showFilters || hasFilters) ? styles['filterToggle--active'] : ''}`}
          onClick={() => setShowFilters((p) => !p)}>
          {showFilters ? 'Ẩn bộ lọc' : 'Bộ lọc'}{hasFilters ? ' ●' : ''}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className={styles.filters}>
          <div className={styles.filtersGrid}>
            <div className={styles.filterField}>
              <label>Trạng thái</label>
              <select value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value as OrderStatus | '' }))}>
                <option value="">Tất cả</option>
                {Object.values(OrderStatus).map((s) => <option key={s} value={s}>{OrderStatusLabels[s]}</option>)}
              </select>
            </div>
            <div className={styles.filterField}>
              <label>Từ ngày</label>
              <input type="date" value={filters.startDate}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value }))} />
            </div>
            <div className={styles.filterField}>
              <label>Đến ngày</label>
              <input type="date" value={filters.endDate}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value }))} />
            </div>
            <div className={styles.filterField}>
              <label>ID khách hàng</label>
              <input type="number" value={filters.accountId} placeholder="Nhập ID..."
                onChange={(e) => setFilters((f) => ({ ...f, accountId: e.target.value }))} />
            </div>
          </div>
          {hasFilters && (
            <div className={styles.clearFilters}>
              <button onClick={() => setFilters(DEFAULT_FILTERS)}>✕ Xóa tất cả bộ lọc</button>
            </div>
          )}
        </div>
      )}

      <DynamicList<OrderResponse>
        data={orders} columns={columns} actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không có đơn hàng nào" loading={loading}
      />

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}>← Trước</button>
          <span className={styles.pageInfo}>Trang {page + 1} / {totalPages}</span>
          <button className={styles.pageBtn} onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Sau →</button>
        </div>
      )}
    </div>
  );
};

export default OrderPage;