// src/pages/user/ReturnPolicyPage.tsx
import React from 'react';
import styles from './ReturnPolicyPage.module.scss';

const EXCLUSIONS_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuB1AMMokBHXnRA4e8XCarXTz4oG0y-bhHVfjx0eM_S9AcZTt84LGkHv4-ZND9Y85BXOfq-KG1QBRPeE4WTZG1TVHJv5y2HxtuZVhqxOYIG2RaEt0n6k6sF8sCocxhdH-6LBBuMQTy7GXF_wTqZFM20YNx79uxu3LUhdagiNlhsH6KhK3gp-AjTgp_BF_JG2SCLzdO7SfFgNktxrjVpeX0-KqscVSLy-dvI-nzoNcpTEPuBU_OUcjX-ZGkK6V1RWJVPya9cTzMgXShU';

const conditions = [
  {
    title: 'Trạng thái Nguyên bản',
    desc: 'Sản phẩm chưa qua sử dụng, chưa giặt ủi và không có mùi lạ.',
  },
  {
    title: 'Nhãn mác & Bao bì',
    desc: 'Còn đầy đủ tem mác niêm phong và hộp đựng nguyên vẹn của thương hiệu.',
  },
  {
    title: 'Hóa đơn mua hàng',
    desc: 'Kèm theo hóa đơn điện tử hoặc biên lai mua hàng gốc.',
  },
];

const steps = [
  {
    label: 'Gửi yêu cầu',
    desc: 'Truy cập cổng thông tin đổi trả trên website hoặc gửi email trực tiếp cho đội ngũ chăm sóc khách hàng của chúng tôi kèm mã đơn hàng.',
  },
  {
    label: 'Xác nhận đơn hàng',
    desc: 'Trong vòng 24 giờ làm việc, chúng tôi sẽ kiểm tra thông tin và gửi hướng dẫn chi tiết qua email của quý khách.',
  },
  {
    label: 'Vận chuyển',
    desc: 'Đóng gói sản phẩm cẩn thận và gửi về kho trung tâm của ATELIER theo địa chỉ được cung cấp.',
  },
  {
    label: 'Hoàn tất xử lý',
    desc: 'Sau khi kiểm định chất lượng, chúng tôi sẽ tiến hành đổi sản phẩm mới hoặc hoàn tiền trong vòng 5–7 ngày làm việc.',
  },
];

const exclusions = [
  'Sản phẩm thiết kế riêng (Custom-made)',
  'Hàng trong chương trình giảm giá cuối (Final Sale)',
  'Phụ kiện trang sức & Nội y',
];

const ReturnPolicyPage: React.FC = () => {
  return (
    <div className={styles.page}>
      {/* Hero */}
      <header className={styles.hero}>
        <h1>Chính sách Đổi trả & Hoàn tiền</h1>
        <p>
          Tại ATELIER, chúng tôi tôn vinh sự tinh xảo trong từng đường kim mũi
          chỉ và cam kết mang lại sự hài lòng tuyệt đối cho quý khách. Mỗi món
          đồ không chỉ là trang phục, mà là một trải nghiệm nghệ thuật trọn vẹn.
        </p>
      </header>

      {/* Main Grid */}
      <div className={styles.mainGrid}>
        {/* Left */}
        <div className={styles.leftColumn}>
          {/* Timeline Card */}
          <section className={styles.timelineCard}>
            <div className={styles.cardHeader}>
              <span className={`material-symbols-outlined ${styles.icon}`}>
                history
              </span>
              <h2>Thời gian quy định</h2>
            </div>
            <p>
              Quý khách có <strong>30 ngày</strong> kể từ ngày nhận được sản
              phẩm để thực hiện yêu cầu đổi trả.
            </p>
            <div className={styles.divider} />
            <p className={styles.subLabel}>Tính từ ngày giao hàng thành công</p>
          </section>

          {/* Conditions */}
          <section className={styles.conditionsSection}>
            <h2>Điều kiện chấp nhận</h2>
            <ul className={styles.conditionsList}>
              {conditions.map((c) => (
                <li key={c.title} className={styles.conditionItem}>
                  <span className={`material-symbols-outlined ${styles.checkIcon}`}>
                    check_circle
                  </span>
                  <div>
                    <p className={styles.conditionTitle}>{c.title}</p>
                    <p className={styles.conditionDesc}>{c.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* Right — Process */}
        <div className={styles.processCard}>
          <h2>Quy trình thực hiện</h2>
          <div className={styles.stepsContainer}>
            {steps.map((s, i) => (
              <div key={s.label} className={styles.step}>
                <div className={styles.stepNumberWrapper}>
                  <div className={styles.stepNumber}>{i + 1}</div>
                </div>
                <div className={styles.stepContent}>
                  <h3>{s.label}</h3>
                  <p>{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Exclusions */}
      <section className={styles.exclusionsSection}>
        <div className={styles.exclusionsContent}>
          <h2>Trường hợp ngoại lệ</h2>
          <p className={styles.exclusionsLead}>
            Để đảm bảo tính độc bản và vệ sinh, một số sản phẩm sẽ không được
            áp dụng chính sách đổi trả thông thường.
          </p>
          <div className={styles.exclusionsList}>
            {exclusions.map((item) => (
              <div key={item} className={styles.exclusionItem}>
                <span className={`material-symbols-outlined ${styles.closeIcon}`}>
                  close
                </span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.exclusionsImage}>
          <img
            src={EXCLUSIONS_IMAGE}
            alt="Minimalist atelier interior"
          />
        </div>
      </section>

      {/* Contact */}
      <section className={styles.contactSection}>
        <h2>Cần sự hỗ trợ?</h2>
        <p>Đội ngũ của chúng tôi luôn sẵn sàng lắng nghe và giải đáp mọi thắc mắc.</p>
        <div className={styles.contactGrid}>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Email</span>
            <a href="mailto:care@atelier.com">care@atelier.com</a>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Hotline</span>
            <a href="tel:+8419001234">+84 1900 1234</a>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Thời gian</span>
            <p>09:00 — 21:00 Daily</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ReturnPolicyPage;