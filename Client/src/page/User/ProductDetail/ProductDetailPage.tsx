// // src/pages/Product/ProductDetailPage.tsx
// import { useEffect, useState } from "react";
// import { useParams, useNavigate, Link } from "react-router-dom";
// import { ProductService } from "../../../Service/ProductService";
// import { CartService } from "../../../Service/CartService";
// import type { ProductResponse } from "../../../type/product/ProductResponse";
// import type { ProductVariantResponse } from "../../../type/ProductVariant/ProductVariantResponse";
// import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";
// import BackButton from "../../../Components/User/ui/BackButton/BackButton";
// import PriceText from "../../../Components/User/ui/PriceText/PriceText";
// import AddToCartToast from "../../../Components/User/ui/AddToCartToast/AddToCartToast";
// import Loading from "../../../Components/User/Loading/Loading";
// import ErrorAlert from "../../../Components/User/ui/ErrorAlert/ErrorAlert";
// import styles from "./ProductDetailPage.module.scss";

// const BASE_URL = "http://localhost:8080";

// // ─── Consolidated fetch state ─────────────────────────────────────────────────
// // Grouping loading / error / data / selections into one object means the
// // effect only ever calls setState once — satisfying the linter rule while
// // keeping a single re-render per transition.

// interface FetchState {
//   loading:       boolean;
//   error:         string | null;
//   product:       ProductResponse | null;
//   variants:      ProductVariantResponse[];
//   selectedColor: string | null;
//   selectedSize:  string | null;
// }

// const LOADING_STATE: FetchState = {
//   loading: true, error: null, product: null, variants: [],
//   selectedColor: null, selectedSize: null,
// };

// // ─── Component ────────────────────────────────────────────────────────────────

// const ProductDetailPage: React.FC = () => {
//   const { id }   = useParams<{ id: string }>();
//   const navigate = useNavigate();

//   // One state atom for everything that changes together on a new fetch.
//   const [fetchState, setFetchState] = useState<FetchState>(LOADING_STATE);

//   // UI-only state that is independent of the fetch lifecycle.
//   const [imgHovered, setImgHovered] = useState(false);
//   const [added, setAdded]           = useState(false);
//   const [adding, setAdding]         = useState(false);

//   useEffect(() => {
//     if (!id) return;

//     // Single setState call — the linter is satisfied because there is only one
//     // synchronous setState here, and it is resetting to a well-defined initial
//     // shape before the async work begins.
//     setFetchState(LOADING_STATE);

//     let cancelled = false;

//     Promise.all([
//       ProductService.getById(id),
//       ProductService.getVariantsByProductId(id),
//     ])
//       .then(([product, variants]) => {
//         if (!cancelled) {
//           setFetchState({
//             loading: false, error: null,
//             product, variants,
//             selectedColor: null, selectedSize: null,
//           });
//         }
//       })
//       .catch((err) => {
//         if (!cancelled) {
//           setFetchState({
//             loading: false,
//             error: err instanceof Error ? err.message : "Không thể tải sản phẩm",
//             product: null, variants: [],
//             selectedColor: null, selectedSize: null,
//           });
//         }
//       });

//     return () => { cancelled = true; };
//   }, [id]);

//   const { loading, error, product, variants, selectedColor, selectedSize } = fetchState;

//   // Convenience updaters that keep the rest of fetchState intact.
//   const setSelectedColor = (code: string | null) =>
//     setFetchState((prev) => ({ ...prev, selectedColor: code, selectedSize: null }));
//   const setSelectedSize = (size: string | null) =>
//     setFetchState((prev) => ({ ...prev, selectedSize: size }));

//   // ── Derived values ────────────────────────────────────────────────────────────

//   const colors = variants.length
//     ? [...new Map(variants.map((v) => [v.colorCode, { code: v.colorCode, name: v.colorName }])).values()]
//     : [];

//   const sizes = selectedColor
//     ? variants
//         .filter((v) => v.colorCode === selectedColor)
//         .map((v) => ({ id: v.sizeId, name: v.sizeId }))
//         .filter((s, i, a) => a.findIndex((x) => x.id === s.id) === i)
//     : [];

//   const matchedVariant = variants.find(
//     (v) => v.colorCode === selectedColor && v.sizeId === selectedSize,
//   ) ?? null;

//   const mainImg    = `${BASE_URL}${matchedVariant?.img ?? product?.img ?? ""}`;
//   const hoverImg   = product?.hoverImg ? `${BASE_URL}${product.hoverImg}` : mainImg;
//   const stock      = matchedVariant?.quantity ?? null;
//   const outOfStock = stock !== null && stock === 0;

//   // ── Handlers ──────────────────────────────────────────────────────────────────

//   const handleAddToCart = () => {
//     if (!product) return;
//     setAdding(true);
//     CartService.addItem(
//       { id: product.id, name: product.name, price: product.price, img: product.img },
//       1,
//     );
//     setTimeout(() => { setAdding(false); setAdded(true); }, 300);
//   };

//   const handleBuyNow = () => {
//     if (!product) return;
//     CartService.addItem(
//       { id: product.id, name: product.name, price: product.price, img: product.img },
//       1,
//     );
//     navigate("/checkout");
//   };

//   // ── Early returns ─────────────────────────────────────────────────────────────

//   if (loading) return (
//     <PageLayout><Loading message="Đang tải sản phẩm..." fullScreen /></PageLayout>
//   );

//   if (error || !product) return (
//     <PageLayout>
//       <div className={styles.page}>
//         <div className={styles.container}>
//           <ErrorAlert message={error ?? "Không tìm thấy sản phẩm"} />
//         </div>
//       </div>
//     </PageLayout>
//   );

//   // ── Render ────────────────────────────────────────────────────────────────────

//   return (
//     <PageLayout>
//       <div className={styles.page}>
//         <div className={styles.container}>

//           <div className={styles.topBar}>
//             <div className={styles.breadcrumb}>
//               <Link to="/products">Sản phẩm</Link>
//               <span>›</span>
//               <span>{product.name}</span>
//             </div>
//             <BackButton />
//           </div>

//           <div className={styles.card}>
//             <div className={styles.grid}>

//               {/* ── Image ── */}
//               <div>
//                 <div
//                   className={styles.imgWrap}
//                   onMouseEnter={() => setImgHovered(true)}
//                   onMouseLeave={() => setImgHovered(false)}
//                 >
//                   <img
//                     className={styles.img}
//                     src={imgHovered ? hoverImg : mainImg}
//                     alt={product.name}
//                   />
//                 </div>
//                 {selectedColor && (
//                   <div className={styles.thumbs}>
//                     {variants
//                       .filter((v) => v.colorCode === selectedColor)
//                       .map((v) => (
//                         <img
//                           key={v.id}
//                           className={styles.thumb}
//                           src={`${BASE_URL}${v.img}`}
//                           alt={v.colorName}
//                         />
//                       ))}
//                   </div>
//                 )}
//               </div>

//               {/* ── Info ── */}
//               <div>
//                 <h1 className={styles.name}>{product.name}</h1>
//                 <PriceText amount={product.price} fontWeight="bold" />
//                 {product.description && <p className={styles.desc}>{product.description}</p>}

//                 {/* Colour picker */}
//                 {colors.length > 0 && (
//                   <div style={{ marginBottom: 24 }}>
//                     <p className={styles.section}>
//                       Màu sắc{" "}
//                       {selectedColor && (
//                         <span style={{ fontWeight: 400, textTransform: "none", opacity: 0.7 }}>
//                           — {colors.find((c) => c.code === selectedColor)?.name}
//                         </span>
//                       )}
//                     </p>
//                     <div className={styles.colors}>
//                       {colors.map((c) => (
//                         <div
//                           key={c.code}
//                           title={c.name}
//                           className={`${styles.colorDot} ${selectedColor === c.code ? styles["colorDot--active"] : ""}`}
//                           style={{ backgroundColor: c.code }}
//                           onClick={() => setSelectedColor(c.code)}
//                         />
//                       ))}
//                     </div>
//                   </div>
//                 )}

//                 {/* Size picker */}
//                 {selectedColor && sizes.length > 0 && (
//                   <div style={{ marginBottom: 24 }}>
//                     <p className={styles.section}>Kích thước</p>
//                     <div className={styles.sizes}>
//                       {sizes.map((s) => {
//                         const v = variants.find(
//                           (vv) => vv.colorCode === selectedColor && vv.sizeId === s.id,
//                         );
//                         const noStock = (v?.quantity ?? 0) === 0;
//                         return (
//                           <button
//                             key={s.id}
//                             disabled={noStock}
//                             className={[
//                               styles.sizeChip,
//                               selectedSize === s.id ? styles["sizeChip--active"] : "",
//                               noStock ? styles["sizeChip--outOfStock"] : "",
//                             ].join(" ")}
//                             onClick={() => !noStock && setSelectedSize(s.id)}
//                           >
//                             {s.name}
//                           </button>
//                         );
//                       })}
//                     </div>
//                   </div>
//                 )}

//                 {/* Stock badge */}
//                 {matchedVariant && (
//                   <p className={`${styles.stock} ${outOfStock ? styles["stock--out"] : styles["stock--ok"]}`}>
//                     {outOfStock ? "Hết hàng" : `Còn ${stock} sản phẩm`}
//                   </p>
//                 )}

//                 {/* CTA buttons */}
//                 <div className={styles.btnRow}>
//                   <button
//                     className={`${styles.btnCart} ${added ? styles["btnCart--added"] : ""}`}
//                     onClick={handleAddToCart}
//                     disabled={adding || outOfStock}
//                   >
//                     {adding ? "Đang thêm..." : added ? "✓ Đã thêm vào giỏ!" : "🛒 Thêm vào giỏ hàng"}
//                   </button>
//                   {added && (
//                     <button className={styles.btnViewCart} onClick={() => navigate("/cart")}>
//                       🛍 Xem giỏ hàng
//                     </button>
//                   )}
//                 </div>
//                 <button className={styles.btnBuy} onClick={handleBuyNow} disabled={outOfStock}>
//                   ⚡ Mua ngay
//                 </button>
//               </div>

//             </div>
//           </div>
//         </div>
//       </div>

//       <AddToCartToast
//         open={added}
//         productName={product.name}
//         onClose={() => setAdded(false)}
//       />
//     </PageLayout>
//   );
// };

// export default ProductDetailPage;