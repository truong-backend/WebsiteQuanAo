// src/components/user/layout/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { CategoryService } from "@/features/user/categories/services/categoryService";
import type { NavbarCategory } from "@/features/user/categories/types/category.types";
import { authService } from "@/features/auth/services/authService";
import styles from "./Navbar.module.scss";

// ─── Types ────────────────────────────────────────────────────
type DropdownState = number | "user" | "search" | null;

// ─── Logo ─────────────────────────────────────────────────────
const LogoIcon: React.FC = () => (
  <svg
    width="32"
    height="32"
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="18" cy="18" r="18" fill="#f3f4f6" />
    <path
      d="M10 18 Q14 10 18 14 Q22 18 26 12"
      stroke="#a855f7"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M10 22 Q14 14 18 18 Q22 22 26 16"
      stroke="#22c55e"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
    <path
      d="M12 26 Q16 18 20 22 Q24 26 28 20"
      stroke="#3b82f6"
      strokeWidth="2.5"
      strokeLinecap="round"
      fill="none"
    />
  </svg>
);

const HamburgerIcon: React.FC = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <line
      x1="0"
      y1="2"
      x2="22"
      y2="2"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="4"
      y1="8"
      x2="22"
      y2="8"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="8"
      y1="14"
      x2="22"
      y2="14"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const CloseIcon: React.FC = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
    <line
      x1="1"
      y1="1"
      x2="17"
      y2="17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="17"
      y1="1"
      x2="1"
      y2="17"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

const SearchIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="11" cy="11" r="8" />
    <line x1="21" y1="21" x2="16.65" y2="16.65" />
  </svg>
);

const UserIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const CartIcon: React.FC = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

const ProfileIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const LogoutIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" y1="12" x2="9" y2="12" />
  </svg>
);

const OrderIcon: React.FC = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M3 9h18M9 21V9" />
  </svg>
);

// ─── NavbarInner ──────────────────────────────────────────────
interface NavbarInnerProps {
  categories: NavbarCategory[];
  scrolled: boolean;
  cartCount: number;
}

