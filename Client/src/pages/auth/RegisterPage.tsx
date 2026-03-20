// src/pages/auth/RegisterPage.tsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "@/modules";
import type { RegisterRequest } from "@/types";
import styles from "./RegisterPage.module.scss";

type Fields = RegisterRequest & { confirmPassword: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues] = useState<Fields>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [showCp, setShowCp] = useState(false);

  const set = (k: keyof Fields, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => {
      const n = { ...p };
      delete n[k];
      return n;
    });
  };

  const validate = () => {
    const e: FieldErrors = {};
    if (!values.name || values.name.length < 2)
      e.name = "Họ và tên phải có ít nhất 2 ký tự!";
    if (!values.email) e.email = "Vui lòng nhập email!";
    else if (!/\S+@\S+\.\S+/.test(values.email))
      e.email = "Email không hợp lệ!";
    if (!values.password || values.password.length < 6)
      e.password = "Mật khẩu phải có ít nhất 6 ký tự!";
    if (values.confirmPassword !== values.password)
      e.confirmPassword = "Mật khẩu xác nhận không khớp!";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError("");
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      navigate("/login");
    } catch (err) {
      setApiError(err instanceof Error ? err.message : "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logo__name}>
            SHOP<span>VN</span>
          </div>
          <div className={styles.logo__sub}>Tạo tài khoản mới</div>
        </div>

        {apiError && <div className={styles.errorBox}>{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          {(["name", "email"] as const).map((field) => (
            <div key={field} className={styles.field}>
              <label className={styles.label}>
                {field === "name" ? "Họ và tên" : "Email"}
              </label>
              <div className={styles.inputWrap}>
                <span className={styles.inputIcon}>
                  {field === "name" ? "👤" : "✉"}
                </span>
                <input
                  type={field === "email" ? "email" : "text"}
                  placeholder={
                    field === "name" ? "Nguyễn Văn A" : "example@email.com"
                  }
                  value={values[field]}
                  onChange={(e) => set(field, e.target.value)}
                  disabled={loading}
                />
              </div>
              {errors[field] && (
                <span className={styles.fieldError}>{errors[field]}</span>
              )}
            </div>
          ))}

          {(["password", "confirmPassword"] as const).map((field) => {
            const show = field === "password" ? showPw : showCp;
            const toggle =
              field === "password"
                ? () => setShowPw((p) => !p)
                : () => setShowCp((p) => !p);
            return (
              <div key={field} className={styles.field}>
                <label className={styles.label}>
                  {field === "password" ? "Mật khẩu" : "Xác nhận mật khẩu"}
                </label>
                <div className={styles.inputWrap}>
                  <span className={styles.inputIcon}>🔒</span>
                  <input
                    type={show ? "text" : "password"}
                    placeholder={
                      field === "password"
                        ? "Nhập mật khẩu"
                        : "Nhập lại mật khẩu"
                    }
                    value={values[field]}
                    onChange={(e) => set(field, e.target.value)}
                    disabled={loading}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    className={styles.pwToggle}
                    onClick={toggle}
                  >
                    {show ? "🙈" : "👁"}
                  </button>
                </div>
                {errors[field] && (
                  <span className={styles.fieldError}>{errors[field]}</span>
                )}
              </div>
            );
          })}

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? (
              <>
                <div className={styles.btnSpinner} />
                Đang đăng ký...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <p className={styles.footer}>
          Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
