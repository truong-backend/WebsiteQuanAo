// src/features/admin/components/ColorPage.tsx
// Moved from: src/pages/admin/ColorPage.tsx
// Changed imports: @/modules → ../services/colorService | @/types → ../types/color.types
import { useState, useEffect } from "react";
import DynamicList from "@/components/admin/Dynamic/DynamicList";
import type { Column, Action } from "@/components/admin/Dynamic/DynamicList";
import DynamicForm from "@/components/admin/Dynamic/DynamicForm";
import type { FormField } from "@/components/admin/Dynamic/DynamicForm";
import AdminModal from "@/components/admin/ui/AdminModal";
import AdminPageState from "@/layouts/admin/AdminPageState";
import { ColorService } from "../services/colorService";
import type {
  ColorResponse,
  ColorCreateRequest,
  ColorUpdateRequest,
} from "../types/color.types";
import styles from "./ColorPage.module.scss";

type ColorRecord = ColorResponse & Record<string, unknown>;

const CREATE_FIELDS: FormField<ColorCreateRequest>[] = [
  {
    name: "code",
    label: "Mã màu",
    type: "text",
    placeholder: "Nhập mã màu (#ffffff)",
    required: true,
  },
  { name: "name", label: "Tên màu", type: "text", required: true },
];

const UPDATE_FIELDS: FormField<ColorUpdateRequest>[] = [
  { name: "name", label: "Tên màu", type: "text", placeholder: "Nhập tên màu" },
];

function ColorFormCreate({ onSuccess }: { onSuccess?: () => void }) {
  return (
    <DynamicForm<ColorCreateRequest>
      fields={CREATE_FIELDS}
      mode="create"
      onSubmit={(data) =>
        ColorService.createColor({ code: data.code, name: data.name })
      }
      successMessage="Tạo màu thành công"
      onSuccess={onSuccess}
    />
  );
}

function ColorFormUpdate({
  id,
  onSuccess,
}: {
  id: string;
  onSuccess?: () => void;
}) {
  const [initialData, setInitialData] = useState<ColorUpdateRequest | null>(
    null,
  );

  useEffect(() => {
    ColorService.getColorById(id)
      .then((c) => setInitialData({ name: c.name }))
      .catch(() => alert("Không thể tải dữ liệu màu"));
  }, [id]);

  if (!initialData) return <div>Đang tải dữ liệu...</div>;

  return (
    <DynamicForm<ColorUpdateRequest>
      fields={UPDATE_FIELDS}
      mode="update"
      initialData={initialData}
      onSubmit={(data) => ColorService.updateColor(id, data)}
      successMessage="Cập nhật màu thành công"
      onSuccess={onSuccess}
    />
  );
}

const COLUMNS: Column<ColorRecord>[] = [
  {
    key: "code",
    label: "Mã màu",
    sortable: true,
    searchable: true,
    render: (item) => (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 6,
            backgroundColor: item.code as string,
            border: "1px solid #e5e7eb",
            cursor: "pointer",
          }}
          title="Click để copy"
          onClick={() => {
            navigator.clipboard.writeText(item.code as string);
            alert("Đã copy: " + item.code);
          }}
        />
        <span style={{ fontWeight: 500 }}>{item.code}</span>
      </div>
    ),
  },
  { key: "name", label: "Tên màu", sortable: true, searchable: true },
];

const ColorPage: React.FC = () => {
  const [colors, setColors] = useState<ColorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ColorService.getColorsPaged(
        0,
        1000,
        undefined,
        "code",
        "asc",
      );
      setColors(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (item: ColorRecord) => {
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    try {
      await ColorService.deleteColor(item.code);
      load();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: ColorRecord) => {
    setSelectedId(item.code as string);
    setShowUpdate(true);
  };

  const actions: Action<ColorRecord>[] = [
    { label: "Sửa", onClick: handleEdit, variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger" },
  ];

  if (loading && colors.length === 0)
    return <AdminPageState loading error={null} onRetry={load} />;
  if (error && colors.length === 0)
    return <AdminPageState loading={false} error={error} onRetry={load} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý màu sắc</h2>
        <button
          className={styles.createBtn}
          onClick={() => setShowCreate(true)}
        >
          + Tạo mới
        </button>
      </div>
      <DynamicList
        data={colors as ColorRecord[]}
        columns={COLUMNS}
        actions={actions}
        keyExtractor={(item) => item.code as string}
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
        <ColorFormCreate
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
          <ColorFormUpdate
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

export default ColorPage;