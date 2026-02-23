import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { SizeService } from "../../../Service/SizeService";
import type { SizesResponse } from "../../../type/size/SizesResponse";
import SizeFormCreate from "./SizeFormCreate";
import SizeFormUpdate from "./SizeFormUpdate";

const SizePage: React.FC = () => {
  const [sizes, setSizes] = useState<SizesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  const fetchSizes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SizeService.getSizesPaged(
        0,
        1000, // Get all for client-side filtering
        undefined,
        "id",
        "asc"
      );

      setSizes(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSizes();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDelete = async (item: SizesResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa kích thước "${item.name}"?`)) {
      return;
    }

    try {
      await SizeService.deleteSize(item.id);
      alert("Xóa kích thước thành công");
      fetchSizes();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: SizesResponse) => {
    setSelectedSizeId(item.id);
    setShowUpdateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchSizes();
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedSizeId(null);
    fetchSizes();
  };

  const handleSearch = (searchText: string) => {
    console.log('Searching for:', searchText);
  };

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<SizesResponse>[] = [
    {
      key: "id",
      label: "Mã kích thước",
      sortable: true,
      searchable: true,
      width: 150,
    },
    {
      key: "name",
      label: "Tên kích thước",
      sortable: true,
      searchable: true,
      width: 200,
    },
  ];

  const actions: Action<SizesResponse>[] = [
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

  if (loading && sizes.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && sizes.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={fetchSizes}
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
        <h2 className="text-2xl font-bold">Quản lý kích thước</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        >
          + Tạo kích thước mới
        </button>
      </div>

      {/* Table with built-in search, sort, filter */}
      <DynamicList
        data={sizes}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy kích thước nào"
        loading={loading}
        showGlobalSearch={true}
        searchPlaceholder="Tìm kiếm theo mã hoặc tên kích thước..."
        onSearch={handleSearch}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} kích thước`,
        }}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tạo kích thước mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <SizeFormCreate onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedSizeId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cập nhật kích thước</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedSizeId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <SizeFormUpdate
              id={selectedSizeId}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SizePage;