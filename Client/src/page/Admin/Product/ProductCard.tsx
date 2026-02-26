import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardActionArea,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Chip,
  Box,
  IconButton,
  Skeleton,
  Tooltip,
} from "@mui/material";
import {
  ShoppingCart as ShoppingCartIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from "@mui/icons-material";
import type { ProductListItem } from "../../../type/product/ProductListItem";

interface ProductCardProps {
  product: ProductListItem;
}

const formatPrice = (price: number): string =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [wished, setWished] = useState(false);

  const imageUrl = imgError
    ? "https://via.placeholder.com/300x300?text=No+Image"
    : product.img.startsWith("http")
    ? product.img
    : `http://localhost:8080${product.img}`;

  return (
    <Card
      elevation={0}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "grey.200",
        borderRadius: 2,
        transition: "all 0.25s ease",
        "&:hover": {
          boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          transform: "translateY(-4px)",
          borderColor: "primary.light",
        },
      }}
    >
      {/* Image area */}
      <Box sx={{ position: "relative" }}>
        <CardActionArea onClick={() => navigate(`/products/${product.id}`)}>
          {!imgLoaded && (
            <Skeleton variant="rectangular" width="100%" height={220} animation="wave" />
          )}
          <CardMedia
            component="img"
            image={imageUrl}
            alt={product.name}
            onLoad={() => setImgLoaded(true)}
            onError={() => {
              setImgError(true);
              setImgLoaded(true);
            }}
            sx={{
              height: 220,
              objectFit: "cover",
              display: imgLoaded ? "block" : "none",
            }}
          />
        </CardActionArea>

        {/* Wishlist button */}
        <Tooltip title={wished ? "Bỏ yêu thích" : "Yêu thích"}>
          <IconButton
            size="small"
            onClick={() => setWished((w) => !w)}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
              bgcolor: "white",
              boxShadow: 1,
              "&:hover": { bgcolor: "white", transform: "scale(1.1)" },
            }}
          >
            {wished ? (
              <FavoriteIcon fontSize="small" color="error" />
            ) : (
              <FavoriteBorderIcon fontSize="small" />
            )}
          </IconButton>
        </Tooltip>

        {/* Category badge */}
        <Chip
          label={product.categoryName}
          size="small"
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            bgcolor: "primary.main",
            color: "white",
            fontWeight: 600,
            fontSize: "0.65rem",
          }}
        />
      </Box>

      {/* Content */}
      <CardContent
        sx={{ flexGrow: 1, pb: 1, cursor: "pointer" }}
        onClick={() => navigate(`/products/${product.id}`)}
      >
        <Typography
          variant="subtitle1"
          fontWeight={600}
          sx={{
            mb: 0.5,
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            lineHeight: 1.4,
            minHeight: "2.8em",
          }}
        >
          {product.name}
        </Typography>

        {product.description && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              mb: 1,
            }}
          >
            {product.description}
          </Typography>
        )}

        <Typography variant="h6" color="primary" fontWeight={700} sx={{ mt: "auto" }}>
          {formatPrice(product.price)}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
        <Box
          component="button"
          onClick={() => navigate(`/products/${product.id}`)}
          sx={{
            flexGrow: 1,
            py: 1,
            border: "2px solid",
            borderColor: "primary.main",
            borderRadius: 1,
            bgcolor: "transparent",
            color: "primary.main",
            fontWeight: 600,
            fontSize: "0.875rem",
            cursor: "pointer",
            transition: "all 0.2s",
            "&:hover": {
              bgcolor: "primary.main",
              color: "white",
            },
          }}
        >
          Xem chi tiết
        </Box>
        <Tooltip title="Thêm vào giỏ">
          <IconButton
            color="primary"
            sx={{
              ml: 1,
              border: "2px solid",
              borderColor: "primary.main",
              borderRadius: 1,
              "&:hover": { bgcolor: "primary.main", color: "white" },
            }}
          >
            <ShoppingCartIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );
};

export default ProductCard;