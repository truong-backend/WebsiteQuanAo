// src/pages/Product/components/ProductCard.tsx
import { Link } from "react-router-dom";
import { Card, CardContent, CardMedia, Chip, Typography, Box } from "@mui/material";
import type { ProductListItem } from "../../type/product/ProductListItem";

const ProductCard: React.FC<{ product: ProductListItem }> = ({ product }) => (
  <Card
    component={Link}
    to={`/products/${product.id}`}
    sx={{
      height: "100%",
      display: "flex",
      flexDirection: "column",
      textDecoration: "none",
      "&:hover": { transform: "translateY(-4px)", boxShadow: 6 },
      transition: "all 0.3s ease",
    }}
  >
    <Box sx={{ position: "relative", paddingTop: "100%", overflow: "hidden", bgcolor: "grey.100" }}>
      <CardMedia
        component="img"
        image={`http://localhost:8080${product.img}`}
        alt={product.name}
        sx={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
        onError={(e: React.SyntheticEvent<HTMLImageElement>) => {
          e.currentTarget.src = "https://via.placeholder.com/300?text=No+Image";
        }}
      />
      <Chip
        label={product.categoryName}
        size="small"
        sx={{ position: "absolute", top: 8, left: 8, bgcolor: "white" }}
      />
    </Box>
    <CardContent sx={{ flexGrow: 1 }}>
      <Typography
        variant="h6"
        fontWeight={600}
        sx={{ mb: 1, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
      >
        {product.name}
      </Typography>
      <Typography variant="h5" color="error.main" fontWeight="bold" sx={{ mb: 1 }}>
        {product.price.toLocaleString("vi-VN")}₫
      </Typography>
      {product.description && (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}
        >
          {product.description}
        </Typography>
      )}
    </CardContent>
  </Card>
);

export default ProductCard;