// src/pages/Admin/Category/CategoryPage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type { Column, Action } from "../../../Components/Admin/List/DynamicList";
import { categoryService } from "../../../Service/categoryService";
import type { CategoryResponse } from "../../../type/categotry/CategoryResponse";
// import type { CategoryOption } from "../../../type/categotry/CategoryOption";
import CategoryFormCreate from "./CategoryFormCreate";
import CategoryFormUpdate from "./CategoryFormUpdate";
import AdminModal from "../../../Components/Admin/common/AdminModal/AdminModal";
import AdminPageState from "../../../Components/Admin/common/AdminPageState/AdminPageState";
import styles from "./CategoryPage.module.scss";

type CategoryRecord = CategoryResponse & Record<string, unknown>;

const CategoryPage: React.FC = () => {
  const [categories, setCategories]         = useState<CategoryResponse[]>([]);
  // const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showUpdate, setShowUpdate]   = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // useEffect(() => {
  //   categoryService.getRootCategoryOptions().then(setCategoryOptions).catch(console.error);
  // }, []);

  const fetch = async () => {
    try {
      setLoading(true); setError(null);
      const res = await categoryService.getCategoriesPaged(0, 1000, undefined, "categoryName", "asc", undefined);
      setCategories(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : "Có lỗi xảy ra"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: CategoryRecord) => {
    if (!confirm(`Xóa danh mục "${item.categoryName}"?`)) return;
    try { await categoryService.deleteCategory(item.categoryId); fetch(); }
    catch (err) { alert(err instanceof Error ? err.message : "Lỗi khi xóa"); }
  };

  const handleEdit = (item: CategoryRecord) => { setSelectedId(item.categoryId as number); setShowUpdate(true); };

  const columns: Column<CategoryRecord>[] = [
    { key: "categoryName",       label: "Tên danh mục", sortable: true, searchable: true },
    {
      key: "parentCategoryName",
      label: "Danh mục cha",
      render: (item) => (
        <span style={{ color: item.parentCategoryName ? '#111827' : '#9ca3af', fontStyle: item.parentCategoryName ? 'normal' : 'italic' }}>
          {(item.parentCategoryName as string) || "Không có"}
        </span>
      ),
    },
  ];

  const actions: Action<CategoryRecord>[] = [
    { label: "Sửa", onClick: handleEdit,   variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger"  },
  ];

  if (loading && categories.length === 0) return <AdminPageState loading error={null} onRetry={fetch} />;
  if (error   && categories.length === 0) return <AdminPageState loading={false} error={error} onRetry={fetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý danh mục</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo danh mục mới</button>
      </div>
      <DynamicList
        data={categories as CategoryRecord[]} columns={columns} actions={actions}
        keyExtractor={(item) => item.categoryId as number}
        emptyMessage="Không có danh mục nào" loading={loading}
        showGlobalSearch pageSize={10}
      />
      <AdminModal open={showCreate} title="Tạo danh mục mới" onClose={() => setShowCreate(false)}>
        <CategoryFormCreate onSuccess={() => { setShowCreate(false); fetch(); }} />
      </AdminModal>
      <AdminModal open={showUpdate && selectedId !== null} title="Cập nhật danh mục" onClose={() => { setShowUpdate(false); setSelectedId(null); }}>
        {selectedId !== null && <CategoryFormUpdate id={selectedId} onSuccess={() => { setShowUpdate(false); setSelectedId(null); fetch(); }} />}
      </AdminModal>
    </div>
  );
};
export default CategoryPage;