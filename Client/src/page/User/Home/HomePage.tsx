// src/pages/Home/HomePage.tsx
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../../Components/User/Header/Header";
import Footer from "../../../Components/User/Footer/Footer";
import styles from "./HomePage.module.scss";

// ─── Ticker ───────────────────────────────────────────────────────────────────

const TICKER_ITEMS = [
  "THỜI TRANG", "PHONG CÁCH", "CHẤT LƯỢNG",
  "ĐỘC ĐÁO", "HIỆN ĐẠI", "FASHION", "STYLE", "TRENDY",
];

interface TickerRowProps {
  reverse?: boolean;
  outlined?: boolean;
}

const TickerRow: React.FC<TickerRowProps> = ({ reverse = false, outlined = false }) => {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className={styles.tickerRow}>
      <div
        className={[
          styles.tickerTrack,
          reverse ? styles["tickerTrack--reverse"] : styles["tickerTrack--forward"],
        ].join(" ")}
      >
        {items.map((item, i) => (
          <span
            key={i}
            className={[
              styles.tickerItem,
              outlined ? styles["tickerItem--outlined"] : "",
            ].join(" ")}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

// ─── CSS 3D Sphere ───────────────────────────────────────────────────────────

const CssSphere: React.FC = () => (
  <div className={styles.sphereWrap}>
    {/* Outer glow ring */}
    <div className={styles.sphereGlow} />
    {/* Main sphere body */}
    <div className={styles.sphere}>
      {/* Layered gradient rings for depth */}
      <div className={styles.sphereRing} />
      <div className={`${styles.sphereRing} ${styles["sphereRing--2"]}`} />
      <div className={`${styles.sphereRing} ${styles["sphereRing--3"]}`} />
      <div className={`${styles.sphereRing} ${styles["sphereRing--4"]}`} />
      {/* Highlight */}
      <div className={styles.sphereHighlight} />
      {/* Inner shine */}
      <div className={styles.sphereShine} />
    </div>
    {/* Shadow beneath */}
    <div className={styles.sphereShadow} />
  </div>
);

// ─── Step Card ────────────────────────────────────────────────────────────────

interface StepCardProps {
  num: string;
  title: string;
  desc: string;
  accent?: boolean;
}

const StepCard: React.FC<StepCardProps> = ({ num, title, desc, accent }) => (
  <div className={[styles.stepCard, accent ? styles["stepCard--accent"] : ""].join(" ")}>
    <div className={styles.stepCard__num}>
      {num}
      <span className={styles["stepCard__buoc"]}>Bước</span>
    </div>
    <h3 className={styles.stepCard__title}>{title}</h3>
    <p className={styles.stepCard__desc}>{desc}</p>
  </div>
);

// ─── Stat Badge ───────────────────────────────────────────────────────────────

const StatBadge: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className={styles.statBadge}>
    <div className={styles.statBadge__value}>{value}</div>
    <div className={styles.statBadge__label}>{label}</div>
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [heroReady, setHeroReady] = useState(false);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setHeroReady(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={styles.page}>
      <Header />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className={styles.hero} ref={heroRef}>

        {/* Background X watermark like Fclick */}
        <div className={styles.hero__watermark} aria-hidden>✕</div>

        {/* Floating dot */}
        <div className={styles.hero__dot} />

        {/* ── Left content ──────────────────────────────────────────── */}
        <div
          className={styles.hero__left}
          style={{
            opacity: heroReady ? 1 : 0,
            transform: heroReady ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 0.7s ease, transform 0.7s ease",
          }}
        >
          <p className={styles.hero__eyebrow}>
            Hãy làm quen <span className={styles.hero__dots}>● ● ●</span>
          </p>
          <h2 className={styles.hero__subhead}>Những Bộ Trang Phục Tuyệt Vời</h2>
          <h1 className={styles.hero__bigText} aria-hidden>
            <span>DẪN ĐẦU</span>
            <span>XU HƯỚNG</span>
          </h1>
        </div>


        {/* Ticker */}
        <div className={styles.tickerWrap}>
          <TickerRow />
          <TickerRow reverse outlined />
        </div>
      </section>

      {/* ── ABOUT ─────────────────────────────────────────────────────── */}
      <section className={styles.about}>
        <div className={styles.about__bg} aria-hidden>SHOPVN</div>
        <div className={styles.about__inner}>
          <div>
            <p className={styles.about__eyebrow}>Về Chúng Tôi</p>
            <h2 className={styles.about__title}>
              Những Bộ Trang Phục<br />
              <em>Đỉnh Cao Phong Cách</em>
            </h2>
            <p className={styles.about__text}>
              ShopVN mang đến hàng ngàn sản phẩm thời trang được tuyển chọn kỹ lưỡng
              — từ các thương hiệu trong nước đến quốc tế, với cam kết chất lượng
              và phong cách dẫn đầu xu hướng.
            </p>
          </div>
          <div className={styles.about__stats}>
            <StatBadge value="+5K"  label="Sản phẩm" />
            <StatBadge value="+50K" label="Khách hàng" />
            <StatBadge value="4.9★" label="Đánh giá" />
          </div>
        </div>
      </section>

      {/* ── STEPS ─────────────────────────────────────────────────────── */}
      <section className={styles.steps}>
        <div className={styles.steps__inner}>
          <div className={styles.steps__header}>
            <div>
              <p className={styles.steps__eyebrow}>Mua Sắm Dễ Dàng</p>
              <h2 className={styles.steps__title}>
                Trải Nghiệm Mua Sắm<br />Hoàn Hảo Của Bạn
              </h2>
            </div>
            <div className={styles.steps__countWrap} aria-hidden>
              <span className={styles.steps__countNum}>04</span>
              <span className={styles.steps__countLabel}>Bước</span>
            </div>
          </div>

          <div className={styles.steps__grid}>
            <StepCard
              num="01" title="Khám phá sản phẩm"
              desc="Lướt qua hàng ngàn sản phẩm thời trang được phân loại rõ ràng, dễ dàng lọc theo danh mục, giá cả và xu hướng."
            />
            <StepCard
              num="02" title="Chọn đúng phong cách"
              desc="Chọn màu sắc, kích thước và xem trước sản phẩm với hình ảnh chi tiết nhiều góc độ để đảm bảo bạn hài lòng."
            />
            <StepCard
              num="03" title="Thanh toán an toàn"
              desc="Thanh toán qua COD, VNPAY hoặc MoMo — mọi giao dịch đều được bảo mật tuyệt đối."
              accent
            />
            <StepCard
              num="04" title="Nhận hàng tận nơi"
              desc="Giao hàng nhanh toàn quốc. Theo dõi đơn hàng realtime và hỗ trợ đổi trả 30 ngày không điều kiện."
            />
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className={styles.cta}>
        <div className={styles.cta__bgText} aria-hidden>
          {["FASHION", "STYLE", "TREND"].map((w, i) => (
            <span
              key={w}
              className={styles.cta__bgWord}
              style={{ top: `${20 + i * 30}%`, left: `${-5 + i * 30}%` }}
            >
              {w}
            </span>
          ))}
        </div>
        <div className={styles.cta__inner}>
          <p className={styles.cta__eyebrow}>Sẵn sàng chưa?</p>
          <h2 className={styles.cta__title}>
            Mặc Đẹp Hơn.<br />
            <span>Sống Chất Hơn.</span>
          </h2>
          <p className={styles.cta__desc}>
            Hơn 50.000 khách hàng đã tin tưởng ShopVN. Tham gia ngay để nhận
            ưu đãi đặc biệt dành cho thành viên mới.
          </p>
          <button
            className={`${styles.btnPrimary} ${styles["btnPrimary--lg"]}`}
            onClick={() => navigate("/products")}
          >
            Mua Sắm Ngay →
          </button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;