import { useState, useEffect } from 'react';
import DynamicList from '../../../Components/Admin/List/DynamicList';
import type { Column, Action } from '../../../Components/Admin/List/DynamicList';
import { categoryService } from '../../../Service/categoryService';
import type { CategoryResponse } from '../../../type/categotry/CategoryResponse';
import CategoryFormCreate from './CategoryFormCreate';
import CategoryFormUpdate from './CategoryFormUpdate';

// Import generic components
import { SearchBox } from '../../../Components/Admin/Search/SearchBox';
import { SortControl } from '../../../Components/Admin/SortControl/SortControl';
import type { SortOption } from '../../../Components/Admin/SortControl/SortControl';
import type { SortParams } from '../../../Components/Admin/SortControl/SortControl';

import { FilterControl } from '../../../Components/Admin/FilterControl/FilterControl';
import type { FilterField } from '../../../Components/Admin/FilterControl/FilterControl';
import type { CategoryOption } from '../../../type/categotry/CategoryOption';

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize] = useState(10);

  // Search, Sort, Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('categoryId');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string | number | boolean>>({});

  // Category options for filter dropdown
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);

  // Load category options for filter
useEffect(() => {
  const loadCategoryOptions = async () => {
    try {
      const options = await categoryService.getRootCategoryOptions();
      setCategoryOptions(options);
    } catch (err) {
      console.error('Không thể tải danh sách danh mục cha:', err);
    }
  };

  loadCategoryOptions();
}, []);
  // Fetch categories with all params
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryService.getCategoriesPaged(
        currentPage,
        pageSize,
        searchQuery || undefined,
        sortBy,
        sortDir,
        filters.parentId ? Number(filters.parentId) : undefined
      );
      
      setCategories(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when params change
  useEffect(() => {
    fetchCategories();
  }, [currentPage, searchQuery, sortBy, sortDir, filters]);

  // Reset to page 0 when search/sort/filter changes
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, sortBy, sortDir, filters]);

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

  const handleFilterChange = (newFilters: Record<string, string | number | boolean>) => {
    setFilters(newFilters);
  };

  const handleFilterReset = () => {
    setFilters({});
  };

  const handleDelete = async (item: CategoryResponse) => {
    if (!confirm(`Bạn có chắc muốn xóa danh mục "${item.categoryName}"?`)) {
      return;
    }

    try {
      await categoryService.deleteCategory(item.categoryId);
      alert('Xóa danh mục thành công');
      fetchCategories();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Có lỗi xảy ra khi xóa');
    }
  };

  const handleEdit = (item: CategoryResponse) => {
    setSelectedCategoryId(item.categoryId);
    setShowUpdateModal(true);
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    fetchCategories();
  };

  const handleUpdateSuccess = () => {
    setShowUpdateModal(false);
    setSelectedCategoryId(null);
    fetchCategories();
  };

  // ============================================
  // CONFIG FOR GENERIC COMPONENTS
  // ============================================

  const sortOptions: SortOption[] = [
    { value: 'categoryId', label: 'Mã danh mục' },
    { value: 'categoryName', label: 'Tên danh mục' },
    // { value: 'parentCategoryId', label: 'Danh mục cha' }
  ];

const filterFields: FilterField[] = [
  {
    name: 'parentId',
    label: 'Danh mục cha',
    type: 'select',
    options: [
      {
        value: '',
        label: 'Tất cả'
      },
      ...categoryOptions.map(cat => ({
        value: cat.categoryId,
        label: cat.categoryName
      }))
    ]
  }
];


  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<CategoryResponse>[] = [
    { 
      key: 'categoryId', 
      label: 'ID' 
    },
    { 
      key: 'categoryName', 
      label: 'Tên danh mục' 
    },
    {
      key: 'parentCategoryName',
      label: 'Danh mục cha',
      render: (item) => (
        <span className={item.parentCategoryName ? 'text-gray-700' : 'text-gray-400 italic'}>
          {item.parentCategoryName || 'Không có'}
        </span>
      )
    }
  ];

  const actions: Action<CategoryResponse>[] = [
    {
      label: 'Sửa',
      onClick: handleEdit,
      variant: 'primary'
    },
    {
      label: 'Xóa',
      onClick: handleDelete,
      variant: 'danger'
    }
  ];

  // ============================================
  // RENDER
  // ============================================

  if (loading && categories.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error && categories.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p className="font-bold">Lỗi</p>
          <p>{error}</p>
          <button
            onClick={fetchCategories}
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

        {/* Filter */}
        <div className="flex-shrink-0">
          <FilterControl
            fields={filterFields}
            onFilterChange={handleFilterChange}
            onReset={handleFilterReset}
          />
        </div>
      </div>

      {/* Active Filters Display */}
      {Object.keys(filters).length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2 items-center">
          <span className="text-sm font-medium text-gray-700">Bộ lọc đang áp dụng:</span>
          {Object.entries(filters).map(([key, value]) => {
            const field = filterFields.find(f => f.name === key);
            const displayValue = field?.options?.find(opt => opt.value === value)?.label || value;
            
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
              >
                <span className="font-medium">{field?.label}:</span>
                <span>{displayValue}</span>
                <button
                  onClick={() => {
                    const newFilters = { ...filters };
                    delete newFilters[key];
                    setFilters(newFilters);
                  }}
                  className="ml-1 hover:text-blue-900"
                >
                  ✕
                </button>
              </span>
            );
          })}
          <button
            onClick={handleFilterReset}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            Xóa tất cả
          </button>
        </div>
      )}

      {/* Loading overlay for subsequent fetches */}
      {loading && categories.length > 0 && (
        <div className="mb-4 text-center text-sm text-gray-500">
          Đang tải...
        </div>
      )}

      {/* Table */}
      <DynamicList
        data={categories}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.categoryId}
        emptyMessage="Không tìm thấy danh mục nào"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
            disabled={currentPage === 0}
            className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
          >
            Trang trước
          </button>
          <span className="px-4 py-2">
            Trang {currentPage + 1} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
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
            <CategoryFormCreate onSuccess={handleCreateSuccess} />
          </div>
        </div>
      )}

      {/* Update Modal */}
      {showUpdateModal && selectedCategoryId !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Cập nhật danh mục</h3>
              <button
                onClick={() => {
                  setShowUpdateModal(false);
                  setSelectedCategoryId(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            <CategoryFormUpdate 
              id={selectedCategoryId} 
              onSuccess={handleUpdateSuccess} 
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;