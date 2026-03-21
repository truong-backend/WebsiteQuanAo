// src/pages/user/ShoppingGuidePage.tsx
import React from 'react';
import styles from './ShoppingGuidePage.module.scss';

// ─── Image URLs ────────────────────────────────────────────────
const IMG_STEP1 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuDHUlr4ttJyTamNB2dAIAjX_QAXQEPqKWlSJ7UzlDi8ZLOOAdvNe34O1H5ysaC3MpUzJnS6CWH0SrRxOGQKQLy5Vzi2bjJDpHa4oc3mrpdnoQtjyFka8tTlGD49Ez7-94Dg2Z6Wej_3zziaBmH9OpyfAhSaerIxWXONBKoTjqFybHengWVvCyBIsayHHO-6K85rehJF3QRpREQcyirU8XhEyps8dUxwW90-qAeX9waq6V4U-T2Cq79LT6emXeGjNpH2Fqtole5A0rg';
const IMG_STEP2 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuCfTnaLAgXtr3z83zdumoDpalImYvHIZDhdcqR2lYYkPlJS_MMYl75ZGEnzrejfdx0njsQp4l4PdtkxPFUQrwZouOwb26SK95cfzXNzXjuhgfhBpdgSz_whOfAop-PTDd80c1IiqQ8anUM09LJO1SlqramqVwLzy7RBhUz_HU8KLj_DJuZKtTdbD6sifRwcqabQbw9mwqZbAgUfO_LjLpfcMat6PiL59nTnU0LnY66fg2obyHwNnfdFaPFq3Cc49ZubTgEg-Wt6jmc';
const IMG_STEP3 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAsDufHO7ughSz_zoj3XtBaLmPrG3G1sP5Vv6_b0SzWcyhdhEooR79B9lBfVQbn9wu2P5R3rdIr_TRGPvdGNyPeffu9SLmBHiBIv5mTyGj_JWguNXVmOM9_af0biCLqvC5q_D8vEeL6dngOStHqyRedv_Mf-DzxjjwXP_M5bwAsmPV58ztMhBQNr5ZVz4u4bJX_LnVhITJ_pxSCzuUKgi_lfpOsKjspIO47fSvh34yjOMAcT9dQny70amWBY9GiYa3yn3zUjZXe0mI';
const IMG_STEP4 =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuBLPPNEdj1AO2ElK0AZI274iGQw4d3UM8jbo5yGr3OA9bYa_w5drK_sY3BpEDzucj3wAXfoqyb1SB3eepTXLTlgxPddpsBXI3VBOtxO5mam9ZZiDM0AvgV2ThHJHWqwXrT-DNMbE4qiGFRHWP1NVDMgkEkC4WGcMC15DocqVm4uBQU55oEQUo7-gBk7zNfrW-bcxcUMROkoyKBz3m1HByDuLzOrzfejuKL1abFNOQ1eF_SR1Xscttjh-ihIS6w9Zv8Ht68Nuu53_JI';
const IMG_CTA_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuANxYfjq1Q1R9gGzfbCvUBAizdFkx0n1Kvu3V6oid1n3sgGm77GXFov3fm6WD9AmhQ8ynl0wFt5ezru62loN4CMGBb5cyp-pbdYgo7ISGdK6N7iloeUCEMxi9XMKHNQbP2Y08PQzBkBsE3a6hX8MA6JNXaHzqg1aW9ymcaj7Q627-J5KtbQpzt6BmxI5bN-xAx5GfVnogUsjLs0l3U9YFYmN9fQbtrKJs77OnHdsFXyaWluRe-pycPg-xIuDkSA42bGXJEVjGDPlVg';

// ─── Data ──────────────────────────────────────────────────────
const TIPS = [
  {
    icon: 'straighten',
    title: 'Chọn size chuẩn',
    desc: 'Tham khảo bảng số đo chi tiết tại mỗi trang sản phẩm. Nếu còn phân vân, đội ngũ Atelier luôn sẵn sàng tư vấn.',
  },
  {
    icon: 'local_shipping',
    title: 'Theo dõi đơn hàng',
    desc: 'Truy cập vào tài khoản cá nhân để cập nhật thời gian thực về vị trí kiện hàng của bạn.',
  },
  {
    icon: 'eco',
    title: 'Bảo quản bền vững',
    desc: 'Mỗi sản phẩm đi kèm hướng dẫn chăm sóc chuyên sâu để giữ trọn vẻ đẹp qua năm tháng.',
  },
];

