// src/pages/User/Contact/ContactPage.tsx
import React, { useState } from "react";
import styles from "./ContactPage.module.scss";
import PageLayout from "../../../Components/User/layout/PageLayout/PageLayout";

const SOCIALS = [
  {
    name: "Instagram",
    handle: "@quyhacde",
    href: "https://www.instagram.com/quyhacde/",
  },
  {
    name: "YouTube",
    handle: "@ThanhTruongNguyen",
    href: "https://www.youtube.com/@ThanhTruongNguyen-u1b",
  },
  {
    name: "TikTok",
    handle: "@ng_thanh_truong",
    href: "https://www.tiktok.com/@ng_thanh_truong",
  },
  { name: "Facebook", handle: "ShopVN", href: "https://www.facebook.com/" },
];

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: "", email: "", message: "" });
    }, 3000);
  };

  return (
    <PageLayout>
      <div className={styles.page}>
        <div className={styles.container}>
          {/* Tiêu đề */}
          <header className={styles.header}>
            <h1 className={styles.title}>Liên Hệ</h1>
            <p className={styles.subtitle}>
              Chúng tôi luôn sẵn sàng lắng nghe bạn. Hãy để lại thông tin và
              chúng tôi sẽ phản hồi sớm nhất.
            </p>
          </header>

          {/* 2 cột */}
          <div className={styles.grid}>
            {/* Trái: Thông tin + Social */}
            <aside className={styles.left}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Thông tin</h2>
                <p className={styles.text}>📍 Địa chỉ: HCM, Việt Nam</p>
                <p className={styles.text}>📞 SĐT: 098 190 7754</p>
                <p className={styles.text}>📧 Email: honguyententhanhtruong@gmail.com</p>
              </section>

              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Theo dõi chúng tôi</h2>
                <ul className={styles.list}>
                  {SOCIALS.map((s) => (
                    <li key={s.name}>
                      <a
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.socialLink}
                      >
                        ✓ {s.name} — {s.handle}
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            </aside>

            {/* Phải: Form */}
            <main className={styles.right}>
              <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Gửi liên hệ</h2>
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.field}>
                    <label className={styles.label}>Tên của bạn</label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Nhập tên..."
                      value={form.name}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email</label>
                    <input
                      type="email"
                      name="email"
                      placeholder="email@example.com"
                      value={form.email}
                      onChange={handleChange}
                      required
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Nội dung</label>
                    <textarea
                      name="message"
                      placeholder="Bạn muốn nói gì với chúng tôi..."
                      value={form.message}
                      onChange={handleChange}
                      required
                      className={styles.textarea}
                    />
                  </div>
                  <button
                    type="submit"
                    className={`${styles.btn} ${submitted ? styles.btnDone : ""}`}
                  >
                    {submitted ? "✓ Đã gửi thành công!" : "Gửi liên hệ"}
                  </button>
                </form>
              </section>
            </main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
