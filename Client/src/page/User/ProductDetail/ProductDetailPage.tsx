// src/pages/Product/ProductDetail/ProductDetailPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "./ProductDetailPage.module.scss";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";
import { ProductService } from "../../../Service/ProductService";
import { CartService } from "../../../Service/CartService";
import type {
  ProductDetailResponse,
  VariantDto,
} from "../../../type/product/ProductDetailResponse";

// ─── Star component ─────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number; size?: "sm" | "md" }> = ({
  rating,
  size = "md",
}) => (
  <div className={`${styles.stars} ${size === "sm" ? styles["stars--sm"] : ""}`}>
    {[1, 2, 3, 4, 5].map((s) => (
      <span
        key={s}
        className={s <= Math.round(rating) ? styles.starFilled : styles.starEmpty}
      >
        ★
      </span>
    ))}
  </div>
);

const fmt = (p: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(p);

// ─── Main component ──────────────────────────────────────────────────────────
const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ── API state ──────────────────────────────────────────────────
  const [product, setProduct] = useState<ProductDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // ── UI state ───────────────────────────────────────────────────
  const [activeImage, setActiveImage] = useState(0);
  const [selectedColorCode, setSelectedColorCode] = useState<string | null>(null);
  const [selectedSizeId, setSelectedSizeId] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "care">("desc");
  const [zoomed, setZoomed] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // ── Fetch product ──────────────────────────────────────────────
  useEffect(() => {
    if (!id) return;
    
    // setApiError(null);
    ProductService.getDetailById(id)
      .then((data) => {
        setProduct(data);
        if (data.colors.length > 0) setSelectedColorCode(data.colors[0].code);
        if (data.sizes.length > 0) setSelectedSizeId(data.sizes[0].id);
      })
      .catch((e: Error) => setApiError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  // ── Derived: matched variant ───────────────────────────────────
  const matchedVariant: VariantDto | null = useMemo(() => {
    if (!product || !selectedColorCode || !selectedSizeId) return null;
    return (
      product.variants.find(
        (v) => v.colorCode === selectedColorCode && v.sizeId === selectedSizeId
      ) ?? null
    );
  }, [product, selectedColorCode, selectedSizeId]);

  // ── Sizes available for selected color ─────────────────────────
  const availableSizeIds = useMemo(() => {
    if (!product || !selectedColorCode) return new Set<string>();
    return new Set(
      product.variants
        .filter((v) => v.colorCode === selectedColorCode && v.quantity > 0)
        .map((v) => v.sizeId)
    );
  }, [product, selectedColorCode]);

  // ── Image list: distinct variant images by selected color ──────
  const imageList = useMemo(() => {
    if (!product) return [];
    if (selectedColorCode) {
      const variantImgs = product.variants
        .filter((v) => v.colorCode === selectedColorCode && v.img)
        .map((v) => v.img)
        .filter((img, i, arr) => arr.indexOf(img) === i);
      if (variantImgs.length > 0) return variantImgs;
    }
    return [product.img, ...(product.hoverImg ? [product.hoverImg] : [])];
  }, [product, selectedColorCode]);

  const stock = matchedVariant?.quantity ?? 0;
  const canProceed = !!matchedVariant && stock > 0;
  const effectivePrice = product ? (product.salePrice ?? product.price) : 0;
  const discount =
    product?.salePrice != null
      ? Math.round((1 - product.salePrice / product.price) * 100)
      : 0;

  const selectedColorName =
    product?.colors.find((c) => c.code === selectedColorCode)?.name ?? "Chưa chọn";
  const selectedSizeName =
    product?.sizes.find((s) => s.id === selectedSizeId)?.name ?? null;

  // ── Helpers ────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleColorChange = (code: string) => {
    setSelectedColorCode(code);
    setSelectedSizeId(null);
    setQty(1);
    setActiveImage(0);
  };

  const handleSizeChange = (id: string) => {
    if (!availableSizeIds.has(id)) return;
    setSelectedSizeId(id);
    setQty(1);
  };

  const buildCartItem = () => {
    if (!product || !matchedVariant) return null;
    return {
      id: matchedVariant.id,           // productVariantId
      name: product.name,
      price: effectivePrice,
      img: imageList[0] ?? product.img,
      quantity: qty,
      colorName: selectedColorName,
      sizeName: selectedSizeName ?? "",
    };
  };

  /** Thêm vào giỏ → toast, không chuyển trang */
  const handleAddToCart = () => {
    if (!canProceed) return;
    const item = buildCartItem();
    if (!item) return;
    CartService.addItemFromVariant(item);
    showToast("✓ Đã thêm vào giỏ hàng!");
  };

  /** Mua ngay → push cart + navigate /checkout */
  const handleBuyNow = () => {
    if (!canProceed) return;
    const item = buildCartItem();
    if (!item) return;
    CartService.addItemFromVariant(item);
    navigate("/checkout");
  };

  // ── Loading / Error ────────────────────────────────────────────
  if (loading) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <div className={styles.container}>
            <div style={{ textAlign: "center", padding: "80px 0", color: "#9ca3af" }}>
              Đang tải sản phẩm...
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (apiError || !product) {
    return (
      <PageLayout>
        <div className={styles.page}>
          <div className={styles.container}>
            <div style={{ textAlign: "center", padding: "80px 0", color: "#ef4444" }}>
              {apiError ?? "Không tìm thấy sản phẩm"}
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>

          {/* Breadcrumb */}
          <nav className={styles.breadcrumb}>
            <a href="/">Trang chủ</a>
            <span>/</span>
            <a href="/products">Sản phẩm</a>
            <span>/</span>
            {product.categoryName && (
              <>
                <a href={`/category/${product.categoryId}`}>{product.categoryName}</a>
                <span>/</span>
              </>
            )}
            <span>{product.name}</span>
          </nav>

          {/* ── Main section ── */}
          <div className={styles.main}>

            {/* LEFT — Images */}
            <div className={styles.gallery}>
              <div className={styles.thumbs}>
                {imageList.map((src, i) => (
                  <button
                    key={i}
                    className={`${styles.thumb} ${i === activeImage ? styles["thumb--active"] : ""}`}
                    onClick={() => setActiveImage(i)}
                  >
                    <img src={src} alt={`Ảnh ${i + 1}`} />
                  </button>
                ))}
              </div>

              <div
                className={`${styles.mainImg} ${zoomed ? styles["mainImg--zoomed"] : ""}`}
                onClick={() => setZoomed(!zoomed)}
              >
                <img
                  src={imageList[activeImage] ?? product.img}
                  alt={product.name}
                />
                <div className={styles.zoomHint}>🔍 Click để phóng to</div>
                {discount > 0 && (
                  <div className={styles.discBadge}>-{discount}%</div>
                )}
              </div>
            </div>

            {/* RIGHT — Info */}
            <div className={styles.info}>
              <div className={styles.metaRow}>
                {product.categoryName && (
                  <span className={styles.brand}>{product.categoryName}</span>
                )}
              </div>

              <h1 className={styles.name}>{product.name}</h1>

              {/* Rating */}
              {product.rating != null && (
                <div className={styles.ratingRow}>
                  <Stars rating={product.rating} />
                  <span className={styles.ratingVal}>{product.rating.toFixed(1)}</span>
                  <span className={styles.ratingCount}>
                    ({product.ratingCount ?? 0} đánh giá)
                  </span>
                </div>
              )}

              {/* Price */}
              <div className={styles.priceRow}>
                <span className={styles.price}>{fmt(effectivePrice)}</span>
                {product.salePrice != null && (
                  <>
                    <span className={styles.originalPrice}>{fmt(product.price)}</span>
                    <span className={styles.discLabel}>Tiết kiệm {discount}%</span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div
                className={`${styles.stock} ${
                  canProceed ? styles["stock--in"] : styles["stock--out"]
                }`}
              >
                {matchedVariant
                  ? stock > 0
                    ? `✓ Còn hàng (${stock} sản phẩm)`
                    : "✕ Hết hàng"
                  : "Chọn màu & size để xem tồn kho"}
              </div>

              <div className={styles.divider} />

              {/* Color */}
              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>
                  Màu sắc: <strong>{selectedColorName}</strong>
                </div>
                <div className={styles.colorPicker}>
                  {product.colors.map((c) => (
                    <button
                      key={c.code}
                      className={`${styles.colorBtn} ${
                        selectedColorCode === c.code ? styles["colorBtn--active"] : ""
                      }`}
                      style={{
                        background: c.code,
                        border:
                          c.code.toLowerCase() === "#ffffff"
                            ? "1.5px solid #ddd"
                            : "none",
                      }}
                      onClick={() => handleColorChange(c.code)}
                      title={c.name}
                    />
                  ))}
                </div>
              </div>

              {/* Size */}
              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>
                  Size:{" "}
                  {selectedSizeName ? (
                    <strong>{selectedSizeName}</strong>
                  ) : (
                    <span className={styles.optionHint}>Chọn size</span>
                  )}
                </div>
                <div className={styles.sizePicker}>
                  {product.sizes.map((s) => {
                    const available = availableSizeIds.has(s.id);
                    return (
                      <button
                        key={s.id}
                        className={`${styles.sizeBtn} ${
                          selectedSizeId === s.id ? styles["sizeBtn--active"] : ""
                        }`}
                        style={
                          !available
                            ? {
                                opacity: 0.35,
                                cursor: "not-allowed",
                                textDecoration: "line-through",
                              }
                            : {}
                        }
                        onClick={() => handleSizeChange(s.id)}
                        disabled={!available}
                      >
                        {s.name}
                      </button>
                    );
                  })}
                </div>
                <a href="#size-guide" className={styles.sizeGuide}>
                  📏 Hướng dẫn chọn size
                </a>
              </div>

              {/* Quantity */}
              <div className={styles.optionGroup}>
                <div className={styles.optionLabel}>Số lượng:</div>
                <div className={styles.qtyRow}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    disabled={qty <= 1}
                  >
                    −
                  </button>
                  <span className={styles.qtyVal}>{qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => setQty((q) => Math.min(stock, q + 1))}
                    disabled={qty >= stock || stock === 0}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Toast */}
              {toast && (
                <div
                  style={{
                    padding: "10px 16px",
                    borderRadius: 10,
                    background: "#dcfce7",
                    color: "#15803d",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {toast}
                </div>
              )}

              {/* CTA buttons */}
              <div className={styles.ctaRow}>
                <button
                  className={`${styles.btnPrimary} ${
                    !canProceed ? styles["btnPrimary--disabled"] : ""
                  }`}
                  onClick={handleAddToCart}
                  disabled={!canProceed}
                >
                  🛒 Thêm vào giỏ hàng
                </button>
                <button
                  className={`${styles.btnSecondary} ${
                    !canProceed ? styles["btnSecondary--disabled"] : ""
                  }`}
                  onClick={handleBuyNow}
                  disabled={!canProceed}
                >
                  ⚡ Mua ngay
                </button>
              </div>
              {!selectedSizeId && (
                <p className={styles.sizeWarning}>
                  * Vui lòng chọn size trước khi thêm vào giỏ
                </p>
              )}

              <div className={styles.divider} />

              {/* Trust badges */}
              <div className={styles.trustRow}>
                <div className={styles.trustItem}>
                  <span>🚚</span>
                  <span>Giao hàng toàn quốc</span>
                </div>
                <div className={styles.trustItem}>
                  <span>🔄</span>
                  <span>Đổi trả 30 ngày</span>
                </div>
                <div className={styles.trustItem}>
                  <span>🛡️</span>
                  <span>Hàng chính hãng</span>
                </div>
                <div className={styles.trustItem}>
                  <span>💳</span>
                  <span>Thanh toán an toàn</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className={styles.tabs}>
            <div className={styles.tabBar}>
              {(["desc", "specs", "care"] as const).map((tab) => (
                <button
                  key={tab}
                  className={`${styles.tabBtn} ${
                    activeTab === tab ? styles["tabBtn--active"] : ""
                  }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === "desc"
                    ? "Mô tả sản phẩm"
                    : tab === "specs"
                    ? "Thông số kỹ thuật"
                    : "Hướng dẫn bảo quản"}
                </button>
              ))}
            </div>
            <div className={styles.tabContent}>
              {activeTab === "desc" && (
                <div className={styles.descContent}>
                  <p style={{ whiteSpace: "pre-line" }}>{product.description}</p>
                </div>
              )}
              {activeTab === "specs" && (
                <table className={styles.specsTable}>
                  <tbody>
                    <tr>
                      <td className={styles.specLabel}>Danh mục</td>
                      <td>{product.categoryName}</td>
                    </tr>
                    <tr>
                      <td className={styles.specLabel}>Màu sắc</td>
                      <td>{product.colors.map((c) => c.name).join(", ")}</td>
                    </tr>
                    <tr>
                      <td className={styles.specLabel}>Size</td>
                      <td>{product.sizes.map((s) => s.name).join(", ")}</td>
                    </tr>
                  </tbody>
                </table>
              )}
              {activeTab === "care" && (
                <ul className={styles.careList}>
                  <li>✓ Giặt máy ở nhiệt độ ≤ 30°C</li>
                  <li>✓ Không dùng chất tẩy mạnh</li>
                  <li>✓ Phơi trong bóng mát</li>
                  <li>✓ Là/ủi ở nhiệt độ thấp</li>
                </ul>
              )}
            </div>
          </div>

          {/* ── Policy cards ── */}
          <div className={styles.policyRow}>
            <div className={styles.policyCard}>
              <div className={styles.policyIcon}>🚚</div>
              <div>
                <div className={styles.policyTitle}>Giao hàng nhanh</div>
                <div className={styles.policyDesc}>
                  Nội thành 1–2 ngày, toàn quốc 3–5 ngày. Miễn ship đơn từ 499K.
                </div>
              </div>
            </div>
            <div className={styles.policyCard}>
              <div className={styles.policyIcon}>🔄</div>
              <div>
                <div className={styles.policyTitle}>Đổi trả 30 ngày</div>
                <div className={styles.policyDesc}>
                  Không cần lý do, hoàn tiền 100% nếu lỗi từ nhà sản xuất.
                </div>
              </div>
            </div>
            <div className={styles.policyCard}>
              <div className={styles.policyIcon}>📞</div>
              <div>
                <div className={styles.policyTitle}>Hỗ trợ 24/7</div>
                <div className={styles.policyDesc}>
                  Hotline: 0123 456 789. Chat trực tuyến trên website.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </PageLayout>
  );
};

export default ProductDetailPage;