// src/pages/user/ContactPage.tsx
import React, { useState } from 'react';
import PageLayout from '@/components/user/layout/PageLayout';
import styles from './ContactPage.module.scss';

// ─── Data ─────────────────────────────────────────────────────

const SOCIALS = [
  { label: 'Instagram', href: 'https://www.instagram.com/quyhacde/' },
  { label: 'YouTube',   href: 'https://www.youtube.com/@ThanhTruongNguyen-u1b' },
  { label: 'TikTok',    href: 'https://www.tiktok.com/@ng_thanh_truong' },
];

const LOCATIONS = [
  {
    city: 'Hồ Chí Minh',
    address: '123 Nguyễn Huệ, Quận 1\nTP. Hồ Chí Minh, Việt Nam',
    hours: [
      'Thứ 2 — Thứ 7: 09:00 - 20:00',
      'Chủ nhật: 10:00 - 18:00',
    ],
  },
  {
    city: 'Hà Nội',
    address: '45 Tràng Tiền, Hoàn Kiếm\nHà Nội, Việt Nam',
    hours: [
      'Thứ 2 — Thứ 7: 09:00 - 20:00',
      'Chủ nhật: Đóng cửa',
    ],
  },
  {
    city: 'Đà Nẵng',
    address: '88 Bạch Đằng, Hải Châu\nĐà Nẵng, Việt Nam',
    hours: [
      'Thứ 2 — Chủ nhật: 09:00 - 21:00',
    ],
  },
];

const MAP_BG =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuC0e-9qeY7IP2vss_j9ap38ffwAIDoIyHGnTxrvDZbBY5HPnGgGf2Jq18iuTHmMBZo4BQC2itYmFvqcr6MzWG-X8yP7jx4sfm0yzDr65jGC71KefVey_GntOG4y8QBWrFl2HvuQkvoVJic9AeT9oDcRbsBeqoTZnD-XYQCUduPC-H9vjMFMsN73uDCkVqJDQcj6Rz4t1Lo3GoVdbE5YnzxhOc6YmUHv0j6Uy8Ph8YsqXiaDvkww5w550ccs76PszFFELZtgNa5vbMw';

// ─── Component ────────────────────────────────────────────────

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '', email: '', subject: '', message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <PageLayout>
      <div className={styles.page}>

        {/* ── Hero ── */}
        <section className={styles.hero}>
          <div className={styles.hero__grid}>
            <div className={styles.hero__left}>
              <h1 className={styles.hero__title}>Liên hệ</h1>
              <p className={styles.hero__lead}>
                Các câu hỏi về sản phẩm, đơn hàng, hợp tác hoặc bộ sưu tập theo mùa.
                Chúng tôi luôn sẵn sàng lắng nghe bạn.
              </p>
            </div>

            <div className={styles.hero__right}>
              <p className={styles.hero__socialLabel}>Kênh mạng xã hội</p>
              <div className={styles.hero__socials}>
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.hero__socialLink}
                  >
                    {s.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Form + Image ── */}
        <section className={styles.formSection}>
          <div className={styles.formSection__grid}>

            {/* Form */}
            <form className={styles.form} onSubmit={handleSubmit}>
              <div className={styles.form__row}>
                <div className={styles.field}>
                  <label className={styles.label}>Họ và tên</label>
                  <input
                    className={styles.input}
                    type="text"
                    name="name"
                    placeholder="Nhập tên của bạn"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label}>Email</label>
                  <input
                    className={styles.input}
                    type="email"
                    name="email"
                    placeholder="example@domain.com"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Chủ đề</label>
                <input
                  className={styles.input}
                  type="text"
                  name="subject"
                  placeholder="Câu hỏi chung"
                  value={form.subject}
                  onChange={handleChange}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Nội dung</label>
                <textarea
                  className={styles.textarea}
                  name="message"
                  placeholder="Chúng tôi có thể giúp gì cho bạn?"
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  required
                />
              </div>

              <button
                type="submit"
                className={[
                  styles.submitBtn,
                  submitted ? styles['submitBtn--done'] : '',
                ].join(' ')}
              >
                {submitted ? '✓ Đã gửi thành công!' : 'Gửi tin nhắn'}
              </button>
            </form>

            {/* Brand image */}
            <div className={styles.brandImg}>
              <img
                className={styles.brandImg__photo}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwXouVkloXYxHVSReknb9lIxdVZ8wyN3-nGn1HwltKTERaCbR9lt-L5tTqik9QM4lVxrQJZhhZDwaTU6hYBi7RP2Jdh3ShEjmTfWQSgoN1z5mXXvxB3MfOS_n9QbT5t0-GWzfVnRTQQfaH172m1S7-hQrjxavYVJ-Ngj3WtwLu1lkLz2Ac1SeGWunHK7UspZLNhBTPBLLe4m2VYmwfxzN-L4Wp6U7IC1kGkmkV09HmLTm8lJxCIOSaj_S7y-VENDqW58trua_6rZE"
                alt="Minimalist atelier interior"
              />
            </div>
          </div>
        </section>

        {/* ── Locations ── */}
        <section className={styles.locations}>
          <div className={styles.locations__inner}>
            <div className={styles.locations__header}>
              <span className={styles.locations__eyebrow}>Hệ thống cửa hàng</span>
              <h2 className={styles.locations__title}>Showroom của chúng tôi</h2>
            </div>

            <div className={styles.locations__grid}>
              {LOCATIONS.map((loc) => (
                <div key={loc.city} className={styles.locationCard}>
                  <div className={styles.locationCard__line} />
                  <h3 className={styles.locationCard__city}>{loc.city}</h3>
                  <p className={styles.locationCard__address}>
                    {loc.address.split('\n').map((line, i) => (
                      <span key={i}>{line}{i < loc.address.split('\n').length - 1 && <br />}</span>
                    ))}
                  </p>
                  <div className={styles.locationCard__hours}>
                    <p className={styles.locationCard__hoursLabel}>Giờ mở cửa</p>
                    {loc.hours.map((h) => (
                      <p key={h} className={styles.locationCard__hoursRow}>{h}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Map ── */}
        <section className={styles.mapSection}>
          <div
            className={styles.mapSection__bg}
            style={{ backgroundImage: `url('${MAP_BG}')` }}
          />
          <div className={styles.mapSection__overlay}>
            <div className={styles.mapSection__chip}>
              <span>Khám phá hệ thống cửa hàng</span>
            </div>
          </div>
        </section>

      </div>
    </PageLayout>
  );
};

export default ContactPage;