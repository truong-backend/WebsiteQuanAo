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
import type { AccountResponse } from "../../../type/account/AccountResponse";
import { Tag } from "antd";

const AccountPage: React.FC = () => {
  const [accounts, setAccounts] = useState<AccountResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(
    null
  );

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all accounts - filtering, sorting will be done by DynamicList
      const response = await AccountService.getAccountsPaged(
        0,
        1000, // Get all accounts for client-side filtering
        undefined,
        undefined,
        "email",
        "asc"
      );

      setAccounts(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

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

  const handleSearch = (searchText: string) => {
    console.log("Searching for:", searchText);
  };

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<AccountResponse>[] = [
    {
      key: "name",
      label: "Tên",
      sortable: true,
      searchable: true,
      width: 200,
    },
    {
      key: "email",
      label: "Email",
      sortable: true,
      searchable: true,
      width: 250,
    },
    {
      key: "roles",
      label: "Role",
      filterable: true,
      filterOptions: [
        { text: "USER", value: "USER" },
        { text: "ADMIN", value: "ADMIN" },
      ],
      width: 150,
      render: (item) => {
        const roleColors: Record<string, string> = {
          ADMIN: "red",
          USER: "blue",
          MODERATOR: "green",
        };
        return (
          <Tag color={roleColors[item.roles] || "default"}>
            {item.roles}
          </Tag>
        );
      },
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

      {/* Table with built-in search, sort, filter */}
      <DynamicList
        data={accounts}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy tài khoản nào"
        loading={loading}
        showGlobalSearch={true}
        searchPlaceholder="Tìm kiếm theo email hoặc tên..."
        onSearch={handleSearch}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} tài khoản`,
        }}
      />

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