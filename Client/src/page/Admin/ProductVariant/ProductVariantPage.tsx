// src/pages/Admin/ProductVariant/ProductVariantPage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type { Column, Action } from "../../../Components/Admin/List/DynamicList";
import { ProductVariantService } from "../../../Service/ProductVariantService";
import type { ProductVariantResponse } from "../../../type/ProductVariant/ProductVariantResponse";
import ProductVariantFormCreate from "./ProductVariantFormCreate";
import ProductVariantFormUpdate from "./ProductVariantFormUpdate";
import AdminModal from "../../../Components/Admin/common/AdminModal/AdminModal";
import AdminPageState from "../../../Components/Admin/common/AdminPageState/AdminPageState";
import styles from "./ProductVariantPage.module.scss";

type VariantRecord = ProductVariantResponse & Record<string, unknown>;

const ProductVariantPage: React.FC = () => {
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showUpdate, setShowUpdate]   = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true); setError(null);
      const res = await ProductVariantService.getProductVariantsPaged(0, 1000, undefined, "id", "asc");
      setVariants(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : "Có lỗi xảy ra"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: VariantRecord) => {
    if (!confirm(`Xóa biến thể "${item.productName}"?`)) return;
    try { await ProductVariantService.deleteProductVariant(item.id); fetch(); }
    catch (err) { alert(err instanceof Error ? err.message : "Lỗi khi xóa"); }
  };

  const handleEdit = (item: VariantRecord) => { setSelectedId(item.id as string); setShowUpdate(true); };

  const columns: Column<VariantRecord>[] = [
    { key: "productName", label: "Sản phẩm",  sortable: true, searchable: true },
    { key: "colorName",   label: "Màu",        sortable: true, searchable: true },
    { key: "sizeId",      label: "Kích cỡ",   sortable: true },
    { key: "quantity",    label: "Số lượng",  sortable: true },
    { key: "img", label: "Ảnh", render: (item) => (
        <img src={`http://localhost:8080${item.img}`}
          style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80?text=N/A'; }} />
      )},
  ];

  const actions: Action<VariantRecord>[] = [
    { label: "Sửa", onClick: handleEdit,   variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger"  },
  ];

  if (loading && variants.length === 0) return <AdminPageState loading error={null} onRetry={fetch} />;
  if (error   && variants.length === 0) return <AdminPageState loading={false} error={error} onRetry={fetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý biến thể sản phẩm</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo biến thể mới</button>
      </div>
      <DynamicList
        data={variants as VariantRecord[]} columns={columns} actions={actions}
        keyExtractor={(item) => item.id as string}
        emptyMessage="Không có biến thể nào" loading={loading}
        showGlobalSearch pageSize={10}
      />
      <AdminModal open={showCreate} title="Tạo biến thể mới" onClose={() => setShowCreate(false)} size="lg">
        <ProductVariantFormCreate onSuccess={() => { setShowCreate(false); fetch(); }} />
      </AdminModal>
      <AdminModal open={showUpdate && selectedId !== null} title="Cập nhật biến thể" onClose={() => { setShowUpdate(false); setSelectedId(null); }} size="lg">
        {selectedId && <ProductVariantFormUpdate id={selectedId} onSuccess={() => { setShowUpdate(false); setSelectedId(null); fetch(); }} />}
      </AdminModal>
    </div>
  );
};
export default ProductVariantPage;