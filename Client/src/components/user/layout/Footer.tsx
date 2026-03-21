// src/components/user/layout/Footer.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Footer.module.scss';

// ─── Constants ────────────────────────────────────────────────

const STRIP_ITEMS = [
  'Miễn phí vận chuyển đơn từ 499K', 'Đổi trả 30 ngày', 'Thanh toán bảo mật',
  'Hỗ trợ 24/7', 'Hàng chính hãng 100%', 'Giao hàng toàn quốc',
];

const NAV_LINKS: Record<string, { label: string; to: string }[]> = {
  'Khám phá': [
    { label: 'Tất cả sản phẩm', to: '/products' },
    { label: 'Hàng mới về',     to: '/products?sort=new' },
    { label: 'Bán chạy nhất',   to: '/products?sort=popular' },
    { label: 'Ưu đãi hôm nay',  to: '/products?sale=true' },
  ],
  'Hỗ trợ': [
    { label: 'Chính sách đổi trả',  to: '/return-policy' },
    { label: 'Hướng dẫn mua hàng', to: '/shopping-guide' },
    { label: 'Tra cứu đơn hàng',   to: '/order-tracking' },
    { label: 'Liên hệ',            to: '/contact' },
  ],
  'Tài khoản': [
    { label: 'Đăng nhập',        to: '/login' },
    { label: 'Đăng ký',          to: '/register' },
    { label: 'Trang cá nhân',    to: '/profile' },
    { label: 'Lịch sử đơn hàng', to: '/orders' },
  ],
};

const SOCIALS = [
  { key: 'f',  label: 'F',  href: 'https://www.facebook.com/thanhtruong2k3/' },
  { key: 'ig', label: 'IG', href: 'https://www.instagram.com/quyhacde/' },
  { key: 'yt', label: 'YT', href: 'https://www.youtube.com/@ThanhTruongNguyen-u1b' },
  { key: 'tt', label: 'TK', href: 'https://www.tiktok.com/@ng_thanh_truong' },
];

// ─── Component ────────────────────────────────────────────────

const Footer: React.FC = () => {
  const navigate = useNavigate();
  // Duplicate for seamless marquee loop
  const stripItems = [...STRIP_ITEMS, ...STRIP_ITEMS];

  return (
    <footer className={styles.footer}>
      {/* Scrolling strip */}
      <div className={styles.strip}>
        <div className={styles.strip__track}>
          {stripItems.map((item, i) => (
            <span key={i} className={styles.strip__item}>{item}</span>
          ))}
        </div>
        {/* Duplicate track for seamless loop */}
        <div className={styles.strip__track} aria-hidden>
          {stripItems.map((item, i) => (
            <span key={`dup-${i}`} className={styles.strip__item}>{item}</span>
          ))}
        </div>
      </div>

      {/* Main grid */}
      <div className={styles.main}>
        {/* Brand column */}
        <div className={styles.brand}>
          <a href="/" className={styles.brand__logo}>
            SHOP<span>VN</span>
          </a>
          <p className={styles.brand__desc}>
            Thời trang phong cách — chất lượng vượt trội. Chúng tôi tuyển chọn hàng ngàn sản phẩm
            từ các thương hiệu uy tín để mang đến trải nghiệm mua sắm tốt nhất.
          </p>
          <div className={styles.brand__socials}>
            {SOCIALS.map((s) => (
              <a
                key={s.key}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.brand__socialBtn}
                title={s.key.toUpperCase()}
              >
                {s.label}
              </a>
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

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <div className={styles.bottom__inner}>
          <p className={styles.bottom__copy}>
            © {new Date().getFullYear()}{' '}
            <span className={styles.bottom__highlight}>ShopVN</span>.
            {' '}All rights reserved.
          </p>
          <div className={styles.bottom__badges}>
            {['VNPAY', 'MoMo', 'COD', 'SSL'].map((b) => (
              <span key={b} className={styles.bottom__badge}>{b}</span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;