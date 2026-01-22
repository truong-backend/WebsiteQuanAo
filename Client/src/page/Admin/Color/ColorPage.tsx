import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { ColorService } from "../../../Service/ColorService";
import ColorFormCreate from "./ColorFormCreate";
import ColorFormUpdate from "./ColorFormUpdate";
// Import generic components
import { SearchBox } from "../../../Components/Admin/Search/SearchBox";
import { SortControl } from "../../../Components/Admin/SortControl/SortControl";
import type { SortOption } from "../../../Components/Admin/SortControl/SortControl";
import type { SortParams } from "../../../Components/Admin/SortControl/SortControl";
import type { ColorResponse } from "../../../type/Color/ColorResponse";

const ColorPage: React.FC = () => {
  const [colors, setColors] = useState<ColorResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedColorId, setSelectedColorId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Search, Sort, Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("code");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchColors = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ColorService.getColorsPaged(
        currentPage,
        pageSize,
        searchQuery || undefined,
        sortBy,
        sortDir
      );

      setColors(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when params change
  useEffect(() => {
    fetchColors();
  }, [currentPage, searchQuery, sortBy, sortDir]);

  // Reset to page 0 when search/sort/filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, sortBy, sortDir]);

  // ============================================
  // HANDLERS
  // ============================================

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleSortChange = (params: SortParams) => {
    setSortBy(params.sortBy);
    setSortDir(params.sortDir);
  };

  const handleDelete = async (item: ColorResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa màu "${item.name}"?`)) {
      return;
    }

    try {
      await ColorService.deleteColor(item.code);
      alert("Xóa màu thành công");
      fetchColors();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: ColorResponse) => {
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

  // ============================================
  // CONFIG FOR GENERIC COMPONENTS
  // ============================================

  const sortOptions: SortOption[] = [
    { value: "code", label: "Mã màu" },
    { value: "name", label: "Tên màu" },
  ];

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<ColorResponse>[] = [
    {
      key: "code",
      label: "ID",
    },
    {
      key: "name",
      label: "Tên màu",
    },
  ];

  const actions: Action<ColorResponse>[] = [
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

      {/* Search, Sort, Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search - takes more space */}
        <div className="flex-1">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Tìm kiếm theo tên màu..."
            debounceMs={500}
          />
        </div>

        {/* Sort */}
        <div className="flex-shrink-0">
          <SortControl
            options={sortOptions}
            onSortChange={handleSortChange}
            defaultSortBy="code"
            defaultSortDir="asc"
          />
        </div>
      </div>

      {loading && colors.length > 0 && (
        <div className="mb-4 text-center text-sm text-gray-500">
          Đang tải...
        </div>
      )}

      {/* Table */}
      <DynamicList
        data={colors}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.code}
        emptyMessage="Không tìm thấy màu nào"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Trang trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() =>
              setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
            }
            disabled={currentPage >= totalPages - 1}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Trang sau
          </button>
        </div>
      )}

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
            <ColorFormUpdate
              id={selectedColorId}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ColorPage;