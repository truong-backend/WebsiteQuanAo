// src/components/admin/DynamicList.tsx
// Chịu trách nhiệm: Bảng dữ liệu động dùng chung cho mọi entity admin
//   - Sort theo cột (asc / desc / none)
//   - Global search + per-column search (popover)
//   - Pagination client-side
//   - Slot actions (primary | secondary | danger)
import React, { useState, useMemo, useRef, useEffect } from 'react';
import styles from './DynamicList.module.scss';

// ─── Types ────────────────────────────────────────────────────

export interface Column<T> {
  key:         keyof T | string;
  label:       string;
  render?:     (item: T) => React.ReactNode;
  width?:      number | string;
  sortable?:   boolean;
  searchable?: boolean;
}

export interface Action<T> {
  label:     string;
  onClick:   (item: T) => void;
  variant?:  'primary' | 'secondary' | 'danger';
  disabled?: (item: T) => boolean;
}

export interface DynamicListProps<T> {
  data:               T[];
  columns:            Column<T>[];
  actions?:           Action<T>[];
  keyExtractor:       (item: T) => string | number;
  emptyMessage?:      string;
  loading?:           boolean;
  pageSize?:          number;
  showGlobalSearch?:  boolean;
  searchPlaceholder?: string;
  onSearch?:          (text: string) => void;
}

type SortDir = 'asc' | 'desc' | null;

// ─── Component ────────────────────────────────────────────────

