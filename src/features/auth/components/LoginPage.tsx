// src/features/auth/components/LoginPage.tsx
// Moved from: src/pages/auth/LoginPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import type { LoginRequest } from '../types/auth.types';
import styles from './LoginPage.module.scss';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues]     = useState<LoginRequest>({ email: '', password: '' });
  const [errors, setErrors]     = useState<Partial<LoginRequest>>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);

  const set = (k: keyof LoginRequest, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: Partial<LoginRequest> = {};
    if (!values.email) e.email = 'Vui lòng nhập email!';
    else if (!/\S+@\S+\.\S+/.test(values.email)) e.email = 'Email không hợp lệ!';
    if (!values.password) e.password = 'Vui lòng nhập mật khẩu!';
    else if (values.password.length < 6) e.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.login(values);
      navigate(authService.isAdmin() ? '/admin/dashboard' : '/products');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đăng nhập thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logo__name}>SHOP<span>VN</span></div>
          <div className={styles.logo__sub}>Đăng nhập để tiếp tục</div>
        </div>

        {apiError && <div className={styles.errorBox}>{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>✉</span>
              <input type="email" placeholder="example@email.com"
                value={values.email} onChange={(e) => set('email', e.target.value)} disabled={loading} />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mật khẩu</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input type={showPw ? 'text' : 'password'} placeholder="Nhập mật khẩu"
                value={values.password} onChange={(e) => set('password', e.target.value)}
                disabled={loading} style={{ paddingRight: 40 }} />
              <button type="button" className={styles.pwToggle} onClick={() => setShowPw((p) => !p)}>
                {showPw ? '🙈' : '👁'}
              </button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><div className={styles.btnSpinner} />Đang đăng nhập...</> : 'Đăng nhập'}
          </button>
        </form>

        <p className={styles.footer}>
          Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
