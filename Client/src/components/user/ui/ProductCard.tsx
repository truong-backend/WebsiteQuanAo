// src/components/user/ui/ProductCard.tsx
// Chịu trách nhiệm: Card sản phẩm trong trang listing
//   - Lazy image load + skeleton + fallback
//   - Nút: Xem chi tiết | Thêm giỏ hàng | Mua ngay
//   - Wishlist toggle (local state)
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalCartService } from '@/modules';
import type { ProductListItem } from '@/types';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product:      ProductListItem;
  onAddToCart?: (product: ProductListItem) => void;
  isAdded?:     boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isAdded = false }) => {
  const navigate = useNavigate();
  const [imgOk, setImgOk]   = useState(false);
  const [imgErr, setImgErr] = useState(false);
  const [wished, setWished] = useState(false);

  const src = imgErr
    ? 'https://via.placeholder.com/300?text=No+Image'
    : product.img.startsWith('http') ? product.img : `http://localhost:8080${product.img}`;

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    LocalCartService.addItem({ id: product.id, name: product.name, price: product.price, img: product.img }, 1);
    navigate('/checkout');
  };

  return (
    <div className={styles.card}>
      <div className={styles.imgWrap} onClick={() => navigate(`/products/${product.id}`)}>
        {!imgOk && <div className={styles.skeleton} />}
        <img className={styles.img} src={src} alt={product.name}
          style={{ display: imgOk ? 'block' : 'none' }}
          onLoad={() => setImgOk(true)}
          onError={() => { setImgErr(true); setImgOk(true); }}
        />
        <span className={styles.catChip}>{product.categoryName}</span>
        <button className={styles.wishBtn} onClick={(e) => { e.stopPropagation(); setWished((w) => !w); }}>
          {wished ? '❤' : '🤍'}
        </button>
      </div>

      <div className={styles.body} onClick={() => navigate(`/products/${product.id}`)}>
        <p className={styles.name}>{product.name}</p>
        {product.description && <p className={styles.desc}>{product.description}</p>}
        <p className={styles.price}>{product.price.toLocaleString('vi-VN')}₫</p>
      </div>

      <div className={styles.actions}>
        <button className={styles.btnDetail} onClick={() => navigate(`/products/${product.id}`)}>Xem chi tiết</button>
        {onAddToCart && (
          <button className={`${styles.btnCart} ${isAdded ? styles['btnCart--added'] : ''}`}
            onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}>
            {isAdded ? '✓ Đã thêm' : '🛒 Thêm giỏ'}
          </button>
        )}
        <button className={styles.btnBuy} onClick={handleBuyNow}>⚡ Mua ngay</button>
      </div>
    </div>
  );
};

export default ProductCard;