function DynamicList<T extends Record<string, unknown>>({
  data, columns, actions, keyExtractor,
  emptyMessage = 'Không có dữ liệu',
  loading = false,
  pageSize = 10,
  showGlobalSearch = false,
  searchPlaceholder = 'Tìm kiếm...',
  onSearch,
}: DynamicListProps<T>) {
  const [globalSearch, setGlobalSearch]   = useState('');
  const [colSearches, setColSearches]     = useState<Record<string, string>>({});
  const [openColSearch, setOpenColSearch] = useState<string | null>(null);
  const [sortKey, setSortKey]             = useState<string>('');
  const [sortDir, setSortDir]             = useState<SortDir>(null);
  const [page, setPage]                   = useState(1);
  const colSearchRef                      = useRef<HTMLDivElement>(null);

  // Close column search popover on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (colSearchRef.current && !colSearchRef.current.contains(e.target as Node)) {
        setOpenColSearch(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Global search filter
  const afterGlobal = useMemo(() => {
    if (!globalSearch.trim()) return data;
    const q = globalSearch.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const v = item[col.key as keyof T];
        return v != null && String(v).toLowerCase().includes(q);
      }),
    );
  }, [data, globalSearch, columns]);

  // Column search filter
  const afterColSearch = useMemo(() => {
    let result = afterGlobal;
    Object.entries(colSearches).forEach(([key, val]) => {
      if (!val.trim()) return;
      const q = val.toLowerCase();
      result = result.filter((item) => {
        const v = item[key as keyof T];
        return v != null && String(v).toLowerCase().includes(q);
      });
    });
    return result;
  }, [afterGlobal, colSearches]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortKey || !sortDir) return afterColSearch;
    return [...afterColSearch].sort((a, b) => {
      const av = a[sortKey as keyof T];
      const bv = b[sortKey as keyof T];
      if (av == null) return 1;
      if (bv == null) return -1;
      const an = Number(av), bn = Number(bv);
      if (!isNaN(an) && !isNaN(bn)) return sortDir === 'asc' ? an - bn : bn - an;
      return sortDir === 'asc'
        ? String(av).localeCompare(String(bv))
        : String(bv).localeCompare(String(av));
    });
  }, [afterColSearch, sortKey, sortDir]);

  // Pagination — clamp page to valid range (auto-resets when filters shrink results)
  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const safePage   = Math.min(page, totalPages);
  const paginated  = sorted.slice((safePage - 1) * pageSize, safePage * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir((prev) => (prev === 'asc' ? 'desc' : prev === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortKey('');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
    setPage(1);
  };

  const handleGlobalSearch = (val: string) => {
    setGlobalSearch(val);
    setPage(1);
    onSearch?.(val);
  };

  const handleColSearch = (key: string, val: string) => {
    setColSearches((prev) => ({ ...prev, [key]: val }));
    setPage(1);
  };

  const sortIcon = (key: string) => {
    if (sortKey !== key) return <span className={styles.sortIcon}>↕</span>;
    return (
      <span className={`${styles.sortIcon} ${sortDir === 'asc' ? styles['sortIcon--asc'] : styles['sortIcon--desc']}`}>
        {sortDir === 'asc' ? '↑' : '↓'}
      </span>
    );
  };

  return (
    <div className={styles.wrap}>
      {/* Global search */}
      {showGlobalSearch && (
        <div className={styles.searchBar}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            type="text"
            placeholder={searchPlaceholder}
            value={globalSearch}
            onChange={(e) => handleGlobalSearch(e.target.value)}
          />
          {globalSearch && (
            <button className={styles.clearBtn} onClick={() => handleGlobalSearch('')} type="button">✕</button>
          )}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={[styles.th, col.sortable ? styles['th--sortable'] : ''].join(' ')}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className={styles.thInner}>
                    {col.label}
                    {col.sortable && sortIcon(col.key as string)}
                    {col.searchable && (
                      <span ref={openColSearch === col.key ? colSearchRef : undefined} style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className={`${styles.searchFilterBtn} ${colSearches[col.key as string] ? styles['searchFilterBtn--active'] : ''}`}
                          onClick={(e) => { e.stopPropagation(); setOpenColSearch(openColSearch === col.key ? null : col.key as string); }}
                        >🔍</button>
                        {openColSearch === col.key && (
                          <div className={styles.colSearchWrap} onClick={(e) => e.stopPropagation()}>
                            <input
                              autoFocus
                              type="text"
                              className={styles.colSearchInput}
                              placeholder={`Tìm ${col.label}...`}
                              value={colSearches[col.key as string] ?? ''}
                              onChange={(e) => handleColSearch(col.key as string, e.target.value)}
                            />
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
              {actions?.length ? <th className={`${styles.th} ${styles['th--center']}`} style={{ width: 'auto', whiteSpace: 'nowrap' }}>Hành động</th> : null}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr className={styles.loadingRow}>
                <td colSpan={columns.length + (actions?.length ? 1 : 0)}>
                  <div className={styles.spinner} />
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (actions?.length ? 1 : 0)}>
                  <div className={styles.empty}>
                    <div className={styles.empty__icon}>📭</div>
                    <div className={styles.empty__text}>{emptyMessage}</div>
                  </div>
                </td>
              </tr>
            ) : (
              paginated.map((item) => (
                <tr key={keyExtractor(item)} className={styles.tr}>
                  {columns.map((col) => (
                    <td key={col.key as string} className={styles.td}>
                      {col.render ? col.render(item) : (item[col.key as keyof T] as React.ReactNode)}
                    </td>
                  ))}
                  {actions?.length ? (
                    <td className={`${styles.td} ${styles['td--center']}`} style={{ whiteSpace: 'nowrap' }}>
                      <div className={styles.actions}>
                        {actions.map((action, i) => (
                          <button
                            key={i}
                            type="button"
                            className={`${styles.btn} ${styles[`btn--${action.variant ?? 'secondary'}`]}`}
                            onClick={() => action.onClick(item)}
                            disabled={action.disabled ? action.disabled(item) : false}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <span className={styles.pageInfo}>{sorted.length} mục</span>
          <button type="button" className={styles.pageBtn} onClick={() => setPage(1)} disabled={safePage === 1}>«</button>
          <button type="button" className={styles.pageBtn} onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1}>‹</button>
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            const start = Math.max(1, Math.min(safePage - 2, totalPages - 4));
            const p = start + i;
            return p <= totalPages ? (
              <button
                key={p} type="button"
                className={`${styles.pageBtn} ${safePage === p ? styles['pageBtn--active'] : ''}`}
                onClick={() => setPage(p)}
              >{p}</button>
            ) : null;
          })}
          <button type="button" className={styles.pageBtn} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>›</button>
          <button type="button" className={styles.pageBtn} onClick={() => setPage(totalPages)} disabled={safePage === totalPages}>»</button>
        </div>
      )}
    </div>
  );
}

export default DynamicList;