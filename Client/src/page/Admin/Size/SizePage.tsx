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

// Import generic components
import { SearchBox } from "../../../Components/Admin/Search/SearchBox";
import { SortControl } from "../../../Components/Admin/SortControl/SortControl";
import type { SortOption } from "../../../Components/Admin/SortControl/SortControl";
import type { SortParams } from "../../../Components/Admin/SortControl/SortControl";

const SizePage: React.FC = () => {
  const [sizes, setSizes] = useState<SizesResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Search, Sort, Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("categoryId");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchSizes = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await SizeService.getSizesPaged(
        currentPage,
        pageSize,
        searchQuery || undefined,
        sortBy,
        sortDir
      );

      setSizes(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when params change
  useEffect(() => {
    fetchSizes();
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


  const handleDelete = async (item: SizesResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${item.name}"?`)) {
      return;
    }

    try {
      await SizeService.deleteSize(item.id);
      alert("Xóa danh mục thành công");
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

  // ============================================
  // CONFIG FOR GENERIC COMPONENTS
  // ============================================

  const sortOptions: SortOption[] = [
    { value: "categoryId", label: "Mã danh mục" },
    { value: "categoryName", label: "Tên danh mục" },
    // { value: 'parentCategoryId', label: 'Danh mục cha' }
  ];



  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<SizesResponse>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Tên danh mục",
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
        <h2 className="text-2xl font-bold">Quản lý danh mục</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        >
          + Tạo danh mục mới
        </button>
      </div>

      {/* Search, Sort, Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search - takes more space */}
        <div className="flex-1">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Tìm kiếm theo tên danh mục..."
            debounceMs={500}
          />
        </div>

        {/* Sort */}
        <div className="flex-shrink-0">
          <SortControl
            options={sortOptions}
            onSortChange={handleSortChange}
            defaultSortBy="categoryId"
            defaultSortDir="asc"
          />
        </div>

      </div>


      {loading && sizes.length > 0 && (
        <div className="mb-4 text-center text-sm text-gray-500">
          Đang tải...
        </div>
      )}

      {/* Table */}
      <DynamicList
        data={sizes}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy danh mục nào"
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
              <h3 className="text-xl font-bold">Tạo danh mục mới</h3>
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
              <h3 className="text-xl font-bold">Cập nhật danh mục</h3>
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
