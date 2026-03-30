// src/pages/ContactPage.tsx
// Moved from: src/pages/user/ContactPage.tsx
// Changed imports: @/modules → @/features/admin/services/contactService
// Lý do: ContactService.submit() là public API, dùng chung với admin feature
import React, { useState } from "react";
import PageLayout from "@/layouts/user/PageLayout";
import { ContactService } from "@/features/admin/services/contactService";
import type { ContactCreateRequest } from "@/features/admin/types/contact.types";
import styles from "./ContactPage.module.scss";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/quyhacde/" },
  { label: "YouTube", href: "https://www.youtube.com/@ThanhTruongNguyen-u1b" },
  { label: "TikTok", href: "https://www.tiktok.com/@ng_thanh_truong" },
];

const INITIAL_FORM: ContactCreateRequest = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

const ContactPage: React.FC = () => {
  const [form, setForm] = useState<ContactCreateRequest>(INITIAL_FORM);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Flow ────────────────────────────────────────────────────
  // 1. User điền form → handleChange cập nhật state
  // 2. handleSubmit → gọi ContactService.submit(form)
  //    Request: POST /contacts { name, email, subject, message }
  //    Response: ContactResponse
  // 3. Thành công → setSubmitted(true) → reset form → tự ẩn sau 4s
  // 4. Thất bại  → hiện error message

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setError(null);
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await ContactService.submit(form);
      setSubmitted(true);
      setForm(INITIAL_FORM);
      setTimeout(() => setSubmitted(false), 4000);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Có lỗi xảy ra. Vui lòng thử lại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className={styles.page}>
        {/* Hero */}
        <section className={styles.hero}>
          <div className={styles.hero__grid}>
            <div className={styles.hero__left}>
              <h1 className={styles.hero__title}>Liên hệ</h1>
              <p className={styles.hero__lead}>
                Các câu hỏi về sản phẩm, đơn hàng, hợp tác hoặc bộ sưu tập theo
                mùa. Chúng tôi luôn sẵn sàng lắng nghe bạn.
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

        {/* Form + Image */}
        <section className={styles.formSection}>
          <div className={styles.formSection__grid}>
            <form className={styles.form} onSubmit={handleSubmit} noValidate>
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
                    disabled={loading}
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
                    disabled={loading}
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
                  value={form.subject ?? ""}
                  onChange={handleChange}
                  disabled={loading}
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
                  disabled={loading}
                  required
                />
              </div>

              {error && <p className={styles.errorMsg}>{error}</p>}

              <button
                type="submit"
                disabled={loading || submitted}
                className={[
                  styles.submitBtn,
                  submitted ? styles["submitBtn--done"] : "",
                  loading ? styles["submitBtn--loading"] : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {submitted
                  ? "✓ Đã gửi thành công!"
                  : loading
                    ? "Đang gửi..."
                    : "Gửi tin nhắn"}
              </button>
            </form>

            <div className={styles.brandImg}>
              <img
                className={styles.brandImg__photo}
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDwXouVkloXYxHVSReknb9lIxdVZ8wyN3-nGn1HwltKTERaCbR9lt-L5tTqik9QM4lVxrQJZhhZDwaTU6hYBi7RP2Jdh3ShEjmTfWQSgoN1z5mXXvxB3MfOS_n9QbT5t0-GWzfVnRTQQfaH172m1S7-hQrjxavYVJ-Ngj3WtwLu1lkLz2Ac1SeGWunHK7UspZLNhBTPBLLe4m2VYmwfxzN-L4Wp6U7IC1kGkmkV09HmLTm8lJxCIOSaj_S7y-VENDqW58trua_6rZE"
                alt="Minimalist atelier interior"
              />
            </div>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

export default ContactPage;
