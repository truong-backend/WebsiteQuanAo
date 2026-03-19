// src/pages/auth/RegisterPage.tsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../../Service/AuthService';
import type { RegisterRequest } from '../../../type/authcation/RegisterRequest';
import styles from './RegisterPage.module.scss';

type Fields = RegisterRequest & { confirmPassword: string };
type FieldErrors = Partial<Record<keyof Fields, string>>;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [values, setValues]     = useState<Fields>({ name: '', email: '', password: '', confirmPassword: ''});
  const [errors, setErrors]     = useState<FieldErrors>({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [showCp, setShowCp]     = useState(false);

  const set = (k: keyof Fields, v: string) => {
    setValues((p) => ({ ...p, [k]: v }));
    setErrors((p) => { const n = { ...p }; delete n[k]; return n; });
  };

  const validate = () => {
    const e: FieldErrors = {};
    if (!values.name || values.name.length < 2)          e.name            = 'Họ và tên phải có ít nhất 2 ký tự!';
    if (!values.email)                                    e.email           = 'Vui lòng nhập email!';
    else if (!/\S+@\S+\.\S+/.test(values.email))         e.email           = 'Email không hợp lệ!';
    if (!values.password || values.password.length < 6)  e.password        = 'Mật khẩu phải có ít nhất 6 ký tự!';
    if (values.confirmPassword !== values.password)       e.confirmPassword = 'Mật khẩu xác nhận không khớp!';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await authService.register({ name: values.name, email: values.email, password: values.password });
      navigate('/login');
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Đăng ký thất bại');
    } finally { setLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logo__name}>SHOP<span>VN</span></div>
          <div className={styles.logo__sub}>Tạo tài khoản mới</div>
        </div>

        {apiError && <div className={styles.errorBox}>{apiError}</div>}

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label className={styles.label}>Họ và tên</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>👤</span>
              <input type="text" placeholder="Nguyễn Văn A" value={values.name} onChange={(e) => set('name', e.target.value)} disabled={loading} />
            </div>
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>✉</span>
              <input type="email" placeholder="example@email.com" value={values.email} onChange={(e) => set('email', e.target.value)} disabled={loading} />
            </div>
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Mật khẩu</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input type={showPw ? 'text' : 'password'} placeholder="Nhập mật khẩu" value={values.password} onChange={(e) => set('password', e.target.value)} disabled={loading} style={{ paddingRight: 40 }} />
              <button type="button" className={styles.pwToggle} onClick={() => setShowPw((p) => !p)}>{showPw ? '🙈' : '👁'}</button>
            </div>
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Xác nhận mật khẩu</label>
            <div className={styles.inputWrap}>
              <span className={styles.inputIcon}>🔒</span>
              <input type={showCp ? 'text' : 'password'} placeholder="Nhập lại mật khẩu" value={values.confirmPassword} onChange={(e) => set('confirmPassword', e.target.value)} disabled={loading} style={{ paddingRight: 40 }} />
              <button type="button" className={styles.pwToggle} onClick={() => setShowCp((p) => !p)}>{showCp ? '🙈' : '👁'}</button>
            </div>
            {errors.confirmPassword && <span className={styles.fieldError}>{errors.confirmPassword}</span>}
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? <><div className={styles.btnSpinner} />Đang đăng ký...</> : 'Đăng ký'}
          </button>
        </form>

        <p className={styles.footer}>Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link></p>
      </div>
    </div>
  );
};

export default RegisterPage;