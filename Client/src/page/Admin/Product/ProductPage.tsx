// src/pages/Admin/Product/ProductPage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type { Column, Action } from "../../../Components/Admin/List/DynamicList";
import { ProductService } from "../../../Service/ProductService";
import type { ProductResponse } from "../../../type/product/ProductResponse";
import ProductFormCreate from "./ProductFormCreate";
import ProductFormUpdate from "./ProductFormUpdate";
import AdminModal from "../../../Components/Admin/common/AdminModal/AdminModal";
import AdminPageState from "../../../Components/Admin/common/AdminPageState/AdminPageState";
import styles from "./ProductPage.module.scss";

type ProductRecord = ProductResponse & Record<string, unknown>;

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState<string | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showUpdate, setShowUpdate]   = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true); setError(null);
      const res = await ProductService.getProductsPaged(0, 1000, undefined, undefined, "name", "asc");
      setProducts(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : "Có lỗi xảy ra"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: ProductRecord) => {
    if (!confirm(`Xóa sản phẩm "${item.name}"?`)) return;
    try { await ProductService.deleteProduct(item.id); fetch(); }
    catch (err) { alert(err instanceof Error ? err.message : "Lỗi khi xóa"); }
  };

  const handleEdit = (item: ProductRecord) => { setSelectedId(item.id as string); setShowUpdate(true); };

  const columns: Column<ProductRecord>[] = [
    { key: "name", label: "Tên sản phẩm", sortable: true, searchable: true },
    { key: "price", label: "Giá", sortable: true,
      render: (item) => <span style={{ fontWeight: 700, color: '#22c55e' }}>{(item.price as number).toLocaleString("vi-VN")}₫</span> },
    { key: "img", label: "Ảnh", render: (item) => (
        <img src={`http://localhost:8080${item.img}`} alt={item.name as string}
          style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/72?text=N/A'; }} />
      )},
    { key: "description", label: "Mô tả", searchable: true,
      render: (item) => <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.description as string}</span> },
  ];

  const actions: Action<ProductRecord>[] = [
    { label: "Sửa", onClick: handleEdit,   variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger"  },
  ];

  if (loading && products.length === 0) return <AdminPageState loading error={null} onRetry={fetch} />;
  if (error   && products.length === 0) return <AdminPageState loading={false} error={error} onRetry={fetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý sản phẩm</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo sản phẩm mới</button>
      </div>
      <DynamicList
        data={products as ProductRecord[]} columns={columns} actions={actions}
        keyExtractor={(item) => item.id as string}
        emptyMessage="Không có sản phẩm nào" loading={loading}
        showGlobalSearch pageSize={10}
      />
      <AdminModal open={showCreate} title="Tạo sản phẩm mới" onClose={() => setShowCreate(false)} size="lg">
        <ProductFormCreate onSuccess={() => { setShowCreate(false); fetch(); }} />
      </AdminModal>
      <AdminModal open={showUpdate && selectedId !== null} title="Cập nhật sản phẩm" onClose={() => { setShowUpdate(false); setSelectedId(null); }} size="lg">
        {selectedId && <ProductFormUpdate id={selectedId} onSuccess={() => { setShowUpdate(false); setSelectedId(null); fetch(); }} />}
      </AdminModal>
    </div>
  );
};
export default ProductPage;