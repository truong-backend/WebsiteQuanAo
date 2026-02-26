import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Grid from "@mui/material/Grid";
import {
  Box,
  Container,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Breadcrumbs,
} from "@mui/material";
import { ProductService } from "../../Service/ProductService";
import { CartService } from "../../Service/CartService";
import type { ProductResponse } from "../../type/product/ProductResponse";

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    ProductService.getById(id)
      .then(setProduct)
      .catch((err) => setError(err instanceof Error ? err.message : "Không thể tải chi tiết sản phẩm"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    CartService.addItem(
      { id: product.id, name: product.name, price: product.price, img: product.img },
      1,
    );
    navigate("/cart");
  };

  if (loading) return <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}><CircularProgress /></Box>;

  if (error || !product) return (
    <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center" }}>
      <Container maxWidth="md"><Alert severity="error">{error || "Không tìm thấy sản phẩm"}</Alert></Container>
    </Box>
  );

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "grey.50", py: 4 }}>
      <Container maxWidth="lg">
        <Breadcrumbs sx={{ mb: 2 }}>
          <Link to="/products">Sản phẩm</Link>
          <Typography color="text.primary">{product.name}</Typography>
        </Breadcrumbs>
        <Paper sx={{ p: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={5}>
              <Box component="img" src={`http://localhost:8080${product.img}`} alt={product.name} sx={{ width: "100%", borderRadius: 2, objectFit: "cover" }} />
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h4" fontWeight="bold" gutterBottom>{product.name}</Typography>
              <Typography variant="h5" color="error.main" fontWeight="bold" gutterBottom>
                {product.price.toLocaleString("vi-VN")}₫
              </Typography>
              {product.description && (
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3, whiteSpace: "pre-line" }}>
                  {product.description}
                </Typography>
              )}
              <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                <Button variant="contained" onClick={handleAddToCart}>Thêm vào giỏ hàng</Button>
                <Button variant="outlined" onClick={() => navigate("/cart")}>Xem giỏ hàng</Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      </Container>
    </Box>
  );
};

export default ProductDetailPage;