// ─── Component ─────────────────────────────────────────────────
const ShoppingGuidePage: React.FC = () => {
  return (
    <div className={styles.page}>

      {/* Hero */}
      <section className={styles.hero}>
        <h1>Hướng dẫn Mua hàng</h1>
        <p>
          Trải nghiệm mua sắm tại Atelier Monochrome được thiết kế để mang lại sự tĩnh lặng
          và tinh tế. Từng bước trong hành trình sở hữu những tạo tác thời trang đều được
          chúng tôi tối ưu hóa một cách liền mạch.
        </p>
      </section>

      {/* Steps */}
      <section className={styles.stepsSection}>
        <div className={styles.stepsInner}>
          <div className={styles.stepsGrid}>

            {/* Left column: Step 1 & 3 */}
            <div className={styles.stepsLeft}>
              <div className={styles.stepBlock}>
                <span className={styles.stepLabel}>Bước 01</span>
                <h2>Khám phá Bộ sưu tập</h2>
                <p>
                  Duyệt qua các danh mục được tuyển chọn. Mỗi bộ sưu tập tại Atelier Monochrome
                  là một câu chuyện về chất liệu và phom dáng tối giản.
                </p>
                <div className={`${styles.stepImage} ${styles.aspect45}`}>
                  <img src={IMG_STEP1} alt="Minimalist clothing rack" />
                </div>
              </div>

              <div className={`${styles.stepBlock} ${styles.indented}`}>
                <span className={styles.stepLabel}>Bước 03</span>
                <h2>Kiểm tra Giỏ hàng</h2>
                <p>
                  Xem lại các lựa chọn của bạn. Đảm bảo mọi chi tiết đều hoàn hảo trước khi
                  chúng tôi tiến hành chuẩn bị đóng gói thủ công.
                </p>
                <div className={`${styles.stepImage} ${styles.aspectSquare}`}>
                  <img src={IMG_STEP3} alt="Luxury packaging" />
                </div>
              </div>
            </div>

            {/* Right column: Step 2, 4, 5 */}
            <div className={styles.stepsRight}>
              <div className={`${styles.stepBlock} ${styles.autoRight}`}>
                <span className={styles.stepLabel}>Bước 02</span>
                <h2>Lựa chọn Sản phẩm</h2>
                <p>
                  Chọn kích cỡ phù hợp dựa trên bảng size chi tiết của chúng tôi. Thêm vào
                  túi đồ với sự tự tin về chất lượng bền vững.
                </p>
                <div className={`${styles.stepImage} ${styles.aspect1610}`}>
                  <img src={IMG_STEP2} alt="High quality fabric detail" />
                </div>
              </div>

              <div className={`${styles.stepBlock} ${styles.maxWidth}`}>
                <span className={styles.stepLabel}>Bước 04</span>
                <h2>Thanh toán An toàn</h2>
                <p>
                  Chúng tôi cung cấp các phương thức thanh toán bảo mật đa dạng. Nhập thông
                  tin vận chuyển để nhận tạo tác tại nhà.
                </p>
                <div className={`${styles.stepImage} ${styles.aspectSquare}`}>
                  <img src={IMG_STEP4} alt="Secure payment" />
                </div>
              </div>

              <div className={`${styles.stepBlock} ${styles.autoRight}`}>
                <span className={styles.stepLabel}>Bước 05</span>
                <h2>Xác nhận Đơn hàng</h2>
                <p>
                  Nhận mã theo dõi hành trình đơn hàng ngay sau khi thanh toán. Sản phẩm sẽ
                  sớm thuộc về bạn.
                </p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Tips */}
      <section className={styles.tipsSection}>
        <div className={styles.tipsInner}>
          <div className={styles.tipsHeader}>
            <h2>Lời khuyên cho sự Hoàn hảo</h2>
            <p>Đảm bảo mỗi món đồ bạn chọn đều mang lại sự hài lòng tuyệt đối.</p>
          </div>
          <div className={styles.tipsGrid}>
            {TIPS.map((tip) => (
              <div key={tip.title} className={styles.tipCard}>
                <span className={`material-symbols-outlined ${styles.tipIcon}`}>{tip.icon}</span>
                <h3>{tip.title}</h3>
                <p>{tip.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaInner}>
          <div
            className={styles.ctaBg}
            style={{ backgroundImage: `url('${IMG_CTA_BG}')` }}
          />
          <div className={styles.ctaContent}>
            <div className={styles.ctaText}>
              <h2>Cần hỗ trợ?</h2>
              <p>
                Đội ngũ chăm sóc khách hàng của chúng tôi luôn túc trực để giải đáp mọi
                thắc mắc về đơn hàng, chất liệu hoặc dịch vụ hậu mãi.
              </p>
            </div>
            <div className={styles.ctaButtons}>
              <button className={styles.ctaBtnPrimary}>
                <span>Liên hệ qua Email</span>
                <span className={`material-symbols-outlined ${styles.btnIcon}`}>arrow_forward</span>
              </button>
              <button className={styles.ctaBtnSecondary}>
                <span>Gọi Hotline</span>
                <span className={`material-symbols-outlined ${styles.btnIcon}`}>call</span>
              </button>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default ShoppingGuidePage;