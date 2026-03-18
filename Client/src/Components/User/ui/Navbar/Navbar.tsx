// src/Components/User/ui/Navbar/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  categoryService,
  type NavbarCategory,
} from "../../../../Service/categoryService";
import { authService } from "../../../../Service/AuthService";
import {
  ShoppingCartOutlined,
  UserOutlined,
  CloseOutlined,
  SearchOutlined,
  LogoutOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import styles from "./Navbar.module.scss";

// ─── Types ────────────────────────────────────────────────────────────────────

type DropdownState = number | "user" | "search" | null;

// ─── Logo Icon (SVG approximation of Fclick-style icon) ──────────────────────

const LogoIcon: React.FC = () => (
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="18" cy="18" r="18" fill="#f3f4f6" />
    <path d="M10 18 Q14 10 18 14 Q22 18 26 12" stroke="#a855f7" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M10 22 Q14 14 18 18 Q22 22 26 16" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M12 26 Q16 18 20 22 Q24 26 28 20" stroke="#3b82f6" strokeWidth="2.5" strokeLinecap="round" fill="none"/>
  </svg>
);

// ─── Hamburger Icon ───────────────────────────────────────────────────────────

const HamburgerIcon: React.FC = () => (
  <svg width="22" height="16" viewBox="0 0 22 16" fill="none">
    <line x1="0" y1="2"  x2="22" y2="2"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="4" y1="8"  x2="22" y2="8"  stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="8" y1="14" x2="22" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Navbar: React.FC = () => {
  const [categories, setCategories]     = useState<NavbarCategory[]>([]);
  const [openDropdown, setOpenDropdown] = useState<DropdownState>(null);
  const [mobileOpen, setMobileOpen]     = useState(false);
  const [searchValue, setSearchValue]   = useState("");
  const [scrolled, setScrolled]         = useState(false);
  const [cartCount, setCartCount]       = useState(0);
  const navRef                          = useRef<HTMLElement>(null);
  const navigate                        = useNavigate();
  const location                        = useLocation();

  const isAuthenticated = authService.isAuthenticated();
  const username        = "Tài khoản";

  useEffect(() => {
    categoryService.getNavbarCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

  useEffect(() => {
    const readCart = () => {
      try {
        const raw = localStorage.getItem("cart");
        if (!raw) return setCartCount(0);
        const items = JSON.parse(raw) as Array<{ quantity: number }>;
        setCartCount(items.reduce((s, i) => s + (i.quantity ?? 0), 0));
      } catch { setCartCount(0); }
    };
    readCart();
    window.addEventListener("storage", readCart);
    return () => window.removeEventListener("storage", readCart);
  }, []);

  // ── Handlers ────────────────────────────────────────────────────────────────

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

  const toggle = (key: DropdownState) =>
    setOpenDropdown((prev) => (prev === key ? null : key));

  const isActive = (path: string) => location.pathname === path;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      <nav
        ref={navRef}
        className={[styles.nav, scrolled ? styles["nav--scrolled"] : ""].join(" ")}
      >
        <div className={styles.inner}>
          <div className={styles.bar}>

            {/* ── Logo ──────────────────────────────────────────────── */}
            <Link to="/" className={styles.logo}>
              <LogoIcon />
              <span className={styles.logo__text}>ShopVN</span>
            </Link>

            {/* ── Desktop center nav links ──────────────────────────── */}
            <nav className={styles.desktopLinks} aria-label="Main navigation">
              <Link to="/"        className={[styles.navLink, isActive("/") ? styles["navLink--active"] : ""].join(" ")}>Trang Chủ</Link>
              <Link to="/about"   className={[styles.navLink, isActive("/about") ? styles["navLink--active"] : ""].join(" ")}>Về Chúng Tôi</Link>

              {/* Categories as "Dịch Vụ" style dropdown */}
              <div className={styles.catWrap}>
                <button
                  className={[styles.navLink, styles.catBtn, openDropdown === -1 ? styles["navLink--active"] : ""].join(" ")}
                  onClick={() => toggle(-1)}
                >
                  Sản Phẩm
                  <span className={[styles.catBtn__arrow, openDropdown === -1 ? styles["catBtn__arrow--open"] : ""].join(" ")}>▾</span>
                </button>
                {openDropdown === -1 && (
                  <div className={styles.catDropdown}>
                    <button className={`${styles.dropItem} ${styles["dropItem--highlight"]}`} onClick={() => { navigate("/products"); setOpenDropdown(null); }}>
                      Tất cả sản phẩm
                    </button>
                    <div className={styles.dropDivider} />
                    {categories.map((cat) => (
                      <button key={cat.categoryId} className={styles.dropItem} onClick={() => handleCategoryClick(cat.categoryId)}>
                        {cat.categoryName}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link to="/contact" className={[styles.navLink, isActive("/contact") ? styles["navLink--active"] : ""].join(" ")}>Liên Hệ</Link>
            </nav>

            {/* ── Right side ────────────────────────────────────────── */}
            <div className={styles.rightActions}>

              {/* Hamburger ≡ — always visible */}
              <button
                className={styles.hamburgerBtn}
                onClick={() => setMobileOpen(!mobileOpen)}
                title="Menu"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <CloseOutlined style={{ fontSize: 20 }} /> : <HamburgerIcon />}
              </button>

              {/* CTA pill button — Fclick "Bắt Đầu" */}
              {isAuthenticated ? (
  <div className={styles.userMenu}>
    <button
      className={styles.userBtn}
      onClick={() => toggle("user")}
    >
      <UserOutlined style={{ marginRight: 6 }} />
      {username}
    </button>

    {openDropdown === "user" && (
      <div className={styles.userDropdown}>
        <button onClick={() => navigate("/profile")}>
          <ProfileOutlined /> Trang cá nhân
        </button>
        <button onClick={() => navigate("/orders")}>
          <ShoppingCartOutlined /> Đơn hàng
        </button>
        <button
          className={styles.logout}
          onClick={handleLogout}
        >
          <LogoutOutlined /> Đăng xuất
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

        {/* ── Mobile / hamburger drawer ─────────────────────────────── */}
        {mobileOpen && (
          <div className={styles.drawer}>

            {/* Search */}
            <form className={styles.drawerSearch} onSubmit={handleSearch}>
              <SearchOutlined style={{ fontSize: 16, color: "#9ca3af" }} />
              <input
                autoFocus
                type="text"
                className={styles.drawerSearchInput}
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Tìm kiếm sản phẩm..."
              />
              <button type="submit" className={styles.drawerSearchBtn}>Tìm</button>
            </form>

            {/* Nav links */}
            <div className={styles.drawerLinks}>
              <button className={styles.drawerItem} onClick={() => navigate("/")}>Trang Chủ</button>
              <button className={styles.drawerItem} onClick={() => navigate("/about")}>Về Chúng Tôi</button>
              <button className={styles.drawerItem} onClick={() => navigate("/products")}>Tất cả sản phẩm</button>
              {categories.map((cat) => (
                <button key={cat.categoryId} className={`${styles.drawerItem} ${styles["drawerItem--indent"]}`} onClick={() => handleCategoryClick(cat.categoryId)}>
                  — {cat.categoryName}
                </button>
              ))}
              <button className={styles.drawerItem} onClick={() => navigate("/contact")}>Liên Hệ</button>
            </div>

            <div className={styles.drawerDivider} />

            {/* Cart */}
            <button className={styles.drawerItem} onClick={() => { navigate("/cart"); setMobileOpen(false); }}>
              <ShoppingCartOutlined style={{ marginRight: 10, fontSize: 15 }} />
              Giỏ hàng {cartCount > 0 && <span className={styles.drawerBadge}>{cartCount}</span>}
            </button>

            {/* Auth */}
            {isAuthenticated ? (
              <>
                <div className={styles.drawerUserRow}>
                  <div className={styles.drawerAvatar}>{username.charAt(0).toUpperCase()}</div>
                  <span className={styles.drawerUserName}>{username}</span>
                </div>
                <button className={styles.drawerItem} onClick={() => { navigate("/profile"); setMobileOpen(false); }}>
                  <ProfileOutlined style={{ marginRight: 10, fontSize: 15 }} />Trang cá nhân
                </button>
                <button className={styles.drawerItem} onClick={() => { navigate("/orders"); setMobileOpen(false); }}>
                  <ShoppingCartOutlined style={{ marginRight: 10, fontSize: 15 }} />Đơn hàng
                </button>
                <button className={`${styles.drawerItem} ${styles["drawerItem--danger"]}`} onClick={handleLogout}>
                  <LogoutOutlined style={{ marginRight: 10, fontSize: 15 }} />Đăng xuất
                </button>
              </>
            ) : (
              <button className={`${styles.drawerItem} ${styles["drawerItem--primary"]}`} onClick={() => { navigate("/login"); setMobileOpen(false); }}>
                <UserOutlined style={{ marginRight: 10, fontSize: 15 }} />Đăng nhập
              </button>
            )}
          </div>
        )}
      </nav>
    </>
  );
};

export default Navbar;