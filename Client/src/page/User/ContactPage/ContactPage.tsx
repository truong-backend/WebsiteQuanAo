// src/pages/User/Contact/ContactPage.tsx
import React, { useState } from "react";
import styles from "./ContactPage.module.scss";

const ContactPage: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    message: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Gửi liên hệ:", form);
    alert("Gửi thành công!");
    setForm({ name: "", email: "", message: "" });
  };

  return (
    <div className={styles.container}>
      <h1>Liên Hệ</h1>

      <div className={styles.wrapper}>
        {/* Info */}
        <div className={styles.info}>
          <h3>Thông tin</h3>
          <p>📍 Địa chỉ: Hà Nội, Việt Nam</p>
          <p>📞 SĐT: 0123 456 789</p>
          <p>📧 Email: support@shopvn.com</p>
        </div>

        {/* Form */}
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Tên của bạn"
            value={form.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />

          <textarea
            name="message"
            placeholder="Nội dung..."
            value={form.message}
            onChange={handleChange}
            required
          />

          <button type="submit">Gửi liên hệ</button>
        </form>
      </div>
    </div>
  );
};

export default ContactPage;