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
import { SearchBox } from "../../../Components/Admin/Search/SearchBox";
import { SortControl } from "../../../Components/Admin/SortControl/SortControl";
import type { SortOption } from "../../../Components/Admin/SortControl/SortControl";
import type { SortParams } from "../../../Components/Admin/SortControl/SortControl";
import type { ProductResponse } from "../../../type/product/ProductResponse";

const ProductPage: React.FC = () => {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Search, Sort, Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [productTypeId, setProductTypeId] = useState<number | undefined>();
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductService.getProductsPaged(
        currentPage,
        pageSize,
        searchQuery || undefined,
        productTypeId,
        sortBy,
        sortDir
      );

      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when params change
  useEffect(() => {
    fetchProducts();
  }, [currentPage, searchQuery, productTypeId, sortBy, sortDir]);

  // Reset to page 0 when search/sort/filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, productTypeId, sortBy, sortDir]);

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

  // ============================================
  // CONFIG FOR GENERIC COMPONENTS
  // ============================================

  const sortOptions: SortOption[] = [
    { value: "name", label: "Tên" },
    { value: "price", label: "Giá" },
    { value: "id", label: "ID" },
  ];

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<ProductResponse>[] = [
    {
      key: "id",
      label: "ID",
    },
    {
      key: "name",
      label: "Tên sản phẩm",
    },
    {
      key: "price",
      label: "Giá",
      render: (item) => `${item.price.toLocaleString('vi-VN')} ₫`,
    },
    {
      key: "img",
      label: "Hình ảnh",
      render: (item) => (
        <img 
          src={item.img} 
          alt={item.name} 
          className="w-16 h-16 object-cover rounded"
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/64?text=No+Image';
          }}
        />
      ),
    },
    {
      key: "productTypeId",
      label: "Loại SP",
    },
    {
      key: "description",
      label: "Mô tả",
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

      {/* Search, Sort, Filter Bar */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1">
          <SearchBox
            onSearch={handleSearch}
            placeholder="Tìm kiếm theo tên sản phẩm..."
            debounceMs={500}
          />
        </div>

        {/* Product Type Filter */}
        <div className="flex-shrink-0">
          <input
            type="number"
            className="border px-3 py-2 rounded h-full w-full md:w-40"
            placeholder="Lọc theo loại SP"
            onChange={(e) => setProductTypeId(e.target.value ? Number(e.target.value) : undefined)}
            value={productTypeId || ""}
          />
        </div>

        {/* Sort */}
        <div className="flex-shrink-0">
          <SortControl
            options={sortOptions}
            onSortChange={handleSortChange}
            defaultSortBy="name"
            defaultSortDir="asc"
          />
        </div>
      </div>

      {loading && products.length > 0 && (
        <div className="mb-4 text-center text-sm text-gray-500">
          Đang tải...
        </div>
      )}

      {/* Table */}
      <DynamicList
        data={products}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.id}
        emptyMessage="Không tìm thấy sản phẩm nào"
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