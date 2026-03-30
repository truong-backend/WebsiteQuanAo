// src/features/admin/components/SizePage.tsx
// Moved from: src/pages/admin/SizePage.tsx
// Changed imports: @/modules → ../services/sizeService | @/types → ../types/size.types
import { useState, useEffect } from "react";
import DynamicList from "@/components/admin/Dynamic/DynamicList";
import type { Column, Action } from "@/components/admin/Dynamic/DynamicList";
import DynamicForm from "@/components/admin/Dynamic/DynamicForm";
import type { FormField } from "@/components/admin/Dynamic/DynamicForm";
import AdminModal from "@/components/admin/ui/AdminModal";
import AdminPageState from "@/layouts/admin/AdminPageState";
import { SizeService } from "../services/sizeService";
import type {
  SizesResponse,
  SizeCreateRequest,
  SizeUpdateRequest,
} from "../types/size.types";
import styles from "./SizePage.module.scss";

type SizeRecord = SizesResponse & Record<string, unknown>;

const CREATE_FIELDS: FormField<SizeCreateRequest>[] = [
  {
    name: "id",
    label: "Mã kích thước",
    type: "text",
    placeholder: "VD: S, M, L, XL",
    required: true,
  },
  { name: "name", label: "Tên kích thước", type: "text", required: true },
];

const UPDATE_FIELDS: FormField<SizeUpdateRequest>[] = [
  {
    name: "name",
    label: "Tên kích thước",
    type: "text",
    placeholder: "Nhập tên kích thước",
  },
];

function SizeFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicForm<SizeCreateRequest>
      fields={CREATE_FIELDS}
      mode="create"
      onSubmit={(data) =>
        SizeService.createSize({ id: data.id, name: data.name })
      }
      successMessage="Tạo kích thước thành công"
      onSuccess={onSuccess}
    />
  );
}

function SizeFormUpdate({
  id,
  onSuccess,
}: {
  id: string;
  onSuccess?: () => void;
}) {
  const [initialData, setInitialData] = useState<SizeUpdateRequest | null>(
    null,
  );

  useEffect(() => {
    SizeService.getSizeById(id)
      .then((s) => setInitialData({ name: s.name }))
      .catch(() => alert("Không thể tải dữ liệu kích thước"));
  }, [id]);

  if (!initialData) return <div>Đang tải dữ liệu...</div>;

  return (
    <DynamicForm<SizeUpdateRequest>
      fields={UPDATE_FIELDS}
      mode="update"
      initialData={initialData}
      onSubmit={(data) => SizeService.updateSize(id, data)}
      successMessage="Cập nhật kích thước thành công"
      onSuccess={onSuccess}
    />
  );
}

const COLUMNS: Column<SizeRecord>[] = [
  { key: "id", label: "Mã kích thước", sortable: true, searchable: true },
  { key: "name", label: "Tên kích thước", sortable: true, searchable: true },
];

const SizePage: React.FC = () => {
  const [sizes, setSizes] = useState<SizesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await SizeService.getSizesPaged(
        0,
        1000,
        undefined,
        "id",
        "asc",
      );
      setSizes(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (item: SizeRecord) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    try {
      await SizeService.deleteSize(item.id);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: SizeRecord) => {
    setSelectedId(item.id as string);
    setShowUpdate(true);
  };

  const actions: Action<SizeRecord>[] = [
    { label: "Sửa", onClick: handleEdit, variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger" },
  ];

  if (loading && sizes.length === 0)
    return <AdminPageState loading error={null} onRetry={load} />;
  if (error && sizes.length === 0)
    return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý kích thước</h2>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreate(true)}
        >
          + Tạo mới
        </button>
      </div>
      <DynamicList
        data={sizes as SizeRecord[]}
        columns={COLUMNS}
        actions={actions}
        keyExtractor={(item) => item.id as string}
        emptyMessage="Không có dữ liệu"
        loading={loading}
        showGlobalSearch
        pageSize={10}
      />
      <AdminModal
        open={showCreate}
        title="Tạo mới"
        onClose={() => setShowCreate(false)}
      >
        <SizeFormCreate
          onSuccess={() => {
            setShowCreate(false);
            load();
          }}
        />
      </AdminModal>
      <AdminModal
        open={showUpdate && selectedId !== null}
        title="Cập nhật"
        onClose={() => {
          setShowUpdate(false);
          setSelectedId(null);
        }}
      >
        {selectedId && (
          <SizeFormUpdate
            id={selectedId}
            onSuccess={() => {
              setShowUpdate(false);
              setSelectedId(null);
              load();
            }}
          />
        )}
      </AdminModal>
    </div>
  );
};

export default SizePage;