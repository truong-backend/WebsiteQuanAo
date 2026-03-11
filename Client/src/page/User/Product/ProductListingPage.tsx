// src/pages/Product/ProductListPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  Button,
  Pagination,
  Alert,
  Paper,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
  CircularProgress,
} from "@mui/material";
import {
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { ProductService } from "../../../Service/ProductService";
import { categoryService } from "../../../Service/categoryService";
import type { ProductListItem } from "../../../type/product/ProductListItem";
import type { SelectOption } from "../../../type/common/select/SelectOption";
import ProductCard from "../ProductCard";
import Header from "../../../Components/User/Header/Header";
import Sidebar from "../../../Components/User/Sidebar/Sidebar";
import Footer from "../../../Components/User/Footer/Footer";

const ProductListPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("category")
      ? Number(searchParams.get("category"))
      : undefined,
  );
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10_000_000);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "price");
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    (searchParams.get("sortDir") as "asc" | "desc") || "desc",
  );

  // Sync URL params → state
  useEffect(() => {
    setSearchInput(searchParams.get("search") || "");
    setSearchQuery(searchParams.get("search") || "");
    setCategoryId(
      searchParams.get("category")
        ? Number(searchParams.get("category"))
        : undefined,
    );
    setCurrentPage(0);
  }, [searchParams.get("search"), searchParams.get("category")]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(t);
  }, [searchInput]);

  useEffect(() => {
    categoryService
      .getCategorySelectOptions()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ProductService.getProductsForListing(
        currentPage,
        pageSize,
        searchQuery || undefined,
        categoryId,
        minPrice,
        maxPrice,
        sortBy,
        sortDir,
      );
      setProducts(res.content);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    const params: Record<string, string> = {};
    if (searchQuery) params.search = searchQuery;
    if (categoryId) params.category = String(categoryId);
    params.sortBy = sortBy;
    params.sortDir = sortDir;
    setSearchParams(params, { replace: true });
  }, [
    currentPage,
    searchQuery,
    categoryId,
    minPrice,
    maxPrice,
    sortBy,
    sortDir,
  ]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  const handleReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setCategoryId(undefined);
    setMinPrice(0);
    setMaxPrice(10_000_000);
  };

  const activeCategoryName = categoryId
    ? categories.find((c) => c.value === categoryId)?.label
    : undefined;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
        bgcolor: "grey.50",
      }}
    >
      <Header />

      <Box component="main" sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="xl">
          <Grid container spacing={3}>
            {/* Sidebar */}
            <Grid size={{ xs: 12, md: 3 }}>
              <Sidebar
                searchInput={searchInput}
                onSearchChange={setSearchInput}
                categoryId={categoryId}
                onCategoryChange={setCategoryId}
                categories={categories}
                minPrice={minPrice}
                maxPrice={maxPrice}
                onMinPriceChange={setMinPrice}
                onMaxPriceChange={setMaxPrice}
                onReset={handleReset}
              />
            </Grid>

            {/* Main content */}
            <Grid size={{ xs: 12, md: 9 }}>
              <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    flexWrap: "wrap",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="h4" fontWeight="bold">
                      {activeCategoryName ?? "Sản phẩm"}
                    </Typography>
                    {!loading && (
                      <Typography variant="body2" color="text.secondary">
                        Tìm thấy {products.length} sản phẩm
                        {activeCategoryName
                          ? ` trong "${activeCategoryName}"`
                          : ""}
                      </Typography>
                    )}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                    <ToggleButtonGroup
                      value={sortBy}
                      exclusive
                      onChange={(_, v) => v && setSortBy(v)}
                      size="small"
                      color="primary"
                    >
                      <ToggleButton value="price">Giá</ToggleButton>
                      <ToggleButton value="name">Tên</ToggleButton>
                    </ToggleButtonGroup>
                    <IconButton
                      onClick={() =>
                        setSortDir((p) => (p === "asc" ? "desc" : "asc"))
                      }
                      size="small"
                      color="primary"
                      sx={{ border: 1, borderColor: "primary.main" }}
                    >
                      {sortDir === "asc" ? (
                        <ArrowUpwardIcon />
                      ) : (
                        <ArrowDownwardIcon />
                      )}
                    </IconButton>
                  </Box>
                </Box>
              </Paper>

              {loading && (
                <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                  <CircularProgress size={48} />
                  <Typography sx={{ ml: 2 }} color="text.secondary">
                    Đang tải sản phẩm...
                  </Typography>
                </Box>
              )}

              {error && !loading && (
                <Alert
                  severity="error"
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={fetchProducts}
                    >
                      Thử lại
                    </Button>
                  }
                >
                  {error}
                </Alert>
              )}

              {!loading && !error && products.length === 0 && (
                <Paper sx={{ py: 10, textAlign: "center" }}>
                  <Typography variant="h6" gutterBottom>
                    Không tìm thấy sản phẩm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thử thay đổi bộ lọc hoặc tìm kiếm khác
                  </Typography>
                </Paper>
              )}

              {!loading && !error && products.length > 0 && (
                <>
                  <Grid container spacing={3}>
                    {products.map((p) => (
                      <Grid size={{ xs: 12, sm: 6, lg: 4, xl: 3 }} key={p.id}>
                        <ProductCard product={p} />
                      </Grid>
                    ))}
                  </Grid>
                  {totalPages > 1 && (
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                    >
                      <Pagination
                        count={totalPages}
                        page={currentPage + 1}
                        onChange={(_, page) => {
                          setCurrentPage(page - 1);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        color="primary"
                        size="large"
                        showFirstButton
                        showLastButton
                      />
                    </Box>
                  )}
                </>
              )}
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
};

export default ProductListPage;
