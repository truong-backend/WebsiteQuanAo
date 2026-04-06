// src/features/products/components/ProductListingPage.tsx
// Moved from: src/pages/user/ProductListingPage.tsx
// Changed: all state/logic replaced by useProductListing() hook
import {
  ShoppingBagOutlined,
  FilterList as FilterListIcon,
} from "@mui/icons-material";
import { Pagination } from "@mui/material";
import { useProductListing } from "../hooks/useProductListing";
import ProductCard from "./ProductCard";
import PageLayout from "@/layouts/user/PageLayout";
import Sidebar from "@/components/user/ui/Sidebar";
import EmptyState from "@/components/user/ui/EmptyState";
import ErrorAlert from "@/components/user/ui/ErrorAlert";
import AddToCartToast from "@/components/user/ui/AddToCartToast";
import styles from "./ProductListingPage.module.scss";

const ProductListingPage: React.FC = () => {
  const {
    products,
    categories,
    loading,
    error,
    currentPage,
    setCurrentPage,
    totalPages,
    toastOpen,
    setToastOpen,
    toastProduct,
    addedIds,
    searchInput,
    setSearchInput,
    categoryId,
    setCategoryId,
    minPrice,
    setMinPrice,
    maxPrice,
    setMaxPrice,
    sortBy,
    setSortBy,
    sortDir,
    setSortDir,
    drawerOpen,
    setDrawerOpen,
    fetchProducts,
    handleReset,
    handleAddToCart,
    activeCategoryName,
  } = useProductListing();

  const sidebarProps = {
    searchInput,
    onSearchChange: setSearchInput,
    categoryId,
    onCategoryChange: setCategoryId,
    categories,
    minPrice,
    onMinPriceChange: setMinPrice,
    maxPrice,
    onMaxPriceChange: setMaxPrice,
    onReset: handleReset,
  };

  return (
    <PageLayout>
      {/* Overlay */}
      <div
        className={`${styles.overlay} ${drawerOpen ? styles.overlayOpen : ""}`}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Filter drawer (mobile) */}
      <div
        className={`${styles.drawer} ${drawerOpen ? styles.drawerOpen : ""}`}
      >
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Bộ lọc</span>
          <button
            className={styles.drawerClose}
            onClick={() => setDrawerOpen(false)}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className={styles.drawerBody}>
          <Sidebar {...sidebarProps} />
        </div>
      </div>

      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.layout}>
            {/* Sidebar desktop */}
            <aside className={styles.sidebar}>
              <Sidebar {...sidebarProps} />
            </aside>

            {/* Main content */}
            <div className={styles.main}>
              {/* Toolbar */}
              <div className={styles.toolbar}>
                <div className={styles.toolLeft}>
                  <h1 className={styles.toolTitle}>
                    {activeCategoryName ?? "Sản phẩm"}
                  </h1>
                  {!loading && (
                    <p className={styles.toolCount}>
                      Tìm thấy {products.length} sản phẩm
                      {activeCategoryName
                        ? ` trong "${activeCategoryName}"`
                        : ""}
                    </p>
                  )}
                </div>
                <div className={styles.toolRight}>
                  <button
                    className={styles.filterBtn}
                    onClick={() => setDrawerOpen(true)}
                  >
                    <FilterListIcon fontSize="small" /> Bộ lọc
                  </button>
                  <div className={styles.sortGroup}>
                    <button
                      className={`${styles.sortBtn} ${sortBy === "price" ? styles["sortBtn--active"] : ""}`}
                      onClick={() => setSortBy("price")}
                    >
                      Giá
                    </button>
                    <button
                      className={`${styles.sortBtn} ${sortBy === "name" ? styles["sortBtn--active"] : ""}`}
                      onClick={() => setSortBy("name")}
                    >
                      Tên
                    </button>
                  </div>
                  <button
                    className={styles.dirBtn}
                    onClick={() =>
                      setSortDir((p) => (p === "asc" ? "desc" : "asc"))
                    }
                  >
                    {sortDir === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>

              {/* States */}
              {loading && (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>Đang tải sản phẩm...</span>
                </div>
              )}
              {error && !loading && (
                <ErrorAlert message={error} onRetry={fetchProducts} />
              )}
              {!loading && !error && products.length === 0 && (
                <EmptyState
                  icon={<ShoppingBagOutlined sx={{ fontSize: 56 }} />}
                  title="Không tìm thấy sản phẩm"
                  description="Thử thay đổi bộ lọc hoặc tìm kiếm khác"
                />
              )}

              {/* Grid */}
              {!loading && !error && products.length > 0 && (
                <>
                  <div className={styles.grid}>
                    {products.map((p) => (
                      <ProductCard
                        key={p.id}
                        product={p}
                        onAddToCart={handleAddToCart}
                        isAdded={addedIds.has(p.id)}
                      />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages}
                      page={currentPage + 1}
                      color="primary"
                      size="large"
                      showFirstButton
                      showLastButton
                      onChange={(_, page) => {
                        setCurrentPage(page - 1);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        mt: 4,
                        "& .MuiPaginationItem-root": {
                          borderRadius: "10px",
                          fontWeight: 600,
                        },
                        "& .Mui-selected": {
                          backgroundColor: "#22c55e !important",
                        },
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddToCartToast
        open={toastOpen}
        productName={toastProduct?.name ?? null}
        onClose={() => setToastOpen(false)}
      />
    </PageLayout>
  );
};

export default ProductListingPage;
