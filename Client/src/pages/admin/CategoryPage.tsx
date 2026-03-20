// src/pages/admin/CategoryPage.tsx
import { useState, useEffect } from 'react';
import DynamicList from '@/components/admin/DynamicList';
import type { Column, Action } from '@/components/admin/DynamicList';
import DynamicForm from '@/components/admin/DynamicForm';
import type { FormField, SelectOption } from '@/components/admin/DynamicForm';
import AdminModal from '@/components/admin/AdminModal';
import AdminPageState from '@/components/admin/AdminPageState';
import { CategoryService } from '@/modules';
import type { CategoryResponse, CategoryCreateAndUpdateRequest } from '@/types';
import styles from './CategoryPage.module.scss';

type CategoryRecord = CategoryResponse & Record<string, unknown>;

// ─── Form fields ──────────────────────────────────────────────

const CATEGORY_FIELDS: FormField<CategoryCreateAndUpdateRequest>[] = [
  { name: 'categoryName',     label: 'Tên danh mục', type: 'text',   placeholder: 'Nhập tên danh mục', required: true },
  { name: 'parentCategoryId', label: 'Danh mục cha', type: 'select',
    loadOptions: () => CategoryService.getCategorySelectOptions() as Promise<SelectOption[]> },
];

// ─── Sub-forms ────────────────────────────────────────────────

function CategoryFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicForm<CategoryCreateAndUpdateRequest>
      fields={CATEGORY_FIELDS} mode="create"
      onSubmit={(data) => CategoryService.createCategory({
        categoryName: data.categoryName, parentCategoryId: data.parentCategoryId,
      })}
      successMessage="Tạo danh mục thành công" onSuccess={onSuccess}
    />
  );
}

function CategoryFormUpdate({ id, onSuccess }: { id: number; onSuccess?: () => void }) {
  const [initialData, setInitialData] = useState<CategoryCreateAndUpdateRequest | null>(null);

  useEffect(() => {
    CategoryService.getCategoryById(id)
      .then((c) => setInitialData({ categoryName: c.categoryName, parentCategoryId: c.parentCategoryId ?? null }))
      .catch(() => alert('Không thể tải dữ liệu danh mục'));
  }, [id]);

  if (!initialData) return <div>Đang tải dữ liệu...</div>;

  return (
    <DynamicForm<CategoryCreateAndUpdateRequest>
      fields={CATEGORY_FIELDS} mode="update" initialData={initialData}
      onSubmit={(data) => CategoryService.updateCategory(id, {
        categoryName: data.categoryName, parentCategoryId: data.parentCategoryId,
      })}
      successMessage="Cập nhật danh mục thành công" onSuccess={onSuccess}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────

const COLUMNS: Column<CategoryRecord>[] = [
  { key: 'categoryName', label: 'Tên danh mục', sortable: true, searchable: true },
  { key: 'parentCategoryName', label: 'Danh mục cha',
    render: (item) => (
      <span style={{ color: item.parentCategoryName ? '#111827' : '#9ca3af', fontStyle: item.parentCategoryName ? 'normal' : 'italic' }}>
        {(item.parentCategoryName as string) || 'Không có'}
      </span>
    ),
  },
];

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await CategoryService.getCategoriesPaged(0, 1000, undefined, 'categoryName', 'asc');
      setCategories(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: CategoryRecord) => {
    if (!confirm(`Xóa danh mục "${item.categoryName}"?`)) return;
    try { await CategoryService.deleteCategory(item.categoryId); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Lỗi khi xóa'); }
  };

  const handleEdit = (item: CategoryRecord) => { setSelectedId(item.categoryId as number); setShowUpdate(true); };

  const actions: Action<CategoryRecord>[] = [
    { label: 'Sửa', onClick: handleEdit,   variant: 'primary' },
    { label: 'Xóa', onClick: handleDelete, variant: 'danger'  },
  ];

  if (loading && categories.length === 0) return <AdminPageState loading error={null} onRetry={load} />;
  if (error   && categories.length === 0) return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý danh mục</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo danh mục mới</button>
      </div>

      <DynamicList
        data={categories as CategoryRecord[]} columns={COLUMNS} actions={actions}
        keyExtractor={(item) => item.categoryId as number}
        emptyMessage="Không có danh mục nào" loading={loading} showGlobalSearch pageSize={10}
      />

      <AdminModal open={showCreate} title="Tạo danh mục mới" onClose={() => setShowCreate(false)}>
        <CategoryFormCreate onSuccess={() => { setShowCreate(false); load(); }} />
      </AdminModal>

      <AdminModal
        open={showUpdate && selectedId !== null} title="Cập nhật danh mục"
        onClose={() => { setShowUpdate(false); setSelectedId(null); }}
      >
        {selectedId !== null && (
          <CategoryFormUpdate id={selectedId}
            onSuccess={() => { setShowUpdate(false); setSelectedId(null); load(); }} />
        )}
      </AdminModal>
    </div>
  );
};

export default CategoryPage;