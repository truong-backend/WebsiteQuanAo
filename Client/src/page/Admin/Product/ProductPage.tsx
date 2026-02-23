// src/pages/Admin/Product/ProductPage.tsx
import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { ProductService } from "../../../Service/ProductService";
import ProductFormCreate from "./ProductFormCreate";
import ProductFormUpdate from "./ProductFormUpdate";
import type { ProductResponse } from "../../../type/product/ProductResponse";

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductService.getProductsPaged(
        0,
        1000, // Get all for client-side filtering
        undefined,
        undefined,
        "name",
        "asc",
      );

      setProducts(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDelete = async (item: ProductResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa sản phẩm "${item.name}"?`)) {
      return;
    }

    try {
      await ProductService.deleteProduct(item.id);
      alert("Xóa sản phẩm thành công");
      fetchProducts();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: ProductResponse) => {
    setSelectedProductId(item.id);
    setShowUpdateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchProducts();
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedProductId(null);
    fetchProducts();
  };

  const handleSearch = (searchText: string) => {
    console.log('Searching for:', searchText);
  };

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<ProductResponse>[] = [
    {
      key: "name",
      label: "Tên sản phẩm",
      sortable: true,
      searchable: true,
      width: 250,
    },
    {
      key: "price",
      label: "Giá",
      sortable: true,
      width: 150,
      render: (item) => `${item.price.toLocaleString("vi-VN")} ₫`,
    },
    {
      key: "img",
      label: "Hình ảnh",
      width: 200,
      render: (item) => (
        <img
          src={`http://localhost:8080${item.img}`}
          alt={item.name}
          className="w-32 h-20 object-cover rounded-lg border shadow-sm"
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/128?text=No+Image";
          }}
        />
      ),
    },
    {
      key: "description",
      label: "Mô tả",
      searchable: true,
      render: (item) => (
        <span className="line-clamp-2" title={item.description}>
          {item.description}
        </span>
      ),
    },
  ];

  const actions: Action<ProductResponse>[] = [
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

  if (loading && products.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={fetchProducts}
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
        <h2 className="text-2xl font-bold">Quản lý sản phẩm</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        >
          + Tạo sản phẩm mới
        </button>
      </div>

      {/* Table with built-in search, sort, filter */}
      <DynamicList
        data={products}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy sản phẩm nào"
        loading={loading}
        showGlobalSearch={true}
        searchPlaceholder="Tìm kiếm theo tên hoặc mô tả sản phẩm..."
        onSearch={handleSearch}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} sản phẩm`,
        }}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tạo sản phẩm mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <ProductFormCreate onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedProductId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cập nhật sản phẩm</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedProductId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <ProductFormUpdate
              id={selectedProductId}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductPage;