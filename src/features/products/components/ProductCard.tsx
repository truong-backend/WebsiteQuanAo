// src/features/products/components/ProductCard.tsx
// Moved from: src/components/user/ui/ProductCard.tsx
// Changed imports: @/modules → @/features/cart | @/types → ../types/product.types
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LocalCartService } from '@/features/cart/services/localCartService';
import type { ProductListItem } from '../types/product.types';
import styles from './ProductCard.module.scss';

interface ProductCardProps {
  product:      ProductListItem;
  onAddToCart?: (product: ProductListItem) => void;
  isAdded?:     boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ product, onAddToCart, isAdded = false }) => {
  const navigate = useNavigate();
  const [imgOk,  setImgOk]  = useState(false);
  const [imgErr, setImgErr] = useState(false);

  const src = imgErr
    ? 'https://via.placeholder.com/300?text=No+Image'
    : product.img.startsWith('http')
      ? product.img
      : `http://localhost:8080${product.img}`;

  const goDetail = () => navigate(`/products/${product.id}`);

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    LocalCartService.addItem({ id: product.id, name: product.name, price: product.price, img: product.img }, 1);
    navigate('/checkout');
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart?.(product);
  };

  return (
    <div className={styles.card} onClick={goDetail}>
      <div className={styles.imgWrap}>
        {!imgOk && <div className={styles.skeleton} />}
        <img
          className={styles.img} src={src} alt={product.name}
          style={{ display: imgOk ? 'block' : 'none' }}
          onLoad={() => setImgOk(true)}
          onError={() => { setImgErr(true); setImgOk(true); }}
        />
        <div className={styles.actionBar}>
          {onAddToCart ? (
            <button
              className={`${styles.btnAddCart} ${isAdded ? styles['btnAddCart--added'] : ''}`}
              onClick={handleAddToCart} disabled={isAdded}
            >
              <span className="material-symbols-outlined">{isAdded ? 'check' : 'shopping_bag'}</span>
              {isAdded ? 'Đã thêm' : 'Thêm vào giỏ'}
            </button>
          ) : (
            <button className={styles.btnAddCart} onClick={handleBuyNow}>
              <span className="material-symbols-outlined">bolt</span>
              Mua ngay
            </button>
          )}
          <button className={styles.btnQuickView}
            onClick={(e) => { e.stopPropagation(); goDetail(); }} aria-label="Xem nhanh">
            <span className="material-symbols-outlined">visibility</span>
          </button>
        </div>
      </div>
      <div className={styles.body}>
        <p className={styles.name}>{product.name}</p>
        {product.description && <p className={styles.desc}>{product.description}</p>}
        <p className={styles.price}>{product.price.toLocaleString('vi-VN')}₫</p>
      </div>
    </div>
  );
};

export default ProductCard;
