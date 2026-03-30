// src/features/products/components/ProductDetailPage.tsx
// Moved from: src/pages/user/ProductDetailPage.tsx
// Changed imports:
//   @/modules → ../services/productService + @/features/cart/services/localCartService
//   @/types   → ../types/product.types

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProductService } from "../services/productService";
import { LocalCartService } from "@/features/cart/services/localCartService";
import type {
  ProductDetailResponse,
  ColorDto,
  SizeDto,
  VariantDto,
} from "../types/product.types";
import PageLayout from "@/layouts/user/PageLayout";
import Loading from "@/components/user/ui/Loading";
import ErrorAlert from "@/components/user/ui/ErrorAlert";
import styles from "./ProductDetailPage.module.scss";

const BASE_URL = "http://localhost:8080";

// ─── Flow tổng quan ──────────────────────────────────────────
// 1. Lấy `id` từ URL params
// 2. Gọi ProductService.getDetailById(id) → ProductDetailResponse
// 3. User chọn color → lọc variants theo colorCode → cập nhật danh sách size khả dụng
// 4. User chọn size → tìm variant khớp colorCode + sizeId → lấy ảnh + kiểm tra tồn kho
// 5. User bấm "Thêm vào giỏ" → LocalCartService.addItemFromVariant(...)
// 6. User bấm "Mua ngay" → thêm vào giỏ → navigate('/checkout')

