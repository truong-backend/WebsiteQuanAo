// src/pages/admin/ProductVariantPage.tsx
import { useState, useEffect } from 'react';
import DynamicList from '@/components/admin/DynamicList';
import type { Column, Action } from '@/components/admin/DynamicList';
import DynamicForm from '@/components/admin/DynamicForm';
import type { FormField, SelectOption } from '@/components/admin/DynamicForm';
import AdminModal from '@/components/admin/AdminModal';
import AdminPageState from '@/components/admin/AdminPageState';
import { ProductVariantService, ProductService, ColorService, SizeService } from '@/modules';
import type { ProductVariantResponse, ProductVariantCreateRequest, ProductVariantUpdateRequest } from '@/types';
import styles from './ProductVariantPage.module.scss';

type VariantRecord = ProductVariantResponse & Record<string, unknown>;

// ─── Shared fields factory ────────────────────────────────────
// Dùng chung cho cả create lẫn update — tránh lặp code
const variantFields = <T extends ProductVariantCreateRequest | ProductVariantUpdateRequest>(): FormField<T>[] => [
  { name: 'productId' as keyof T & string, label: 'Sản phẩm', type: 'select', required: true, placeholder: 'Chọn sản phẩm',
    loadOptions: () => ProductService.getProductSelectOptions() as Promise<SelectOption[]> },
  { name: 'colorCode' as keyof T & string, label: 'Màu sắc',  type: 'select', required: true, placeholder: 'Chọn màu',
    loadOptions: () => ColorService.getColorSelectOptions() as Promise<SelectOption[]> },
  { name: 'sizeId'    as keyof T & string, label: 'Kích cỡ',  type: 'select', required: true, placeholder: 'Chọn size',
    loadOptions: () => SizeService.getSizeSelectOptions() as Promise<SelectOption[]> },
  { name: 'quantity'  as keyof T & string, label: 'Số lượng', type: 'number', required: true, placeholder: 'Nhập số lượng' },
  { name: 'img'       as keyof T & string, label: 'Hình ảnh', type: 'image',  required: true },
];

// ─── Sub-forms ────────────────────────────────────────────────

function ProductVariantFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicForm<ProductVariantCreateRequest>
      fields={variantFields<ProductVariantCreateRequest>()} mode="create"
      onSubmit={(data) => ProductVariantService.createProductVariant(data)}
      successMessage="Tạo biến thể sản phẩm thành công" onSuccess={onSuccess}
    />
  );
}

function ProductVariantFormUpdate({ id, onSuccess }: { id: string; onSuccess?: () => void }) {
  const [initialData, setInitialData] = useState<ProductVariantUpdateRequest | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    ProductVariantService.getProductVariantById(id)
      .then((v) => setInitialData({ quantity: v.quantity, img: v.img, productId: v.productId, colorCode: v.colorCode, sizeId: v.sizeId }))
      .catch(() => alert('Không thể tải dữ liệu biến thể sản phẩm'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading || !initialData) return (
    <div style={{ textAlign: 'center', padding: '16px' }}>Đang tải dữ liệu...</div>
  );

  return (
    <DynamicForm<ProductVariantUpdateRequest>
      fields={variantFields<ProductVariantUpdateRequest>()} mode="update" initialData={initialData}
      onSubmit={(data) => ProductVariantService.updateProductVariant(id, data)}
      successMessage="Cập nhật biến thể sản phẩm thành công" onSuccess={onSuccess}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────

const COLUMNS: Column<VariantRecord>[] = [
  { key: 'productName', label: 'Sản phẩm', sortable: true, searchable: true },
  { key: 'colorName',   label: 'Màu',       sortable: true, searchable: true },
  { key: 'sizeId',      label: 'Kích cỡ',  sortable: true },
  { key: 'quantity',    label: 'Số lượng', sortable: true },
  { key: 'img', label: 'Ảnh',
    render: (item) => (
      <img src={`http://localhost:8080${item.img}`}
        style={{ width: 80, height: 56, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/80?text=N/A'; }}
      />
    ),
  },
];

const ProductVariantPage: React.FC = () => {
  const [variants, setVariants]     = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await ProductVariantService.getProductVariantsPaged(0, 1000, undefined, 'id', 'asc');
      setVariants(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: VariantRecord) => {
    if (!confirm(`Xóa biến thể "${item.productName}"?`)) return;
    try { await ProductVariantService.deleteProductVariant(item.id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Lỗi khi xóa'); }
  };

  const handleEdit = (item: VariantRecord) => { setSelectedId(item.id as string); setShowUpdate(true); };

  const actions: Action<VariantRecord>[] = [
    { label: 'Sửa', onClick: handleEdit,   variant: 'primary' },
    { label: 'Xóa', onClick: handleDelete, variant: 'danger'  },
  ];

  if (loading && variants.length === 0) return <AdminPageState loading error={null} onRetry={load} />;
  if (error   && variants.length === 0) return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý biến thể sản phẩm</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo biến thể mới</button>
      </div>

      <DynamicList
        data={variants as VariantRecord[]} columns={COLUMNS} actions={actions}
        keyExtractor={(item) => item.id as string}
        emptyMessage="Không có biến thể nào" loading={loading} showGlobalSearch pageSize={10}
      />

      <AdminModal open={showCreate} title="Tạo biến thể mới" onClose={() => setShowCreate(false)} size="lg">
        <ProductVariantFormCreate onSuccess={() => { setShowCreate(false); load(); }} />
      </AdminModal>

      <AdminModal
        open={showUpdate && selectedId !== null} title="Cập nhật biến thể"
        onClose={() => { setShowUpdate(false); setSelectedId(null); }} size="lg"
      >
        {selectedId && (
          <ProductVariantFormUpdate id={selectedId}
            onSuccess={() => { setShowUpdate(false); setSelectedId(null); load(); }} />
        )}
      </AdminModal>
    </div>
  );
};

export default ProductVariantPage;