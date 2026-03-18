// src/pages/Product/ProductCard.tsx
import { Link, useNavigate } from "react-router-dom";
import { CartService } from "../../../Service/CartService";
import type { ProductListItem } from "../../../type/product/ProductListItem";
import styles from "./ProductCard.module.scss";

interface ProductCardProps {
  product: ProductListItem;
  onAddToCart?: (product: ProductListItem) => void;
  isAdded?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isAdded = false }) => {
  const navigate = useNavigate();

  const handleBuyNow = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    CartService.addItem({ id: product.id, name: product.name, price: product.price, img: product.img }, 1);
    navigate("/checkout");
  };

  return (
    <div className={styles.card}>
      <Link className={styles.imgWrap} to={`/products/${product.id}`}>
        <img
          className={styles.img}
          src={`http://localhost:8080${product.img}`}
          alt={product.name}
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://via.placeholder.com/300?text=No+Image"; }}
        />
        <span className={styles.catChip}>{product.categoryName}</span>
      </Link>

      <Link className={styles.body} to={`/products/${product.id}`}>
        <p className={styles.name}>{product.name}</p>
        <p className={styles.price}>{product.price.toLocaleString("vi-VN")}₫</p>
        {product.description && <p className={styles.desc}>{product.description}</p>}
      </Link>

      {onAddToCart && (
        <div className={styles.actions}>
          <button
            className={`${styles.btnCart} ${isAdded ? styles["btnCart--added"] : ""}`}
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onAddToCart(product); }}
          >
            {isAdded ? "✓ Đã thêm!" : "🛒 Thêm vào giỏ"}
          </button>
          <button className={styles.btnBuy} onClick={handleBuyNow}>
            ⚡ Mua ngay
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;