// src/pages/User/ProductListingPage.tsx
import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Input, Select, Slider, Button, Spin, Empty } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { ProductService } from '../../../Service/ProductService';
import { categoryService } from '../../../Service/categoryService';
import type { ProductListItem } from '../../../type/product/ProductListItem';
import type { CategoryOption } from '../../../type/categotry/CategoryOption';

const { Option } = Select;

const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // States
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // Filters from URL params
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
    searchParams.get('category') ? Number(searchParams.get('category')) : undefined
  );
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000000]);
  const [sortBy, setSortBy] = useState<string>(searchParams.get('sortBy') || 'createdAt');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>(
    (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc'
  );

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await categoryService.getCategorySelectOptions();
        setCategories(cats);
      } catch (err) {
        console.error('Không thể tải danh mục:', err);
      }
    };
    loadCategories();
  }, []);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await ProductService.getProductsForListing(
        currentPage,
        pageSize,
        searchQuery || undefined,
        selectedCategory,
        priceRange[0],
        priceRange[1],
        sortBy,
        sortDir
      );

      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  // Re-fetch when filters change
  useEffect(() => {
    fetchProducts();
    
    // Update URL params
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (selectedCategory) params.category = selectedCategory.toString();
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    setSearchParams(params);
  }, [currentPage, searchQuery, selectedCategory, priceRange, sortBy, sortDir]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, selectedCategory, priceRange, sortBy, sortDir]);

  // Handlers
  const handleSearch = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (value: number | undefined) => {
    setSelectedCategory(value);
  };

  const handlePriceChange = (value: [number, number]) => {
    setPriceRange(value);
  };

  const handleSortChange = (value: string) => {
    const [field, direction] = value.split('-');
    setSortBy(field);
    setSortDir(direction as 'asc' | 'desc');
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    setPriceRange([0, 10000000]);
    setSortBy('createdAt');
    setSortDir('desc');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-6">
          {/* Sidebar - Filters */}
          <aside className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Bộ lọc</h3>
                <Button type="link" size="small" onClick={handleResetFilters}>
                  Xóa bộ lọc
                </Button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Tìm kiếm</label>
                <Input
                  placeholder="Tìm sản phẩm..."
                  prefix={<SearchOutlined />}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  allowClear
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Danh mục</label>
                <Select
                  className="w-full"
                  placeholder="Chọn danh mục"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  allowClear
                >
                  {categories.map((cat) => (
                    <Option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </Option>
                  ))}
                </Select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Khoảng giá</label>
                <Slider
                  range
                  min={0}
                  max={10000000}
                  step={100000}
                  value={priceRange}
                  onChange={handlePriceChange}
                  tooltip={{
                    formatter: (value) => `${value?.toLocaleString('vi-VN')}₫`,
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>{priceRange[0].toLocaleString('vi-VN')}₫</span>
                  <span>{priceRange[1].toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Header with Sort */}
            <div className="bg-white rounded-lg shadow p-4 mb-6 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold">Sản phẩm</h1>
                {!loading && (
                  <p className="text-sm text-gray-500 mt-1">
                    Tìm thấy {products.length} sản phẩm
                  </p>
                )}
              </div>

              <Select
                className="w-48"
                value={`${sortBy}-${sortDir}`}
                onChange={handleSortChange}
              >
                {/* <Option value="createdAt-desc">Mới nhất</Option>
                <Option value="createdAt-asc">Cũ nhất</Option> */}
                <Option value="price-asc">Giá thấp đến cao</Option>
                <Option value="price-desc">Giá cao đến thấp</Option>
                <Option value="name-asc">Tên A-Z</Option>
                <Option value="name-desc">Tên Z-A</Option>
              </Select>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-20">
                <Spin size="large" tip="Đang tải sản phẩm..." />
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                <p className="font-bold">Lỗi</p>
                <p>{error}</p>
                <Button type="primary" danger onClick={fetchProducts} className="mt-2">
                  Thử lại
                </Button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <Empty
                description="Không tìm thấy sản phẩm nào"
                className="py-20"
              />
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <Button
                      onClick={() => setCurrentPage((prev) => Math.max(0, prev - 1))}
                      disabled={currentPage === 0}
                    >
                      Trang trước
                    </Button>
                    <span className="px-4 py-2 flex items-center">
                      Trang {currentPage + 1} / {totalPages}
                    </span>
                    <Button
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1))
                      }
                      disabled={currentPage >= totalPages - 1}
                    >
                      Trang sau
                    </Button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

// Product Card Component
interface ProductCardProps {
  product: ProductListItem;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      to={`/products/${product.id}`}
      className="bg-white rounded-lg shadow hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={`http://localhost:8080${product.img}`}
          alt={product.name}
          className={`w-full h-full object-cover transition-transform duration-300 ${
            isHovered ? 'scale-110' : 'scale-100'
          }`}
          onError={(e) => {
            e.currentTarget.src = 'https://via.placeholder.com/300?text=No+Image';
          }}
        />
        {/* Category Badge */}
        <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-medium">
          {product.categoryName}
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>
        <p className="text-lg font-bold text-red-600">
          {product.price.toLocaleString('vi-VN')}₫
        </p>
        {product.description && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">
            {product.description}
          </p>
        )}
      </div>
    </Link>
  );
};

export default ProductListingPage;