const NavbarInner: React.FC<NavbarInnerProps> = ({
  categories,
  scrolled,
  cartCount,
}) => {
  const [openDropdown, setOpenDropdown] = useState<DropdownState>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const navRef = useRef<HTMLElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const isAuthenticated = authService.isAuthenticated();
  const username = "Tài khoản";

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (key: DropdownState) =>
    setOpenDropdown((prev) => (prev === key ? null : key));

  const isActive = (path: string) => location.pathname === path;

  const handleCategoryClick = (categoryId: number) => {
    navigate(`/products?category=${categoryId}`);
    setOpenDropdown(null);
    setMobileOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchValue.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchValue.trim())}`);
      setSearchValue("");
      setOpenDropdown(null);
      setMobileOpen(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setOpenDropdown(null);
    navigate("/login");
  };

  return (
    <nav
      ref={navRef}
      className={[styles.nav, scrolled ? styles["nav--scrolled"] : ""].join(
        " ",
      )}
    >
      <div className={styles.inner}>
        <div className={styles.bar}>
          {/* Logo */}
          <Link to="/" className={styles.logo}>
            <LogoIcon />
            <span className={styles.logo__text}>ShopVN</span>
          </Link>

          {/* Desktop nav */}
          <nav className={styles.desktopLinks}>
            <Link
              to="/home"
              className={[
                styles.navLink,
                isActive("/") ? styles["navLink--active"] : "",
              ].join(" ")}
            >
              Trang Chủ
            </Link>
            <Link
              to="/about"
              className={[
                styles.navLink,
                isActive("/about") ? styles["navLink--active"] : "",
              ].join(" ")}
            >
              Về Chúng Tôi
            </Link>

            <div className={styles.catWrap}>
              <button
                className={[
                  styles.navLink,
                  styles.catBtn,
                  openDropdown === -1 ? styles["navLink--active"] : "",
                ].join(" ")}
                onClick={() => toggle(-1)}
              >
                Sản Phẩm
                <span
                  className={[
                    styles.catBtn__arrow,
                    openDropdown === -1 ? styles["catBtn__arrow--open"] : "",
                  ].join(" ")}
                >
                  ▾
                </span>
              </button>
              {openDropdown === -1 && (
                <div className={styles.catDropdown}>
                  <button
                    className={`${styles.dropItem} ${styles["dropItem--highlight"]}`}
                    onClick={() => {
                      navigate("/products");
                      setOpenDropdown(null);
                    }}
                  >
                    Tất cả sản phẩm
                  </button>
                  <div className={styles.dropDivider} />
                  {categories.map((cat) => (
                    <button
                      key={cat.categoryId}
                      className={styles.dropItem}
                      onClick={() => handleCategoryClick(cat.categoryId)}
                    >
                      {cat.categoryName}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/contact"
              className={[
                styles.navLink,
                isActive("/contact") ? styles["navLink--active"] : "",
              ].join(" ")}
            >
              Liên Hệ
            </Link>
          </nav>

          {/* Right actions */}
          <div className={styles.rightActions}>
            {/* Mobile hamburger */}
            <button
              className={styles.hamburgerBtn}
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <CloseIcon /> : <HamburgerIcon />}
            </button>

            {/* Cart (desktop only visual) */}
            <button
              className={styles.ctaBtn}
              style={{
                position: "relative",
                background: "none",
                color: "#3f3f46",
                padding: "0.25rem",
              }}
              onClick={() => navigate("/cart")}
              title="Giỏ hàng"
            >
              <CartIcon />
              {cartCount > 0 && (
                <span
                  className={styles.drawerBadge}
                  style={{ position: "absolute", top: "-6px", right: "-6px" }}
                >
                  {cartCount}
                </span>
              )}
            </button>

            {/* User menu or CTA */}
            {isAuthenticated ? (
              <div className={styles.userMenu}>
                <button
                  className={styles.userBtn}
                  onClick={() => toggle("user")}
                >
                  <UserIcon /> &nbsp;{username}
                </button>
                {openDropdown === "user" && (
                  <div className={styles.userDropdown}>
                    <button onClick={() => navigate("/profile")}>
                      <ProfileIcon /> Trang cá nhân
                    </button>
                    <button onClick={() => navigate("/orders/history")}>
                      <OrderIcon /> Đơn hàng
                    </button>
                    <button className={styles.logout} onClick={handleLogout}>
                      <LogoutIcon /> Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className={styles.ctaBtn}
                onClick={() => navigate("/login")}
              >
                Đăng Nhập
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className={styles.drawer}>
          <form className={styles.drawerSearch} onSubmit={handleSearch}>
            <SearchIcon />
            <input
              autoFocus
              type="text"
              className={styles.drawerSearchInput}
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              placeholder="Tìm kiếm sản phẩm..."
            />
            <button type="submit" className={styles.drawerSearchBtn}>
              Tìm
            </button>
          </form>

          <div className={styles.drawerLinks}>
            <button
              className={styles.drawerItem}
              onClick={() => {
                navigate("/");
                setMobileOpen(false);
              }}
            >
              Trang Chủ
            </button>
            <button
              className={styles.drawerItem}
              onClick={() => {
                navigate("/about");
                setMobileOpen(false);
              }}
            >
              Về Chúng Tôi
            </button>
            <button
              className={styles.drawerItem}
              onClick={() => {
                navigate("/products");
                setMobileOpen(false);
              }}
            >
              Tất cả sản phẩm
            </button>
            {categories.map((cat) => (
              <button
                key={cat.categoryId}
                className={`${styles.drawerItem} ${styles["drawerItem--indent"]}`}
                onClick={() => handleCategoryClick(cat.categoryId)}
              >
                — {cat.categoryName}
              </button>
            ))}
            <button
              className={styles.drawerItem}
              onClick={() => {
                navigate("/contact");
                setMobileOpen(false);
              }}
            >
              Liên Hệ
            </button>
          </div>

          <div className={styles.drawerDivider} />

          <button
            className={styles.drawerItem}
            onClick={() => {
              navigate("/cart");
              setMobileOpen(false);
            }}
          >
            <CartIcon />
            &nbsp; Giỏ hàng
            {cartCount > 0 && (
              <span className={styles.drawerBadge}>{cartCount}</span>
            )}
          </button>

          {isAuthenticated ? (
            <>
              <div className={styles.drawerUserRow}>
                <div className={styles.drawerAvatar}>
                  {username.charAt(0).toUpperCase()}
                </div>
                <span className={styles.drawerUserName}>{username}</span>
              </div>
              <button
                className={styles.drawerItem}
                onClick={() => {
                  navigate("/profile");
                  setMobileOpen(false);
                }}
              >
                <ProfileIcon /> &nbsp;Trang cá nhân
              </button>
              <button
                className={styles.drawerItem}
                onClick={() => {
                  navigate("/orders");
                  setMobileOpen(false);
                }}
              >
                <OrderIcon /> &nbsp;Đơn hàng
              </button>
              <button
                className={`${styles.drawerItem} ${styles["drawerItem--danger"]}`}
                onClick={handleLogout}
              >
                <LogoutIcon /> &nbsp;Đăng xuất
              </button>
            </>
          ) : (
            <button
              className={`${styles.drawerItem} ${styles["drawerItem--primary"]}`}
              onClick={() => {
                navigate("/login");
                setMobileOpen(false);
              }}
            >
              <UserIcon /> &nbsp;Đăng nhập
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

// ─── Navbar (outer) ───────────────────────────────────────────
const Navbar: React.FC = () => {
  const [categories, setCategories] = useState<NavbarCategory[]>([]);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    CategoryService.getNavbarCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem("cart_items");
        if (!raw) return setCartCount(0);
        const items = JSON.parse(raw) as Array<{ quantity: number }>;
        setCartCount(items.reduce((s, i) => s + (i.quantity ?? 0), 0));
      } catch {
        setCartCount(0);
      }
    };
    readCart();
    window.addEventListener("storage", readCart);
    return () => window.removeEventListener("storage", readCart);
  }, []);

  return (
    <NavbarInner
      key={location.pathname}
      categories={categories}
      scrolled={scrolled}
      cartCount={cartCount}
    />
  );
};

export default Navbar;
