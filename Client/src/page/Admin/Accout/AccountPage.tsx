// src/pages/Admin/Account/AccountPage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { AccountService } from "../../../Service/AccountService";
import AccountFormCreate from "./AccountFormCreate";
import AccountFormUpdate from "./AccountFormUpdate";
// Import generic components
import { SearchBox } from "../../../Components/Admin/Search/SearchBox";
import { SortControl } from "../../../Components/Admin/SortControl/SortControl";
import type { SortOption } from "../../../Components/Admin/SortControl/SortControl";
import type { SortParams } from "../../../Components/Admin/SortControl/SortControl";
import type { AccountResponse } from "../../../type/account/AccountResponse";

const AccountPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Search, Sort, Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [role, setRole] = useState<string | undefined>();
  const [sortBy, setSortBy] = useState("email");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await AccountService.getAccountsPaged(
        currentPage,
        pageSize,
        searchQuery || undefined,
        role,
        sortBy,
        sortDir
      );

      setAccounts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when params change
  useEffect(() => {
    fetchAccounts();
  }, [currentPage, searchQuery, role, sortBy, sortDir]);

  // Reset to page 0 when search/sort/filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, role, sortBy, sortDir]);

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

  const handleDelete = async (item: AccountResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa tài khoản "${item.email}"?`)) {
      return;
    }

    try {
      await AccountService.deleteAccount(item.id);
      alert("Xóa tài khoản thành công");
      fetchAccounts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: AccountResponse) => {
    setSelectedAccountId(item.id);
    setShowUpdateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchAccounts();
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedAccountId(null);
    fetchAccounts();
  };

  // ============================================
  // CONFIG FOR GENERIC COMPONENTS
  // ============================================

  const sortOptions: SortOption[] = [
    { value: "email", label: "Email" },
    { value: "name", label: "Tên" },
  ];

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<AccountResponse>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Tên",
    },
    {
      key: "email",
      label: "Email",
    },
    {
      key: "roles",
      label: "Role",
    },
  ];

  const actions: Action<AccountResponse>[] = [
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

  if (loading && accounts.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && accounts.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={fetchAccounts}
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
        <h2 className="text-2xl font-bold">Quản lý tài khoản</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        >
          + Tạo tài khoản mới
        </button>
      </div>

      {/* Search, Sort, Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search - takes more space */}
        <div className="flex-1">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Tìm kiếm theo email hoặc tên..."
            debounceMs={500}
          />
        </div>

        {/* Role Filter */}
        <div className="flex-shrink-0">
          <select
            className="border px-3 py-2 rounded h-full"
            onChange={(e) => setRole(e.target.value || undefined)}
            value={role || ""}
          >
            <option value="">Tất cả role</option>
            <option value="USER">USER</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex-shrink-0">
          <SortControl
            options={sortOptions}
            onSortChange={handleSortChange}
            defaultSortBy="email"
            defaultSortDir="asc"
          />
        </div>
      </div>

      {loading && accounts.length > 0 && (
        <div className="mb-4 text-center text-sm text-gray-500">
          Đang tải...
        </div>
      )}

      {/* Table */}
      <DynamicList
        data={accounts}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy tài khoản nào"
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
              <h3 className="text-xl font-bold">Tạo tài khoản mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <AccountFormCreate onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedAccountId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cập nhật tài khoản</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedAccountId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <AccountFormUpdate
              id={selectedAccountId}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;