import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { ColorService } from "../../../Service/ColorService";
import ColorFormCreate from "./ColorFormCreate";
import ColorFormUpdate from "./ColorFormUpdate";
import type { ColorResponse } from "../../../type/Color/ColorResponse";

// Extend ColorResponse so it satisfies DynamicList's Record<string, unknown> constraint
type ColorRecord = ColorResponse & Record<string, unknown>;

const ColorPage: React.FC = () => {
  const [colors, setColors] = useState<ColorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  const fetchColors = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ColorService.getColorsPaged(
        0,
        1000,
        undefined,
        "code",
        "asc"
      );
      setColors(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColors();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDelete = async (item: ColorRecord) => {
    if (!confirm(`Bạn có chắc muốn xóa màu "${item.name}"?`)) return;
    try {
      await ColorService.deleteColor(item.code);
      alert("Xóa màu thành công");
      fetchColors();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: ColorRecord) => {
    setSelectedColorId(item.code);
    setShowUpdateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchColors();
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedColorId(null);
    fetchColors();
  };

  const handleSearch = (searchText: string) => {
    console.log("Searching for:", searchText);
  };

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<ColorRecord>[] = [
    {
      key: "code",
      label: "Mã màu",
      sortable: true,
      searchable: true,
      width: 150,
    },
    {
      key: "name",
      label: "Tên màu",
      sortable: true,
      searchable: true,
      width: 200,
    },
  ];

  const actions: Action<ColorRecord>[] = [
    {
      label: "Sửa",
      onClick: handleEdit,
      variant: "primary",
    },
    {
      label: "Xóa",
      onClick: handleDelete,
      variant: "danger",
    },
  ];

  // ============================================
  // RENDER
  // ============================================

  if (loading && colors.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && colors.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={fetchColors}
            className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Quản lý màu sắc</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        >
          + Tạo màu mới
        </button>
      </div>

      {/* Table with built-in search, sort, filter */}
      <DynamicList
        data={colors as ColorRecord[]}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.code as string}
        emptyMessage="Không tìm thấy màu nào"
        loading={loading}
        showGlobalSearch={true}
        searchPlaceholder="Tìm kiếm theo mã hoặc tên màu..."
        onSearch={handleSearch}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} màu`,
        }}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tạo màu mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <ColorFormCreate onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedColorId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cập nhật màu</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedColorId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <ColorFormUpdate id={selectedColorId} onSuccess={handleUpdateSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPage;