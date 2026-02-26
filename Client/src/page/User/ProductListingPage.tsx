import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Box,
  Container,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Pagination,
  CircularProgress,
  Alert,
  Paper,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  Grid,
} from "@mui/material";
import { Search as SearchIcon, Clear as ClearIcon, FilterList as FilterListIcon, ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from "@mui/icons-material";
import { ProductService } from "../../Service/ProductService";
import { categoryService } from "../../Service/categoryService";
import type { ProductListItem } from "../../type/product/ProductListItem";
import type { SelectOption } from "../../type/common/select/SelectOption";
import ProductCard from "./ProductCard";

const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [categoryId, setCategoryId] = useState<number | undefined>(
    searchParams.get("category") ? Number(searchParams.get("category")) : undefined
  );
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000000);
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy") || "createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">((searchParams.get("sortDir") as "asc" | "desc") || "desc");

  useEffect(() => {
    const timer = setTimeout(() => setSearchQuery(searchInput), 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  useEffect(() => {
    categoryService.getCategorySelectOptions()
      .then(setCategories)
      .catch(() => {});
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await ProductService.getProductsForListing(currentPage, pageSize, searchQuery || undefined, categoryId, minPrice, maxPrice, sortBy, sortDir);
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
    setSearchParams(params);
  }, [currentPage, searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  useEffect(() => { setCurrentPage(0); }, [searchQuery, categoryId, minPrice, maxPrice, sortBy, sortDir]);

  const handleReset = () => {
    setSearchInput(""); setSearchQuery(""); setCategoryId(undefined);
    setMinPrice(0); setMaxPrice(10000000); setSortBy("createdAt"); setSortDir("desc");
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Sidebar */}
          <Grid size={{ xs: 12, md: 3 }}>
            <Paper elevation={2} sx={{ p: 3, position: "sticky", top: 16 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterListIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">Bộ lọc</Typography>
                </Box>
                <Button size="small" onClick={handleReset} sx={{ textTransform: "none" }}>Xóa tất cả</Button>
              </Box>

              <TextField
                fullWidth size="small" placeholder="Tìm sản phẩm..." value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)} sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <InputAdornment position="start"><SearchIcon /></InputAdornment>,
                  endAdornment: searchInput && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchInput("")}><ClearIcon fontSize="small" /></IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={categoryId ?? ""}
                  onChange={(e) => {
                    const value = e.target.value as number | "";
                    setCategoryId(value === "" ? undefined : value);
                  }}
                  label="Danh mục"
                >
                  <MenuItem value="">-- Tất cả --</MenuItem>
                  {categories.map((c) => <MenuItem key={c.value} value={c.value}>{c.label}</MenuItem>)}
                </Select>
              </FormControl>

              <TextField fullWidth size="small" type="number" label="Giá tối thiểu (₫)" value={minPrice || ""}
                onChange={(e) => setMinPrice(Number(e.target.value))} sx={{ mb: 2 }} InputProps={{ inputProps: { min: 0 } }} />
              <TextField fullWidth size="small" type="number" label="Giá tối đa (₫)" value={maxPrice || ""}
                onChange={(e) => setMaxPrice(Number(e.target.value))} InputProps={{ inputProps: { min: 0 } }} />
            </Paper>
          </Grid>

          {/* Main */}
          <Grid size={{ xs: 12, md: 9 }}>
            <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Typography variant="h4" fontWeight="bold">Sản phẩm</Typography>
                  {!loading && <Typography variant="body2" color="text.secondary">Tìm thấy {products.length} sản phẩm</Typography>}
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <ToggleButtonGroup value={sortBy} exclusive onChange={(_, v) => v && setSortBy(v)} size="small" color="primary">
                    <ToggleButton value="createdAt">Mới nhất</ToggleButton>
                    <ToggleButton value="price">Giá</ToggleButton>
                    <ToggleButton value="name">Tên</ToggleButton>
                  </ToggleButtonGroup>
                  <IconButton onClick={() => setSortDir((p) => p === "asc" ? "desc" : "asc")} size="small" color="primary" sx={{ border: 1, borderColor: "primary.main" }}>
                    {sortDir === "asc" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
                  </IconButton>
                </Box>
              </Box>
            </Paper>

            {loading && (
              <Box sx={{ display: "flex", justifyContent: "center", py: 10 }}>
                <CircularProgress size={48} />
                <Typography sx={{ ml: 2 }} color="text.secondary">Đang tải sản phẩm...</Typography>
              </Box>
            )}

            {error && !loading && (
              <Alert severity="error" action={<Button color="inherit" size="small" onClick={fetchProducts}>Thử lại</Button>}>
                {error}
              </Alert>
            )}

            {!loading && !error && products.length === 0 && (
              <Paper sx={{ py: 10, textAlign: "center" }}>
                <Typography variant="h6" gutterBottom>Không tìm thấy sản phẩm</Typography>
                <Typography variant="body2" color="text.secondary">Thử thay đổi bộ lọc hoặc tìm kiếm khác</Typography>
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
                  <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
                    <Pagination count={totalPages} page={currentPage + 1}
                      onChange={(_, page) => { setCurrentPage(page - 1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      color="primary" size="large" showFirstButton showLastButton />
                  </Box>
                )}
              </>
            )}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
};

export default ProductListingPage;