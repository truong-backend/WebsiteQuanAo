// src/pages/admin/ProductPage.tsx
import { useState, useEffect } from 'react';
import DynamicList from '@/components/admin/DynamicList';
import type { Column, Action } from '@/components/admin/DynamicList';
import DynamicForm from '@/components/admin/DynamicForm';
import type { FormField, SelectOption } from '@/components/admin/DynamicForm';
import AdminModal from '@/components/admin/AdminModal';
import AdminPageState from '@/components/admin/AdminPageState';
import { ProductService, CategoryService } from '@/modules';
import type { ProductResponse, ProductCreateRequest, ProductUpdateRequest } from '@/types';
import styles from './ProductPage.module.scss';

type ProductRecord = ProductResponse & Record<string, unknown>;

// ─── Form fields ──────────────────────────────────────────────

const CREATE_FIELDS: FormField<ProductCreateRequest>[] = [
  { name: 'name',        label: 'Tên sản phẩm',  type: 'text',     required: true, placeholder: 'Nhập tên sản phẩm' },
  { name: 'description', label: 'Mô tả',          type: 'textarea', required: true, placeholder: 'Nhập mô tả sản phẩm' },
  { name: 'price',       label: 'Giá',            type: 'number',   required: true, placeholder: 'Nhập giá sản phẩm' },
  { name: 'path',        label: 'Đường dẫn',      type: 'text',     required: true, placeholder: 'vd: ao-thun-nam' },
  { name: 'img',         label: 'Hình ảnh chính', type: 'image',    required: true },
  { name: 'hoverImg',    label: 'Hình ảnh hover', type: 'image' },
  { name: 'categoryId',  label: 'Danh mục',       type: 'select',   required: true,
    loadOptions: () => CategoryService.getCategorySelectOptions() as Promise<SelectOption[]> },
];

const UPDATE_FIELDS: FormField<ProductUpdateRequest>[] = [
  { name: 'name',          label: 'Tên sản phẩm',    type: 'text',     required: true },
  { name: 'description',   label: 'Mô tả',            type: 'textarea', required: true },
  { name: 'price',         label: 'Giá',              type: 'number',   required: true },
  { name: 'path',          label: 'Đường dẫn',        type: 'text',     required: true },
  { name: 'img',           label: 'Hình ảnh chính',   type: 'image',    required: true },
  { name: 'hoverImg',      label: 'Hình ảnh hover',   type: 'image' },
  { name: 'productTypeId', label: 'Loại sản phẩm ID', type: 'number',   required: true },
];

// ─── Sub-forms ────────────────────────────────────────────────

function ProductFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicForm<ProductCreateRequest>
      fields={CREATE_FIELDS} mode="create"
      onSubmit={(data) => ProductService.createProduct(data)}
      successMessage="Tạo sản phẩm thành công" onSuccess={onSuccess}
    />
  );
}

function ProductFormUpdate({ id, onSuccess }: { id: string; onSuccess?: () => void }) {
  const [initialData, setInitialData] = useState<ProductUpdateRequest | null>(null);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    ProductService.getById(id)
      .then((p) => {
        if (!p) return;
        setInitialData({ name: p.name, description: p.description, price: p.price,
          path: p.path, img: p.img, hoverImg: p.hoverImg, productTypeId: p.productTypeId });
      })
      .catch(() => alert('Không thể tải dữ liệu sản phẩm'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)      return <div style={{ textAlign: 'center', padding: '16px' }}>Đang tải dữ liệu...</div>;
  if (!initialData) return <div style={{ textAlign: 'center', padding: '16px', color: '#ef4444' }}>Không tìm thấy sản phẩm</div>;

  return (
    <DynamicForm<ProductUpdateRequest>
      fields={UPDATE_FIELDS} mode="update" initialData={initialData}
      onSubmit={(data) => ProductService.updateProduct(id, data)}
      successMessage="Cập nhật sản phẩm thành công" onSuccess={onSuccess}
    />
  );
}

// ─── Page ─────────────────────────────────────────────────────

const COLUMNS: Column<ProductRecord>[] = [
  { key: 'name',  label: 'Tên sản phẩm', sortable: true, searchable: true },
  { key: 'price', label: 'Giá',          sortable: true,
    render: (item) => (
      <span style={{ fontWeight: 700, color: '#22c55e' }}>
        {(item.price as number).toLocaleString('vi-VN')}₫
      </span>
    ),
  },
  { key: 'img', label: 'Ảnh',
    render: (item) => (
      <img src={`http://localhost:8080${item.img}`} alt={item.name as string}
        style={{ width: 72, height: 48, objectFit: 'cover', borderRadius: 8, border: '1px solid #e5e7eb' }}
        onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/72?text=N/A'; }}
      />
    ),
  },
  { key: 'description', label: 'Mô tả', searchable: true,
    render: (item) => (
      <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {item.description as string}
      </span>
    ),
  },
];

const ProductPage: React.FC = () => {
  const [products, setProducts]     = useState<ProductResponse[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true); setError(null);
      const res = await ProductService.getProductsPaged(0, 1000, undefined, undefined, 'name', 'asc');
      setProducts(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : 'Có lỗi xảy ra'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (item: ProductRecord) => {
    if (!confirm(`Xóa sản phẩm "${item.name}"?`)) return;
    try { await ProductService.deleteProduct(item.id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Lỗi khi xóa'); }
  };

  const handleEdit = (item: ProductRecord) => { setSelectedId(item.id as string); setShowUpdate(true); };

  const actions: Action<ProductRecord>[] = [
    { label: 'Sửa', onClick: handleEdit,   variant: 'primary' },
    { label: 'Xóa', onClick: handleDelete, variant: 'danger'  },
  ];

  if (loading && products.length === 0) return <AdminPageState loading error={null} onRetry={load} />;
  if (error   && products.length === 0) return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý sản phẩm</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo sản phẩm mới</button>
      </div>

      <DynamicList
        data={products as ProductRecord[]} columns={COLUMNS} actions={actions}
        keyExtractor={(item) => item.id as string}
        emptyMessage="Không có sản phẩm nào" loading={loading} showGlobalSearch pageSize={10}
      />

      <AdminModal open={showCreate} title="Tạo sản phẩm mới" onClose={() => setShowCreate(false)} size="lg">
        <ProductFormCreate onSuccess={() => { setShowCreate(false); load(); }} />
      </AdminModal>

      <AdminModal
        open={showUpdate && selectedId !== null} title="Cập nhật sản phẩm"
        onClose={() => { setShowUpdate(false); setSelectedId(null); }} size="lg"
      >
        {selectedId && (
          <ProductFormUpdate id={selectedId}
            onSuccess={() => { setShowUpdate(false); setSelectedId(null); load(); }} />
        )}
      </AdminModal>
    </div>
  );
};

export default ProductPage;