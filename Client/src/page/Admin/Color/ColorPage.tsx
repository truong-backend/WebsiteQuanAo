// src/pages/Admin/ColorPage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { ColorService } from "../../../Service/ColorService";
import type { ColorResponse } from "../../../type/Color/ColorResponse";
import ColorFormCreate from "./ColorFormCreate";
import ColorFormUpdate from "./ColorFormUpdate";
import AdminModal from "../../../Components/Admin/common/AdminModal/AdminModal";
import AdminPageState from "../../../Components/Admin/common/AdminPageState/AdminPageState";
import styles from "./ColorPage.module.scss";

type ColorResponseRecord = ColorResponse & Record<string, unknown>;

const ColorPage: React.FC = () => {
  const [colors, setColorResponses] = useState<ColorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetch = async () => {
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
      setColorResponses(res.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetch();
  }, []);

  const handleDelete = async (item: ColorResponseRecord) => {
    if (!confirm(`Bạn có chắc muốn xóa?`)) return;
    try {
      await ColorService.deleteColor(item.code);
      fetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: ColorResponseRecord) => {
    setSelectedId(item.code as string);
    setShowUpdate(true);
  };
  const onCreateOk = () => {
    setShowCreate(false);
    fetch();
  };
  const onUpdateOk = () => {
    setShowUpdate(false);
    setSelectedId(null);
    fetch();
  };

  const columns: Column<ColorResponseRecord>[] = [
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
    {
      key: "name",
      label: "Tên màu",
      sortable: true,
      searchable: true,
    },
  ];
  const actions: Action<ColorResponseRecord>[] = [
    { label: "Sửa", onClick: handleEdit, variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger" },
  ];

  if (loading && colors.length === 0)
    return <AdminPageState loading error={null} onRetry={fetch} />;
  if (error && colors.length === 0)
    return <AdminPageState loading={false} error={error} onRetry={fetch} />;

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
        data={colors as ColorResponseRecord[]}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.code as string | number}
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
        <ColorFormCreate onSuccess={onCreateOk} />
      </AdminModal>
      <AdminModal
        open={showUpdate && selectedId !== null}
        title="Cập nhật"
        onClose={() => {
          setShowUpdate(false);
          setSelectedId(null);
        }}
      >
        {selectedId !== null && (
          <ColorFormUpdate id={selectedId} onSuccess={onUpdateOk} />
        )}
      </AdminModal>
    </div>
  );
};
export default ColorPage;
