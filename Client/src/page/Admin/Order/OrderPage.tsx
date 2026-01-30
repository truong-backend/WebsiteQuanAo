import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { OrderService } from "../../../Service/OrderService";
import OrderFormCreate from "./OrderFormCreate";
import OrderFormUpdate from "./OrderFormUpdate";
// Import generic components
import { SearchBox } from "../../../Components/Admin/Search/SearchBox";
import { SortControl } from "../../../Components/Admin/SortControl/SortControl";
import type { SortOption } from "../../../Components/Admin/SortControl/SortControl";
import type { SortParams } from "../../../Components/Admin/SortControl/SortControl";
import type { OrderResponse } from "../../../type/Orders/OrderResponse";
import {
  OrderStatus,
  OrderStatusLabels,
  OrderStatusColors,
} from "../../../type/Orders/OrderStatus";

const OrderPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Search, Sort, Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("orderTime");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  // Advanced filter states
  const [filterStatus, setFilterStatus] = useState<OrderStatus | "">("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterAccountId, setFilterAccountId] = useState("");

  // Show/hide advanced filters
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await OrderService.getOrdersPaged(
        currentPage,
        pageSize,
        searchQuery || undefined,
        sortBy,
        sortDir,
        filterStatus || undefined,
        filterStartDate || undefined,
        filterEndDate || undefined,
        filterAccountId ? Number(filterAccountId) : undefined
      );

      setOrders(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when params change
  useEffect(() => {
    fetchOrders();
  }, [
    currentPage,
    searchQuery,
    sortBy,
    sortDir,
    filterStatus,
    filterStartDate,
    filterEndDate,
    filterAccountId,
  ]);

  // Reset to page 0 when search/sort/filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [
    searchQuery,
    sortBy,
    sortDir,
    filterStatus,
    filterStartDate,
    filterEndDate,
    filterAccountId,
  ]);

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

  const handleClearFilters = () => {
    setFilterStatus("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterAccountId("");
  };

  const handleDelete = async (item: OrderResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng "${item.id}"?`)) {
      return;
    }

    try {
      await OrderService.deleteOrder(item.id);
      alert("Xóa đơn hàng thành công");
      fetchOrders();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: OrderResponse) => {
    setSelectedOrderId(item.id);
    setShowUpdateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchOrders();
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedOrderId(null);
    fetchOrders();
  };

  // ============================================
  // CONFIG FOR GENERIC COMPONENTS
  // ============================================

  const sortOptions: SortOption[] = [
    { value: "orderTime", label: "Thời gian đặt" },
    { value: "id", label: "Mã đơn hàng" },
    { value: "phoneNumber", label: "Số điện thoại" },
    { value: "status", label: "Trạng thái" },
  ];

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<OrderResponse>[] = [
    {
      key: "id",
      label: "Mã đơn hàng",
      render: (value) => (
        <span className="font-mono text-sm">{value as string}</span>
      ),
    },
    {
      key: "orderTime",
      label: "Thời gian đặt",
      render: (value) => {
        const date = new Date(value as string);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString("vi-VN")}</div>
            <div className="text-gray-500">{date.toLocaleTimeString("vi-VN")}</div>
          </div>
        );
      },
    },
    {
      key: "phoneNumber",
      label: "SĐT",
    },
    {
      key: "address",
      label: "Địa chỉ",
      render: (value) => (
        <div className="max-w-xs truncate" title={value as string}>
          {value as string}
        </div>
      ),
    },
    {
      key: "status",
      label: "Trạng thái",
      render: (value) => {
        const status = value as OrderStatus;
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${OrderStatusColors[status]}`}
          >
            {OrderStatusLabels[status]}
          </span>
        );
      },
    },
    {
      key: "accountId",
      label: "Khách hàng",
      render: (value) => (value ? `#${value}` : "—"),
    },
    {
      key: "note",
      label: "Ghi chú",
      render: (value) => {
        if (!value) return "—";
        return (
          <div className="max-w-xs truncate" title={value as string}>
            {value as string}
          </div>
        );
      },
    },
  ];

  const actions: Action<OrderResponse>[] = [
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

  // Check if any filter is active
  const hasActiveFilters =
    filterStatus || filterStartDate || filterEndDate || filterAccountId;

  // ============================================
  // RENDER
  // ============================================

  if (loading && orders.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={fetchOrders}
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
        <h2 className="text-2xl font-bold">Quản lý đơn hàng</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        >
          + Tạo đơn hàng mới
        </button>
      </div>

      {/* Search and Sort Bar */}
      <div className="mb-4 flex flex-col md:flex-row gap-4">
        {/* Search - takes more space */}
        <div className="flex-1">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Tìm kiếm theo mã đơn, SĐT, địa chỉ, trạng thái..."
            debounceMs={500}
          />
        </div>

        {/* Sort */}
        <div className="flex-shrink-0">
          <SortControl
            options={sortOptions}
            onSortChange={handleSortChange}
            defaultSortBy="orderTime"
            defaultSortDir="desc"
          />
        </div>

        {/* Advanced Filter Toggle */}
        <button
          onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
          className={`px-4 py-2 rounded font-medium transition-colors ${
            hasActiveFilters
              ? "bg-blue-500 text-white hover:bg-blue-600"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {showAdvancedFilters ? "Ẩn bộ lọc" : "Bộ lọc nâng cao"}
          {hasActiveFilters && " (đang lọc)"}
        </button>
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Filter by Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as OrderStatus | "")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Tất cả trạng thái</option>
                {Object.values(OrderStatus).map((status) => (
                  <option key={status} value={status}>
                    {OrderStatusLabels[status]}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter by Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Từ ngày
              </label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter by End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Đến ngày
              </label>
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Filter by Account ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID Khách hàng
              </label>
              <input
                type="number"
                value={filterAccountId}
                onChange={(e) => setFilterAccountId(e.target.value)}
                placeholder="Nhập ID khách hàng"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                Xóa tất cả bộ lọc
              </button>
            </div>
          )}
        </div>
      )}

      {loading && orders.length > 0 && (
        <div className="mb-4 text-center text-sm text-gray-500">Đang tải...</div>
      )}

      {/* Table */}
      <DynamicList
        data={orders}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy đơn hàng nào"
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
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tạo đơn hàng mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <OrderFormCreate onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedOrderId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cập nhật đơn hàng</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedOrderId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <OrderFormUpdate id={selectedOrderId} onSuccess={handleUpdateSuccess} />
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderPage;