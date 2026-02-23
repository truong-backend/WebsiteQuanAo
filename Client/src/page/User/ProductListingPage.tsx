// src/pages/User/ProductListingPage.tsx
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
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
  Chip,
  Paper,
  InputAdornment,
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from "@mui/icons-material";
import { ProductService } from "../../Service/ProductService";
import { categoryService } from "../../Service/categoryService";
import type { ProductListItem } from "../../type/product/ProductListItem";
import type { SelectOption } from "../../type/common/select/SelectOption";

const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // States
  const [products, setProducts] = useState<ProductListItem[]>([]);
  const [categories, setCategories] = useState<SelectOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const pageSize = 12;

  // Filters from URL params
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || "",
  );
  const [searchInput, setSearchInput] = useState(
    searchParams.get("search") || "",
  );
  const [filters, setFilters] = useState<
    Record<string, string | number | boolean>
  >({
    categoryId: searchParams.get("category")
      ? Number(searchParams.get("category"))
      : undefined,
    minPrice: 0,
    maxPrice: 10000000,
  });
  const [sortBy, setSortBy] = useState<string>(
    searchParams.get("sortBy") || "createdAt",
  );
  const [sortDir, setSortDir] = useState<"asc" | "desc">(
    (searchParams.get("sortDir") as "asc" | "desc") || "desc",
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // Load categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const selectOptions = await categoryService.getCategorySelectOptions();
        setCategories(selectOptions); // ✅ Dùng trực tiếp, không cần map
      } catch (err) {
        console.error("Không thể tải danh mục:", err);
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
        filters.categoryId as number | undefined,
        filters.minPrice as number,
        filters.maxPrice as number,
        sortBy,
        sortDir,
      );

      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra");
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
    if (filters.categoryId) params.category = String(filters.categoryId);
    if (sortBy) params.sortBy = sortBy;
    if (sortDir) params.sortDir = sortDir;
    setSearchParams(params);
  }, [currentPage, searchQuery, filters, sortBy, sortDir]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, filters, sortBy, sortDir]);

  // Handlers
  const handleFilterChange = (field: string, value: string | number) => {
    setFilters({
      ...filters,
      [field]: value === "" ? undefined : value,
    });
  };

  const handleFilterReset = () => {
    setSearchInput("");
    setSearchQuery("");
    setFilters({
      categoryId: undefined,
      minPrice: 0,
      maxPrice: 10000000,
    });
    setSortBy("createdAt");
    setSortDir("desc");
  };

  const handleSortByChange = (
    event: React.MouseEvent<HTMLElement>,
    newSortBy: string | null,
  ) => {
    if (newSortBy !== null) {
      setSortBy(newSortBy);
    }
  };

  const toggleSortDirection = () => {
    setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    page: number,
  ) => {
    setCurrentPage(page - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="xl">
        <Grid container spacing={3}>
          {/* Sidebar - Filters */}
          <Grid item xs={12} md={3}>
            <Paper
              elevation={2}
              sx={{
                p: 3,
                position: "sticky",
                top: 16,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 3,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <FilterListIcon color="primary" />
                  <Typography variant="h6" fontWeight="bold">
                    Bộ lọc
                  </Typography>
                </Box>
                <Button
                  onClick={handleFilterReset}
                  size="small"
                  sx={{ textTransform: "none" }}
                >
                  Xóa tất cả
                </Button>
              </Box>

              {/* Search */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Tìm sản phẩm..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchInput && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchInput("")}
                          edge="end"
                        >
                          <ClearIcon fontSize="small" />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Category Filter */}
              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Danh mục</InputLabel>
                <Select
                  value={filters.categoryId || ""}
                  // onChange={(e) =>
                  //   handleFilterChange("categoryId", e.target.value)
                  // }
                  label="Danh mục"
                >
                  <MenuItem value="">-- Tất cả --</MenuItem>
                  {categories.map((cat) => (
                    <MenuItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Min Price Filter */}
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Giá tối thiểu (₫)"
                value={filters.minPrice || ""}
                onChange={(e) =>
                  handleFilterChange("minPrice", Number(e.target.value))
                }
                sx={{ mb: 2 }}
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />

              {/* Max Price Filter */}
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Giá tối đa (₫)"
                value={filters.maxPrice || ""}
                onChange={(e) =>
                  handleFilterChange("maxPrice", Number(e.target.value))
                }
                InputProps={{
                  inputProps: { min: 0 },
                }}
              />
            </Paper>
          </Grid>

          {/* Main Content */}
          <Grid item xs={12} md={9}>
            {/* Header with Sort */}
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
                  <Typography variant="h4" fontWeight="bold" gutterBottom>
                    Sản phẩm
                  </Typography>
                  {!loading && (
                    <Typography variant="body2" color="text.secondary">
                      Tìm thấy {products.length} sản phẩm
                    </Typography>
                  )}
                </Box>

                {/* Sort Control */}
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <ToggleButtonGroup
                    value={sortBy}
                    exclusive
                    onChange={handleSortByChange}
                    size="small"
                    color="primary"
                  >
                    <ToggleButton value="createdAt">Mới nhất</ToggleButton>
                    <ToggleButton value="price">Giá</ToggleButton>
                    <ToggleButton value="name">Tên</ToggleButton>
                  </ToggleButtonGroup>

                  <IconButton
                    onClick={toggleSortDirection}
                    size="small"
                    color="primary"
                    sx={{
                      border: 1,
                      borderColor: "primary.main",
                    }}
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

            {/* Loading State */}
            {loading && (
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  py: 10,
                }}
              >
                <CircularProgress size={48} />
                <Typography sx={{ ml: 2 }} color="text.secondary">
                  Đang tải sản phẩm...
                </Typography>
              </Box>
            )}

            {/* Error State */}
            {error && !loading && (
              <Alert
                severity="error"
                action={
                  <Button color="inherit" size="small" onClick={fetchProducts}>
                    Thử lại
                  </Button>
                }
              >
                <Typography fontWeight="bold">Lỗi</Typography>
                <Typography>{error}</Typography>
              </Alert>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <Paper sx={{ py: 10, textAlign: "center" }}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Box
                    component="svg"
                    sx={{
                      width: 64,
                      height: 64,
                      color: "text.disabled",
                      mb: 2,
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                    />
                  </Box>
                  <Typography variant="h6" color="text.primary" gutterBottom>
                    Không tìm thấy sản phẩm
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Thử thay đổi bộ lọc hoặc tìm kiếm khác
                  </Typography>
                </Box>
              </Paper>
            )}

            {/* Product Grid */}
            {!loading && !error && products.length > 0 && (
              <>
                <Grid container spacing={3}>
                  {products.map((product) => (
                    <Grid item xs={12} sm={6} lg={4} xl={3} key={product.id}>
                      <ProductCard product={product} />
                    </Grid>
                  ))}
                </Grid>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Box
                    sx={{ display: "flex", justifyContent: "center", mt: 4 }}
                  >
                    <Pagination
                      count={totalPages}
                      page={currentPage + 1}
                      onChange={handlePageChange}
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
  );
};

// Product Card Component
interface ProductCardProps {
  product: ProductListItem;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card
      component={Link}
      to={`/products/${product.id}`}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        transition: "all 0.3s ease",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: 6,
        },
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      elevation={isHovered ? 8 : 2}
    >
      {/* Image */}
      <Box
        sx={{
          position: "relative",
          paddingTop: "100%",
          overflow: "hidden",
          bgcolor: "grey.100",
        }}
      >
        <CardMedia
          component="img"
          image={`http://localhost:8080${product.img}`}
          alt={product.name}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            transition: "transform 0.3s ease",
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
          onError={(e: any) => {
            e.target.src = "https://via.placeholder.com/300?text=No+Image";
          }}
        />
        {/* Category Badge */}
        <Chip
          label={product.categoryName}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            bgcolor: "white",
            fontWeight: 500,
          }}
        />
      </Box>

      {/* Info */}
      <CardContent
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column" }}
      >
        <Typography
          variant="h6"
          component="h3"
          sx={{
            fontWeight: 600,
            color: isHovered ? "primary.main" : "text.primary",
            transition: "color 0.3s ease",
            mb: 1,
            overflow: "hidden",
            textOverflow: "ellipsis",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
          }}
        >
          {product.name}
        </Typography>

        <Typography
          variant="h5"
          color="error.main"
          fontWeight="bold"
          sx={{ mb: 1 }}
        >
          {product.price.toLocaleString("vi-VN")}₫
        </Typography>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
            }}
          >
            {product.description}
          </Typography>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductListingPage;