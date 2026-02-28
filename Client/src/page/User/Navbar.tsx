// src/Components/User/Navbar.tsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { categoryService, type NavbarCategory } from "../../Service/categoryService";
import { authService } from "../../Service/AuthService";
import { ShoppingCartOutlined, UserOutlined, MenuOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";

const Navbar: React.FC = () => {
  const [categories, setCategories] = useState<NavbarCategory[]>([]);
  const [openDropdown, setOpenDropdown] = useState<number | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Fetch 1 lần duy nhất khi mount
  useEffect(() => {
    categoryService.getNavbarCategories()
      .then(setCategories)
      .catch(() => {});
  }, []);

  // Scroll effect
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Đóng dropdown khi click ngoài
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenDropdown(null);
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Đóng mobile menu khi đổi route
  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
  }, [location.pathname]);

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
      setSearchOpen(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <>
      <nav
        ref={navRef}
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          backgroundColor: scrolled ? "#fff" : "#fff",
          boxShadow: scrolled ? "0 2px 16px rgba(0,0,0,0.10)" : "0 1px 4px rgba(0,0,0,0.06)",
          transition: "box-shadow 0.3s",
          fontFamily: "'Be Vietnam Pro', 'Segoe UI', sans-serif",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px" }}>
          <div style={{ display: "flex", alignItems: "center", height: 64, gap: 8 }}>

            {/* Logo */}
            <Link
              to="/products"
              style={{
                fontWeight: 800,
                fontSize: 22,
                color: "#111",
                textDecoration: "none",
                letterSpacing: "-0.5px",
                marginRight: 24,
                whiteSpace: "nowrap",
              }}
            >
              SHOP<span style={{ color: "#e53935" }}>VN</span>
            </Link>

            {/* Desktop nav links */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                flex: 1,
                // Ẩn trên mobile
              }}
              className="navbar-desktop-links"
            >
              {/* Tất cả sản phẩm */}
              <NavLink to="/products" label="Tất cả" />

              {/* Category dropdowns */}
              {categories.map((cat) => (
                <div key={cat.categoryId} style={{ position: "relative" }}>
                  {cat.children.length > 0 ? (
                    <>
                      <button
                        onClick={() =>
                          setOpenDropdown(openDropdown === cat.categoryId ? null : cat.categoryId)
                        }
                        style={{
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          padding: "8px 14px",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 500,
                          color: "#333",
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                          transition: "background 0.15s, color 0.15s",
                          backgroundColor: openDropdown === cat.categoryId ? "#f5f5f5" : "transparent",
                        }}
                      >
                        {cat.categoryName}
                        <span
                          style={{
                            fontSize: 10,
                            transform: openDropdown === cat.categoryId ? "rotate(180deg)" : "rotate(0deg)",
                            transition: "transform 0.2s",
                            display: "inline-block",
                          }}
                        >
                          ▼
                        </span>
                      </button>

                      {/* Dropdown */}
                      {openDropdown === cat.categoryId && (
                        <div
                          style={{
                            position: "absolute",
                            top: "calc(100% + 8px)",
                            left: 0,
                            minWidth: 200,
                            backgroundColor: "#fff",
                            borderRadius: 12,
                            boxShadow: "0 8px 32px rgba(0,0,0,0.13)",
                            padding: "8px 0",
                            zIndex: 200,
                            border: "1px solid #f0f0f0",
                          }}
                        >
                          {/* Xem tất cả trong danh mục root */}
                          <button
                            onClick={() => handleCategoryClick(cat.categoryId)}
                            style={dropdownItemStyle}
                          >
                            <span style={{ color: "#e53935", fontWeight: 600 }}>
                              Tất cả {cat.categoryName}
                            </span>
                          </button>
                          <div style={{ height: 1, backgroundColor: "#f0f0f0", margin: "4px 0" }} />
                          {cat.children.map((child) => (
                            <button
                              key={child.categoryId}
                              onClick={() => handleCategoryClick(child.categoryId)}
                              style={dropdownItemStyle}
                            >
                              {child.categoryName}
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    // Root không có children → click trực tiếp
                    <button
                      onClick={() => handleCategoryClick(cat.categoryId)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "8px 14px",
                        borderRadius: 8,
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#333",
                        transition: "background 0.15s",
                      }}
                    >
                      {cat.categoryName}
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Right actions */}
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginLeft: "auto" }}>

              {/* Search */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  style={iconBtnStyle}
                  title="Tìm kiếm"
                >
                  <SearchOutlined style={{ fontSize: 18 }} />
                </button>
                {searchOpen && (
                  <form
                    onSubmit={handleSearch}
                    style={{
                      position: "absolute",
                      right: 0,
                      top: "calc(100% + 8px)",
                      backgroundColor: "#fff",
                      borderRadius: 10,
                      boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                      padding: 12,
                      display: "flex",
                      gap: 8,
                      minWidth: 280,
                      border: "1px solid #eee",
                      zIndex: 200,
                    }}
                  >
                    <input
                      autoFocus
                      type="text"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      placeholder="Tìm kiếm sản phẩm..."
                      style={{
                        flex: 1,
                        border: "1px solid #ddd",
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 14,
                        outline: "none",
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        backgroundColor: "#e53935",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        padding: "8px 14px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: 13,
                      }}
                    >
                      Tìm
                    </button>
                  </form>
                )}
              </div>

              {/* Cart */}
              <Link to="/cart" style={{ ...iconBtnStyle, textDecoration: "none", color: "#333" }} title="Giỏ hàng">
                <ShoppingCartOutlined style={{ fontSize: 18 }} />
              </Link>

              {/* User / Login */}
              {authService.isAuthenticated() ? (
                <button onClick={handleLogout} style={iconBtnStyle} title="Đăng xuất">
                  <UserOutlined style={{ fontSize: 18 }} />
                </button>
              ) : (
                <Link to="/login" style={{ ...iconBtnStyle, textDecoration: "none", color: "#333" }} title="Đăng nhập">
                  <UserOutlined style={{ fontSize: 18 }} />
                </Link>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                style={{ ...iconBtnStyle, display: "none" }}
                className="navbar-hamburger"
                title="Menu"
              >
                {mobileOpen ? <CloseOutlined style={{ fontSize: 18 }} /> : <MenuOutlined style={{ fontSize: 18 }} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div
            style={{
              backgroundColor: "#fff",
              borderTop: "1px solid #f0f0f0",
              padding: "12px 24px 20px",
              maxHeight: "70vh",
              overflowY: "auto",
            }}
          >
            {/* Mobile search */}
            <form onSubmit={handleSearch} style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Tìm kiếm..."
                style={{
                  flex: 1,
                  border: "1px solid #ddd",
                  borderRadius: 8,
                  padding: "8px 12px",
                  fontSize: 14,
                  outline: "none",
                }}
              />
              <button
                type="submit"
                style={{
                  backgroundColor: "#e53935",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  padding: "8px 14px",
                  cursor: "pointer",
                }}
              >
                <SearchOutlined />
              </button>
            </form>

            {/* Tất cả */}
            <button
              onClick={() => { navigate("/products"); setMobileOpen(false); }}
              style={mobileItemStyle}
            >
              Tất cả sản phẩm
            </button>

            {/* Mobile categories */}
            {categories.map((cat) => (
              <div key={cat.categoryId}>
                <button
                  onClick={() => handleCategoryClick(cat.categoryId)}
                  style={{ ...mobileItemStyle, fontWeight: 600, color: "#111" }}
                >
                  {cat.categoryName}
                </button>
                {cat.children.map((child) => (
                  <button
                    key={child.categoryId}
                    onClick={() => handleCategoryClick(child.categoryId)}
                    style={{ ...mobileItemStyle, paddingLeft: 28, color: "#555", fontSize: 13 }}
                  >
                    — {child.categoryName}
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </nav>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 768px) {
          .navbar-desktop-links { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
      `}</style>
    </>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NavLink: React.FC<{ to: string; label: string }> = ({ to, label }) => (
  <Link
    to={to}
    style={{
      textDecoration: "none",
      padding: "8px 14px",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      color: "#333",
      transition: "background 0.15s",
      whiteSpace: "nowrap",
    }}
  >
    {label}
  </Link>
);

const iconBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  width: 38,
  height: 38,
  borderRadius: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#333",
  transition: "background 0.15s",
};

const dropdownItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "10px 20px",
  fontSize: 14,
  color: "#333",
  transition: "background 0.15s",
};

const mobileItemStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  textAlign: "left",
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: "10px 4px",
  fontSize: 14,
  color: "#333",
  borderBottom: "1px solid #f5f5f5",
};

export default Navbar;