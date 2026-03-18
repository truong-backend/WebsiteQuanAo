// src/pages/Admin/SizePage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type { Column, Action } from "../../../Components/Admin/List/DynamicList";
import { SizeService } from "../../../Service/SizeService";
import type { SizesResponse } from "../../../type/size/SizesResponse";
import SizeFormCreate from "./SizeFormCreate";
import SizeFormUpdate from "./SizeFormUpdate";
import AdminModal from "../../../Components/Admin/common/AdminModal/AdminModal";
import AdminPageState from "../../../Components/Admin/common/AdminPageState/AdminPageState";
import styles from "./SizePage.module.scss";

type SizesResponseRecord = SizesResponse & Record<string, unknown>;

const SizePage: React.FC = () => {
  const [sizes, setSizesResponses] = useState<SizesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [showCreate, setShowCreate]   = useState(false);
  const [showUpdate, setShowUpdate]   = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetch = async () => {
    try {
      setLoading(true); setError(null);
      const res = await SizeService.getSizesPaged(0, 1000, undefined, "id", "asc");
      setSizesResponses(res.content);
    } catch (err) { setError(err instanceof Error ? err.message : "Có lỗi xảy ra"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (item: SizesResponseRecord) => {
    if (!confirm(`Bạn có chắc muốn xóa?`)) return;
    try { await SizeService.deleteSize(item.id); fetch(); }
    catch (err) { alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa"); }
  };

  const handleEdit = (item: SizesResponseRecord) => { setSelectedId(item.id as string); setShowUpdate(true); };
  const onCreateOk = () => { setShowCreate(false); fetch(); };
  const onUpdateOk = () => { setShowUpdate(false); setSelectedId(null); fetch(); };

  const columns: Column<SizesResponseRecord>[] = [{ key: "id",   label: "Mã kích thước", sortable: true, searchable: true },
    { key: "name", label: "Tên kích thước", sortable: true, searchable: true }];
  const actions: Action<SizesResponseRecord>[] = [
    { label: "Sửa", onClick: handleEdit,   variant: "primary" },
    { label: "Xóa", onClick: handleDelete, variant: "danger"  },
  ];

  if (loading && sizes.length === 0) return <AdminPageState loading error={null} onRetry={fetch} />;
  if (error   && sizes.length === 0) return <AdminPageState loading={false} error={error} onRetry={fetch} />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h2 className={styles.title}>Quản lý kích thước</h2>
        <button className={styles.createBtn} onClick={() => setShowCreate(true)}>+ Tạo mới</button>
      </div>
      <DynamicList
        data={sizes as SizesResponseRecord[]}
        columns={columns} actions={actions}
        keyExtractor={(item) => item.id as string | number}
        emptyMessage="Không có dữ liệu" loading={loading}
        showGlobalSearch pageSize={10}
      />
      <AdminModal open={showCreate} title="Tạo mới" onClose={() => setShowCreate(false)}>
        <SizeFormCreate onSuccess={onCreateOk} />
      </AdminModal>
      <AdminModal open={showUpdate && selectedId !== null} title="Cập nhật" onClose={() => { setShowUpdate(false); setSelectedId(null); }}>
        {selectedId !== null && <SizeFormUpdate id={selectedId} onSuccess={onUpdateOk} />}
      </AdminModal>
    </div>
  );
};
export default SizePage;