import { useState, useEffect } from 'react';
import DynamicList from '../../../Components/Admin/List/DynamicList';
import type { Column, Action } from '../../../Components/Admin/List/DynamicList';
import { categoryService } from '../../../Service/categoryService';
import type { CategoryResponse } from '../../../type/categotry/CategoryResponse';
import CategoryFormCreate from './CategoryFormCreate';
import CategoryFormUpdate from './CategoryFormUpdate';
import type { CategoryOption } from '../../../type/categotry/CategoryOption';

type CategoryRecord = CategoryResponse & Record<string, unknown>;

const CategoryPage: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

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

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await categoryService.getCategoriesPaged(
        0,
        1000, // Get all for client-side filtering
        undefined,
        'categoryName',
        'asc',
        undefined
      );
      
      setCategories(response.content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // ============================================
  // HANDLERS
  // ============================================

  const handleDelete = async (item: CategoryRecord) => {
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

  const handleEdit = (item: CategoryRecord) => {
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

  const handleSearch = (searchText: string) => {
    console.log('Searching for:', searchText);
  };

  // ============================================
  // TABLE CONFIG
  // ============================================

  const columns: Column<CategoryRecord>[] = [
    { 
      key: 'categoryName', 
      label: 'Tên danh mục',
      sortable: true,
      searchable: true,
      width: 250,
    },
    {
      key: 'parentCategoryName',
      label: 'Danh mục cha',
      filterable: true,
      filterOptions: [
        { text: 'Không có', value: '' },
        ...categoryOptions.map(cat => ({
          text: cat.categoryName,
          value: cat.categoryName
        }))
      ],
      width: 200,
      render: (item) => (
        <span className={item.parentCategoryName ? 'text-gray-700' : 'text-gray-400 italic'}>
          {item.parentCategoryName || 'Không có'}
        </span>
      )
    }
  ];

  const actions: Action<CategoryRecord>[] = [
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

      {/* Table with built-in search, sort, filter */}
      <DynamicList
        data={categories as CategoryRecord[]}
        columns={columns}
        actions={actions}
        keyExtractor={(item) => item.categoryId as string | number}
        emptyMessage="Không tìm thấy danh mục nào"
        loading={loading}
        showGlobalSearch={true}
        searchPlaceholder="Tìm kiếm theo tên danh mục..."
        onSearch={handleSearch}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ['5', '10', '20', '50'],
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} của ${total} danh mục`,
        }}
      />

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