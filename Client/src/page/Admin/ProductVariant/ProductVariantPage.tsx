import { useState, useEffect } from "react";
import DynamicList from "../../../Components/Admin/List/DynamicList";
import type {
  Column,
  Action,
} from "../../../Components/Admin/List/DynamicList";
import { ProductVariantService } from "../../../Service/ProductVariantService";
import ProductVariantFormCreate from "./ProductVariantFormCreate";
import ProductVariantFormUpdate from "./ProductVariantFormUpdate";
import type { ProductVariantResponse } from "../../../type/ProductVariant/ProductVariantResponse";

// Extend ProductVariantResponse so it satisfies DynamicList's Record<string, unknown> constraint
type ProductVariantRecord = ProductVariantResponse & Record<string, unknown>;

const ProductVariantPage: React.FC = () => {
  const [variants, setVariants] = useState<ProductVariantResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);

  const fetchVariants = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await ProductVariantService.getProductVariantsPaged(
        0,
        1000,
        undefined,
        "id",
        "asc",
      );
      setVariants(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVariants();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDelete = async (item: ProductVariantRecord) => {
    if (!confirm(`Bạn có chắc muốn xóa biến thể "${item.productName}"?`)) return;
    try {
      await ProductVariantService.deleteProductVariant(item.id);
      alert("Xóa biến thể thành công");
      fetchVariants();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Có lỗi xảy ra khi xóa");
    }
  };

  const handleEdit = (item: ProductVariantRecord) => {
    setSelectedVariantId(item.id);
    setShowUpdateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchVariants();
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedVariantId(null);
    fetchVariants();
  };

  const handleSearch = (searchText: string) => {
    console.log("Searching for:", searchText);
  };

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<ProductVariantRecord>[] = [
    {
      key: "productName",
      label: "Sản phẩm",
      sortable: true,
      searchable: true,
      width: 200,
    },
    {
      key: "colorName",
      label: "Tên màu",
      sortable: true,
      searchable: true,
      width: 150,
    },
    {
      key: "sizeId",
      label: "Kích cỡ ID",
      sortable: true,
      width: 120,
    },
    {
      key: "quantity",
      label: "Số lượng",
      sortable: true,
      width: 120,
    },
    {
      key: "img",
      label: "Hình ảnh",
      width: 200,
      render: (item) => (
        <img
          src={`http://localhost:8080${item.img as string}`}
          className="w-32 h-20 object-cover rounded-lg border shadow-sm"
          onError={(e) => {
            e.currentTarget.src = "https://via.placeholder.com/128?text=No+Image";
          }}
        />
      ),
    },
  ];

  const actions: Action<ProductVariantRecord>[] = [
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

  if (loading && variants.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && variants.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={fetchVariants}
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
        <h2 className="text-2xl font-bold">Quản lý biến thể sản phẩm</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-medium"
        >
          + Tạo biến thể mới
        </button>
      </div>

      {/* Table with built-in search, sort, filter */}
      <DynamicList
        data={variants as ProductVariantRecord[]}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id as string}
        emptyMessage="Không tìm thấy biến thể nào"
        loading={loading}
        showGlobalSearch={true}
        searchPlaceholder="Tìm kiếm theo tên sản phẩm, màu..."
        onSearch={handleSearch}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["5", "10", "20", "50"],
          showTotal: (total: number, range: [number, number]) =>
            `${range[0]}-${range[1]} của ${total} biến thể`,
        }}
      />

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Tạo biến thể mới</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <ProductVariantFormCreate onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedVariantId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cập nhật biến thể</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedVariantId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <ProductVariantFormUpdate
              id={selectedVariantId}
              onSuccess={handleUpdateSuccess}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductVariantPage;