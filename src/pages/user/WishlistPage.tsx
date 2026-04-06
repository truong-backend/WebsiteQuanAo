// src/pages/WishlistPage.tsx
// Moved from: src/pages/user/WishlistPage.tsx
// Changed imports: @/modules → @/features/cart/services/localCartService
// Note: dùng mock data, chưa có API wishlist thật
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LocalCartService } from "@/features/user/cart/services/localCartService";
import styles from "./WishlistPage.module.scss";

interface WishItem {
  id: string;
  name: string;
  price: number;
  category: string;
  img: string;
}

const NAV_LINKS = [
  { icon: "person", label: "Profile", to: "/profile" },
  { icon: "package_2", label: "Orders", to: "/orders/history" },
  { icon: "favorite", label: "Wishlist", to: "/wishlist", active: true },
];

// Mock data — thay bằng API call khi backend có endpoint wishlist
const MOCK_ITEMS: WishItem[] = [
  {
    id: "1",
    name: "Áo Khoác Dạ Atelier",
    price: 3_500_000,
    category: "Outerwear",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKky66zt-Dn3cTD7AjGm6k34JJWA593k_gwgXO_8MvvA5Crfp2ae3XGoSy42v9yXbwU-1zhBtsJTYelkCAFfyy7TIjyhB7AOY8G7osjrrDxksUD94IyaWpvAXruHqptaGknjGkoh0t_oRWgVj7VhQI5ZQbkyXWKZfzgtonyzQsRg6pyQxsU3RxWpTsqQY1HDeLYu5S3exlq459oi6uBq8gVMGK5NEaVii1e9OL8-8vI7il9QUd8KA_Mxj5oWvjHZgRW2HM57xjO44",
  },
  {
    id: "2",
    name: "Váy Lụa Slip-on",
    price: 2_200_000,
    category: "Dresses",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuA8jwtmrUHopPv8lnhWDfSZxH2I20guhIjm3rvSXdorbgZeMboWaEwBXv0ldfft3IwdF6q19Xiyx0zdfjYlonHdcedAv19wibkmNklPF-lolVzet55EBL7SoPzxyft7-A5u-sM_G08fR4OYjtMWTmyr6o762ZlYEplZkS7DGuA3oEuvtPsExYv40xxZiCNNhYOFmlExltlQg9htR9Fw8NVt6PXulMrzXTe-EIGD5fkGl_Qw6de_1l4SoaC7nwywg6uJfcSwiwlkKjg",
  },
  {
    id: "3",
    name: "Blazer Cấu Trúc",
    price: 4_800_000,
    category: "Tailoring",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDgV7pP_pFBhkiJjwyJPgkfb_LvRuYNeFuYXivXvD7FnP8LeG_gVyOvIfcTLwa8fy8VwSluXytgUHrFXYUqDrCTr2QGraYy_oa4LjM8i0qkKcimVmIWYHg9zjVSRLPDxkJNI7pq0q8RqNbJiUBuJBZ9BdW7OrA-8VRNkbadXLlzVw8ayoXN26GGK3ueuKF8RIo9rF_meEsnLFfxQR1ZIuiPJwlzfyT2qrYDuglJtVzifaZheCVHmUZl5s2dH3OAfVX4GqXXj9KXkpA",
  },
];

const WishlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<WishItem[]>(MOCK_ITEMS);

  // ── Flow ────────────────────────────────────────────────────
  // handleRemove: xóa item khỏi danh sách local (mock, chưa có API)
  // handleAddToCart:
  //   Input:  WishItem { id, name, price, img }
  //   Gọi:   LocalCartService.addItem({ id, name, price, img }, quantity=1)
  //   Effect: navigate('/cart')

  const handleRemove = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const handleAddToCart = (item: WishItem) => {
    LocalCartService.addItem(
      { id: item.id, name: item.name, price: item.price, img: item.img },
      1,
    );
    navigate("/cart");
  };

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHead}>
          <h2 className={styles.sidebarName}>My Account</h2>
          <p className={styles.sidebarRole}>Premium Member</p>
        </div>
        <nav className={styles.nav}>
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              to={link.to}
              className={`${styles.navLink} ${link.active ? styles["navLink--active"] : ""}`}
            >
              <span
                className={styles.navIcon}
                style={
                  link.active
                    ? { fontVariationSettings: "'FILL' 1, 'wght' 300" }
                    : undefined
                }
              >
                {link.icon}
              </span>
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main */}
      <main className={styles.main}>
        <header className={styles.header}>
          <h1 className={styles.title}>Sản phẩm yêu thích</h1>
          <div className={styles.divider} />
        </header>

        {items.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>heart_broken</span>
            <h2 className={styles.emptyTitle}>Danh sách trống</h2>
            <p className={styles.emptyDesc}>
              Bạn chưa có sản phẩm nào trong danh sách yêu thích.
            </p>
            <Link to="/products" className={styles.emptyAction}>
              Tiếp tục mua sắm
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {items.map((item) => (
              <div key={item.id} className={styles.card}>
                <div className={styles.imgWrap}>
                  <img
                    className={styles.img}
                    src={item.img}
                    alt={item.name}
                    onClick={() => navigate(`/products/${item.id}`)}
                  />
                  <button
                    className={styles.removeBtn}
                    onClick={() => handleRemove(item.id)}
                    aria-label="Xóa khỏi danh sách"
                  >
                    <span className={styles.navIcon}>close</span>
                  </button>
                </div>
                <div className={styles.body}>
                  <div className={styles.nameRow}>
                    <h3 className={styles.name}>{item.name}</h3>
                    <span className={styles.price}>
                      {item.price.toLocaleString("vi-VN")}₫
                    </span>
                  </div>
                  <p className={styles.category}>{item.category}</p>
                  <button
                    className={styles.addBtn}
                    onClick={() => handleAddToCart(item)}
                  >
                    Thêm vào giỏ
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default WishlistPage;