const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── Server state ──────────────────────────────────────────
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ── Selection state ───────────────────────────────────────
  const [selectedColor, setSelectedColor] = useState<ColorDto | null>(null);
  const [selectedSize, setSelectedSize] = useState<SizeDto | null>(null);
  const [quantity, setQuantity] = useState(1);

  // ── UI state ──────────────────────────────────────────────
  const [activeImg, setActiveImg] = useState<string>("");
  const [addedToCart, setAddedToCart] = useState(false);

  // ── Step 1: Fetch product detail ─────────────────────────
  // Request:  GET /products/:id
  // Response: ProductDetailResponse { colors[], sizes[], variants[], ... }
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    ProductService.getDetailById(id)
      .then((data) => {
        setProduct(data);
        setActiveImg(data.img);
        // Tự động chọn color đầu tiên nếu có
        if (data.colors.length > 0) setSelectedColor(data.colors[0]);
      })
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Không thể tải sản phẩm"),
      )
      .finally(() => setLoading(false));
  }, [id]);

  // ── Step 2: Khi đổi color → reset size, cập nhật ảnh ─────
  // Input:  ColorDto { code: '#000000', name: 'Đen' }
  // Effect: lọc variants theo colorCode → lấy ảnh variant đầu tiên của color đó
  const handleColorChange = (color: ColorDto) => {
    setSelectedColor(color);
    setSelectedSize(null); // reset size vì color mới có thể không có size cũ

    // Tìm variant đầu tiên của color này để lấy ảnh preview
    const firstVariant = product?.variants.find(
      (v) => v.colorCode === color.code,
    );
    if (firstVariant?.img) setActiveImg(`${BASE_URL}${firstVariant.img}`);
    else setActiveImg(`${BASE_URL}${product?.img}`);
  };

  // ── Step 3: Lọc sizes khả dụng theo color đang chọn ──────
  // Input:  selectedColor.code = '#000000'
  // Output: SizeDto[] — chỉ các size mà color đó có variant tồn tại
  const availableSizes: SizeDto[] =
    product && selectedColor
      ? product.sizes.filter((size) =>
          product.variants.some(
            (v) =>
              v.colorCode === selectedColor.code &&
              v.sizeId === size.id &&
              v.quantity > 0,
          ),
        )
      : [];

  // ── Step 4: Tìm variant khớp color + size hiện tại ───────
  // Input:  selectedColor.code = '#000000', selectedSize.id = 'M'
  // Output: VariantDto | undefined
  const activeVariant: VariantDto | undefined =
    product && selectedColor && selectedSize
      ? product.variants.find(
          (v) =>
            v.colorCode === selectedColor.code && v.sizeId === selectedSize.id,
        )
      : undefined;

  // ── Step 5: Thêm vào giỏ ─────────────────────────────────
  // Validate: phải chọn color + size trước
  // Gọi:    LocalCartService.addItemFromVariant(CartItem)
  // Effect: toast "Đã thêm" trong 2 giây
  const handleAddToCart = () => {
    if (!product || !selectedColor || !selectedSize || !activeVariant) {
      alert("Vui lòng chọn màu sắc và kích cỡ");
      return;
    }

    LocalCartService.addItemFromVariant({
      id: activeVariant.id, // productVariantId
      name: product.name,
      price: product.salePrice ?? product.price,
      img: activeVariant.img,
      quantity,
      colorName: selectedColor.name,
      sizeName: selectedSize.name,
    });

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  // ── Step 6: Mua ngay ─────────────────────────────────────
  // Thêm vào giỏ rồi navigate thẳng sang /checkout
  const handleBuyNow = () => {
    if (!product || !selectedColor || !selectedSize || !activeVariant) {
      alert("Vui lòng chọn màu sắc và kích cỡ");
      return;
    }

    LocalCartService.addItemFromVariant({
      id: activeVariant.id,
      name: product.name,
      price: product.salePrice ?? product.price,
      img: activeVariant.img,
      quantity,
      colorName: selectedColor.name,
      sizeName: selectedSize.name,
    });

    navigate("/checkout");
  };

  // ── Render states ─────────────────────────────────────────
  if (loading)
    return (
      <PageLayout>
        <div className={styles.page}>
          <Loading />
        </div>
      </PageLayout>
    );
  if (error || !product)
    return (
      <PageLayout>
        <div className={styles.page}>
          <ErrorAlert
            message={error ?? "Không tìm thấy sản phẩm"}
            onRetry={() => navigate(-1)}
            retryLabel="Quay lại"
          />
        </div>
      </PageLayout>
    );

  const displayPrice = product.salePrice ?? product.price;
  const stockCount = activeVariant?.quantity ?? null;

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          <div className={styles.layout}>
            {/* ── Image column ── */}
            <div className={styles.imageCol}>
              {/* Main image */}
              <div className={styles.mainImg}>
                <img
                  src={activeImg || `${BASE_URL}${product.img}`}
                  alt={product.name}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/480?text=No+Image";
                  }}
                />
                {product.salePrice && (
                  <span className={styles.saleBadge}>
                    -{Math.round((1 - product.salePrice / product.price) * 100)}
                    %
                  </span>
                )}
              </div>

              {/* Thumbnail strip — các ảnh variants của color đang chọn */}
              {selectedColor && (
                <div className={styles.thumbRow}>
                  {product.variants
                    .filter((v) => v.colorCode === selectedColor.code && v.img)
                    .map((v) => (
                      <button
                        key={v.id}
                        className={[
                          styles.thumb,
                          activeImg === `${BASE_URL}${v.img}`
                            ? styles["thumb--active"]
                            : "",
                        ].join(" ")}
                        onClick={() => setActiveImg(`${BASE_URL}${v.img}`)}
                      >
                        <img src={`${BASE_URL}${v.img}`} alt="" />
                      </button>
                    ))}
                </div>
              )}
            </div>

            {/* ── Info column ── */}
            <div className={styles.infoCol}>
              <p className={styles.category}>{product.categoryName}</p>
              <h1 className={styles.name}>{product.name}</h1>

              {/* Rating */}
              {product.rating != null && (
                <div className={styles.rating}>
                  <span className={styles.stars}>
                    {"★".repeat(Math.round(product.rating))}
                    {"☆".repeat(5 - Math.round(product.rating))}
                  </span>
                  <span className={styles.ratingCount}>
                    ({product.ratingCount} đánh giá)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className={styles.priceRow}>
                <span className={styles.price}>
                  {displayPrice.toLocaleString("vi-VN")}₫
                </span>
                {product.salePrice && (
                  <span className={styles.originalPrice}>
                    {product.price.toLocaleString("vi-VN")}₫
                  </span>
                )}
              </div>

              <div className={styles.divider} />

              {/* Color selector */}
              <div className={styles.section}>
                <p className={styles.sectionLabel}>
                  Màu sắc: <strong>{selectedColor?.name ?? "Chưa chọn"}</strong>
                </p>
                <div className={styles.colorRow}>
                  {product.colors.map((color) => (
                    <button
                      key={color.code}
                      className={[
                        styles.colorSwatch,
                        selectedColor?.code === color.code
                          ? styles["colorSwatch--active"]
                          : "",
                      ].join(" ")}
                      style={{ backgroundColor: color.code }}
                      title={color.name}
                      onClick={() => handleColorChange(color)}
                    />
                  ))}
                </div>
              </div>

              {/* Size selector — chỉ hiện khi đã chọn color */}
              {selectedColor && (
                <div className={styles.section}>
                  <p className={styles.sectionLabel}>
                    Kích cỡ:{" "}
                    <strong>{selectedSize?.name ?? "Chưa chọn"}</strong>
                  </p>
                  <div className={styles.sizeRow}>
                    {product.sizes.map((size) => {
                      const isAvailable = availableSizes.some(
                        (s) => s.id === size.id,
                      );
                      return (
                        <button
                          key={size.id}
                          className={[
                            styles.sizeBtn,
                            selectedSize?.id === size.id
                              ? styles["sizeBtn--active"]
                              : "",
                            !isAvailable ? styles["sizeBtn--disabled"] : "",
                          ].join(" ")}
                          disabled={!isAvailable}
                          onClick={() => isAvailable && setSelectedSize(size)}
                        >
                          {size.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock indicator */}
              {activeVariant && (
                <p className={styles.stock}>
                  {stockCount && stockCount > 0 ? (
                    <span className={styles["stock--ok"]}>
                      Còn {stockCount} sản phẩm
                    </span>
                  ) : (
                    <span className={styles["stock--out"]}>Hết hàng</span>
                  )}
                </p>
              )}

              {/* Quantity */}
              <div className={styles.section}>
                <p className={styles.sectionLabel}>Số lượng</p>
                <div className={styles.qtyRow}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  >
                    −
                  </button>
                  <span className={styles.qtyNum}>{quantity}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() =>
                      setQuantity((q) => Math.min(stockCount ?? 99, q + 1))
                    }
                  >
                    +
                  </button>
                </div>
              </div>

              {/* CTA buttons */}
              <div className={styles.ctaRow}>
                <button
                  className={[
                    styles.btnCart,
                    addedToCart ? styles["btnCart--added"] : "",
                  ].join(" ")}
                  onClick={handleAddToCart}
                  disabled={!activeVariant || stockCount === 0}
                >
                  {addedToCart ? "✓ Đã thêm vào giỏ" : "Thêm vào giỏ hàng"}
                </button>
                <button
                  className={styles.btnBuy}
                  onClick={handleBuyNow}
                  disabled={!activeVariant || stockCount === 0}
                >
                  Mua ngay
                </button>
              </div>

              <div className={styles.divider} />

              {/* Description */}
              <div className={styles.description}>
                <h3>Mô tả sản phẩm</h3>
                <p>{product.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductDetailPage;
