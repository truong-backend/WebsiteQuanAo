// src/pages/Product/ProductListPage.tsx
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ShoppingBagOutlined } from "@mui/icons-material";
import { Pagination } from "@mui/material";
import { ProductService } from "../../../Service/ProductService";
import { categoryService } from "../../../Service/categoryService";
import { CartService } from "../../../Service/CartService";
import type { ProductListItem } from "../../../type/product/ProductListItem";
import type { SelectOption } from "../../../type/common/select/SelectOption";
import ProductCard from "../Productcard/ProductCard";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";
import Sidebar from "../../../Components/User/Sidebar/Sidebar";
import EmptyState from "../../../Components/User/ui/EmptyState/EmptyState";
import ErrorAlert from "../../../Components/User/ui/ErrorAlert/ErrorAlert";
import AddToCartToast from "../../../Components/User/ui/AddToCartToast/AddToCartToast";
import styles from "./ProductListingPage.module.scss";

type SortDir = "asc" | "desc";
type SortBy  = "price" | "name";

const PAGE_SIZE         = 12;
const DEFAULT_MIN_PRICE = 0;
const DEFAULT_MAX_PRICE = 10_000_000;
const TOAST_DURATION_MS = 2500;

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts]   = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages]   = useState(0);
  const [toastOpen, setToastOpen]   = useState(false);
  const [toastProduct, setToastProduct] = useState<{ name: string; id: string } | null>(null);
  const [addedIds, setAddedIds]     = useState<Set<string>>(new Set());
  const [searchInput, setSearchInput] = useState(searchParams.get("search") ?? "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") ?? "");
  const [categoryId, setCategoryId]   = useState<number | undefined>(searchParams.get("category") ? Number(searchParams.get("category")) : undefined);
  const [minPrice, setMinPrice]   = useState(DEFAULT_MIN_PRICE);
  const [maxPrice, setMaxPrice]   = useState(DEFAULT_MAX_PRICE);
  const [sortBy, setSortBy]       = useState<SortBy>((searchParams.get("sortBy") as SortBy) ?? "price");
  const [sortDir, setSortDir]     = useState<SortDir>((searchParams.get("sortDir") as SortDir) ?? "desc");

  useEffect(() => {
    setSearchInput(searchParams.get("search") ?? ""); setSearchQuery(searchParams.get("search") ?? "");
    setCategoryId(searchParams.get("category") ? Number(searchParams.get("category")) : undefined);
    setCurrentPage(0);
  }, [searchParams.get("search"), searchParams.get("category")]);

  useEffect(() => { const t = setTimeout(() => setSearchQuery(searchInput), 500); return () => clearTimeout(t); }, [searchInput]);
  useEffect(() => { categoryService.getCategorySelectOptions().then(setCategories).catch(() => {}); }, []);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true); setError(null);
      const res = await ProductService.getProductsForListing(currentPage, PAGE_SIZE, searchQuery || undefined, categoryId, minPrice, maxPrice, sortBy, sortDir);
      setProducts(res.content); setTotalPages(res.totalPages);
    } catch (err) { setError(err instanceof Error ? err.message : "Có lỗi xảy ra"); }
    finally { setLoading(false); }
  }, [currentPage, searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  useEffect(() => {
    fetchProducts();
    const p: Record<string, string> = { sortBy, sortDir };
    if (searchQuery) p.search = searchQuery;
    if (categoryId)  p.category = String(categoryId);
    setSearchParams(p, { replace: true });
  }, [currentPage, searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  useEffect(() => { setCurrentPage(0); }, [searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  const handleReset = () => { setSearchInput(""); setSearchQuery(""); setCategoryId(undefined); setMinPrice(DEFAULT_MIN_PRICE); setMaxPrice(DEFAULT_MAX_PRICE); };

  const handleAddToCart = (product: ProductListItem) => {
    CartService.addItem({ id: product.id, name: product.name, price: product.price, img: product.img }, 1);
    setAddedIds((prev) => new Set(prev).add(product.id));
    setTimeout(() => setAddedIds((prev) => { const n = new Set(prev); n.delete(product.id); return n; }), TOAST_DURATION_MS);
    setToastProduct({ name: product.name, id: product.id }); setToastOpen(true);
  };

  const activeCategoryName = categoryId ? categories.find((c) => c.value === categoryId)?.label : undefined;

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.layout}>

            {/* Sidebar */}
            <div>
              <Sidebar searchInput={searchInput} onSearchChange={setSearchInput} categoryId={categoryId} onCategoryChange={setCategoryId} categories={categories} minPrice={minPrice} maxPrice={maxPrice} onMinPriceChange={setMinPrice} onMaxPriceChange={setMaxPrice} onReset={handleReset} />
            </div>

            {/* Main */}
            <div>
              <div className={styles.toolbar}>
                <div className={styles.toolLeft}>
                  <h1 className={styles.toolTitle}>{activeCategoryName ?? "Sản phẩm"}</h1>
                  {!loading && <p className={styles.toolCount}>Tìm thấy {products.length} sản phẩm{activeCategoryName ? ` trong "${activeCategoryName}"` : ""}</p>}
                </div>
                <div className={styles.toolRight}>
                  <div className={styles.sortGroup}>
                    <button className={`${styles.sortBtn} ${sortBy === "price" ? styles["sortBtn--active"] : ""}`} onClick={() => setSortBy("price")}>Giá</button>
                    <button className={`${styles.sortBtn} ${sortBy === "name"  ? styles["sortBtn--active"] : ""}`} onClick={() => setSortBy("name")}>Tên</button>
                  </div>
                  <button className={styles.dirBtn} onClick={() => setSortDir((p) => p === "asc" ? "desc" : "asc")}>
                    {sortDir === "asc" ? "↑" : "↓"}
                  </button>
                </div>
              </div>

              {loading && (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>Đang tải sản phẩm...</span>
                </div>
              )}
              {error && !loading && <ErrorAlert message={error} onRetry={fetchProducts} />}
              {!loading && !error && products.length === 0 && (
                <EmptyState icon={<ShoppingBagOutlined sx={{ fontSize: 56 }} />} title="Không tìm thấy sản phẩm" description="Thử thay đổi bộ lọc hoặc tìm kiếm khác" />
              )}
              {!loading && !error && products.length > 0 && (
                <>
                  <div className={styles.grid}>
                    {products.map((p) => (
                      <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} isAdded={addedIds.has(p.id)} />
                    ))}
                  </div>
                  {totalPages > 1 && (
                    <Pagination
                      count={totalPages} page={currentPage + 1}
                      onChange={(_, page) => { setCurrentPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      color="primary" size="large" showFirstButton showLastButton
                      sx={{ display: "flex", justifyContent: "center", mt: 4,
                        "& .MuiPaginationItem-root": { borderRadius: "10px", fontWeight: 600 },
                        "& .Mui-selected": { backgroundColor: "#22c55e !important" } }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <AddToCartToast open={toastOpen} productName={toastProduct?.name ?? null} onClose={() => setToastOpen(false)} />
    </PageLayout>
  );
};

export default ProductListPage;