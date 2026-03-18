// src/Components/User/Footer/Footer.tsx
import { useNavigate } from "react-router-dom";
import styles from "./Footer.module.scss";

// ─── Data ─────────────────────────────────────────────────────────────────────

const STRIP_ITEMS = [
  "Miễn phí vận chuyển đơn từ 499K",
  "Đổi trả 30 ngày",
  "Thanh toán bảo mật",
  "Hỗ trợ 24/7",
  "Hàng chính hãng 100%",
  "Giao hàng toàn quốc",
];

const NAV_LINKS = {
  "Khám phá": [
    { label: "Tất cả sản phẩm", to: "/products" },
    { label: "Hàng mới về",     to: "/products?sort=new" },
    { label: "Bán chạy nhất",   to: "/products?sort=popular" },
    { label: "Ưu đãi hôm nay",  to: "/products?sale=true" },
  ],
  "Hỗ trợ": [
    { label: "Chính sách đổi trả", to: "#" },
    { label: "Hướng dẫn mua hàng", to: "#" },
    { label: "Tra cứu đơn hàng",   to: "/orders" },
    { label: "Liên hệ",            to: "#" },
  ],
  "Tài khoản": [
    { label: "Đăng nhập",        to: "/login" },
    { label: "Đăng ký",          to: "/register" },
    { label: "Trang cá nhân",    to: "/profile" },
    { label: "Lịch sử đơn hàng", to: "/orders" },
  ],
};

const SOCIALS = ["f", "ig", "yt", "tt"] as const;
const SOCIAL_LABELS: Record<string, string> = {
  f: "F", ig: "IG", yt: "YT", tt: "TK",
};

// ─── Component ────────────────────────────────────────────────────────────────

const Footer: React.FC = () => {
  const navigate = useNavigate();

  // Duplicate strip items for seamless loop
  const stripItems = [...STRIP_ITEMS, ...STRIP_ITEMS];

  return (
    <footer className={styles.footer}>

      {/* ── Scrolling strip ─────────────────────────────────────────── */}
      <div className={styles.strip}>
        <div className={styles.strip__track}>
          {stripItems.map((item, i) => (
            <span key={i} className={styles.strip__item}>{item}</span>
          ))}
        </div>
        <div className={styles.strip__track} aria-hidden>
          {stripItems.map((item, i) => (
            <span key={`dup-${i}`} className={styles.strip__item}>{item}</span>
          ))}
        </div>
      </div>

      {/* ── Main grid ───────────────────────────────────────────────── */}
      <div className={styles.main}>

        {/* Brand */}
        <div className={styles.brand}>
          <a href="/" className={styles.brand__logo}>
            SHOP<span>VN</span>
          </a>
          <p className={styles.brand__desc}>
            Thời trang phong cách — chất lượng vượt trội. Chúng tôi tuyển chọn
            hàng ngàn sản phẩm từ các thương hiệu uy tín trong và ngoài nước để
            mang đến cho bạn trải nghiệm mua sắm tốt nhất.
          </p>
          <div className={styles.brand__socials}>
            {SOCIALS.map((s) => (
              <button key={s} className={styles.brand__socialBtn} title={s.toUpperCase()}>
                {SOCIAL_LABELS[s]}
              </button>
            ))}
          </div>
        </div>

        {/* Nav columns */}
        {Object.entries(NAV_LINKS).map(([heading, links]) => (
          <div key={heading} className={styles.col}>
            <p className={styles.col__heading}>{heading}</p>
            <ul className={styles.col__list}>
              {links.map(({ label, to }) => (
                <li key={label}>
                  <button
                    className={styles.col__link}
                    onClick={() => navigate(to)}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────── */}
      <div className={styles.bottom}>
        <div className={styles.bottom__inner}>
          <p className={styles.bottom__copy}>
            © {new Date().getFullYear()}{" "}
            <span className={styles.bottom__highlight}>ShopVN</span>. All rights reserved.
          </p>
          <div className={styles.bottom__badges}>
            {["VNPAY", "MoMo", "COD", "SSL"].map((b) => (
              <span key={b} className={styles.bottom__badge}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;