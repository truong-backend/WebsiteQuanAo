import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button, Input, Divider } from "@shared/ui";
import { toast } from "@shared/lib";
import { ROUTES } from "@shared/config";
import {
  loginApi,
  registerApi,
  verifyEmailApi,
  resendOtpApi,
  forgotPasswordApi,
  verifyResetOtpApi,
  resetPasswordApi,
  loginWithGoogle,
} from "@features/auth/api/authApi";
import { useAuthStore } from "@features/auth/model/authStore";

// ─── LoginForm ────────────────────────────────────────────────────────────────
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const setAuth = useAuthStore((s) => s.setAuth);
  const navigate = useNavigate();

  function validate() {
    const e: Record<string, string> = {};
    if (!form.email) e.email = "Vui lòng nhập email";
    if (!form.password) e.password = "Vui lòng nhập mật khẩu";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi(form);
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast("Đăng nhập thành công");
      if (onSuccess) onSuccess();
      else navigate(ROUTES.home);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Email hoặc mật khẩu không đúng";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        value={form.email}
        error={errors.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <Input
        label="Mật khẩu"
        type="password"
        placeholder="••••••••"
        value={form.password}
        error={errors.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
      />
      <div className="flex justify-end">
        <Link
          to="/forgot-password"
          className="text-xs text-brand-mid hover:text-brand-black underline underline-offset-4 transition-colors"
        >
          Quên mật khẩu?
        </Link>
      </div>
      <Button type="submit" loading={loading} className="w-full">
        Đăng nhập
      </Button>
      <Divider label="hoặc" />
      <Divider label="hoặc" />
      {/* Nút đăng nhập Google */}
      <button
        type="button"
        onClick={loginWithGoogle}
        className="w-full flex items-center justify-center gap-3 border border-brand-light py-3 px-4 text-sm hover:border-brand-mid hover:bg-gray-50 transition-colors rounded-sm"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        Tiếp tục với Google
      </button>
      <p className="text-center text-sm text-brand-mid">
        Chưa có tài khoản?{" "}
        <button
          type="button"
          onClick={() => navigate(ROUTES.register)}
          className="text-brand-black underline underline-offset-4 hover:text-brand-gold transition-colors"
        >
          Đăng ký ngay
        </button>
      </p>
    </form>
  );
}

// ─── RegisterForm ─────────────────────────────────────────────────────────────
export function RegisterForm() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { setPendingVerification } = useAuthStore();
  const navigate = useNavigate();

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Vui lòng nhập họ tên";
    if (!form.email) e.email = "Vui lòng nhập email";
    if (form.password.length < 6) e.password = "Mật khẩu tối thiểu 6 ký tự";
    if (form.phone && !form.phone.match(/^[0-9]{10,11}$/))
      e.phone = "Số điện thoại không hợp lệ (10-11 số)";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setLoading(true);
    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        ...(form.phone ? { phone: form.phone } : {}),
      };
      const res = await registerApi(payload);

      if (!res.requiresEmailVerification) {
        // BE requires OTP verification before login
        setPendingVerification(form.email);
        toast("Đăng ký thành công! Vui lòng kiểm tra email để xác thực.");
        navigate("/verify-email");
      } else {
        // Should not happen with current BE, but handle gracefully
        toast("Đăng ký thành công");
        navigate(ROUTES.login);
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Đăng ký thất bại";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        label="Họ tên"
        placeholder="Nguyễn Văn A"
        value={form.name}
        error={errors.name}
        onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
      />
      <Input
        label="Email"
        type="email"
        placeholder="your@email.com"
        value={form.email}
        error={errors.email}
        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
      />
      <Input
        label="Số điện thoại (tuỳ chọn)"
        placeholder="0901234567"
        value={form.phone}
        error={errors.phone}
        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
      />
      <Input
        label="Mật khẩu"
        type="password"
        placeholder="Tối thiểu 6 ký tự"
        value={form.password}
        error={errors.password}
        onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
      />
      <Button type="submit" loading={loading} className="w-full mt-2">
        Tạo tài khoản
      </Button>
      <p className="text-center text-sm text-brand-mid">
        Đã có tài khoản?{" "}
        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          className="text-brand-black underline underline-offset-4 hover:text-brand-gold transition-colors"
        >
          Đăng nhập
        </button>
      </p>
    </form>
  );
}

// ─── VerifyEmailForm ──────────────────────────────────────────────────────────
export function VerifyEmailForm() {
  const { pendingEmail, setAuth, clearPendingVerification } = useAuthStore();
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const navigate = useNavigate();

  if (!pendingEmail) {
    navigate(ROUTES.register);
    return null;
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      toast("Vui lòng nhập mã OTP", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await verifyEmailApi({ email: pendingEmail!, otp });
      setAuth(res.user, res.accessToken, res.refreshToken);
      toast("Xác thực email thành công!");
      navigate(ROUTES.home);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Mã OTP không hợp lệ hoặc đã hết hạn";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    try {
      await resendOtpApi({ email: pendingEmail! });
      toast("Đã gửi mã OTP. Vui lòng kiểm tra email.");
    } catch {
      toast("Không thể gửi lại OTP", "error");
    } finally {
      setResending(false);
    }
  }

  return (
    <form onSubmit={handleVerify} className="flex flex-col gap-5">
      <p className="text-sm text-brand-mid text-center">
        Mã OTP đã được gửi đến <strong>{pendingEmail}</strong>
      </p>
      <Input
        label="Mã OTP (6 chữ số)"
        placeholder="123456"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        Xác thực
      </Button>
      <div className="flex items-center justify-between text-xs text-brand-mid">
        <button
          type="button"
          onClick={() => {
            clearPendingVerification();
            navigate(ROUTES.register);
          }}
          className="hover:text-brand-black transition-colors"
        >
          ← Quay lại đăng ký
        </button>
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="hover:text-brand-black transition-colors disabled:opacity-50"
        >
          {resending ? "Đang gửi..." : "Gửi mã OTP"}
        </button>
      </div>
    </form>
  );
}

// ─── ForgotPasswordForm ───────────────────────────────────────────────────────
export function ForgotPasswordForm() {
  const [step, setStep] = useState<"email" | "otp" | "newpw">("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast("Vui lòng nhập email", "error");
      return;
    }
    setLoading(true);
    try {
      await forgotPasswordApi({ email });
      toast("Mã OTP đã được gửi nếu email tồn tại.");
      setStep("otp");
    } catch {
      toast("Đã xảy ra lỗi", "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!otp.trim()) {
      toast("Vui lòng nhập mã OTP", "error");
      return;
    }
    setLoading(true);
    try {
      await verifyResetOtpApi({ email, otp });
      toast("OTP hợp lệ. Hãy nhập mật khẩu mới.");
      setStep("newpw");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Mã OTP không hợp lệ";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 6) {
      toast("Mật khẩu tối thiểu 6 ký tự", "error");
      return;
    }
    setLoading(true);
    try {
      await resetPasswordApi({ email, otp, newPassword });
      toast("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.");
      navigate(ROUTES.login);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message ?? "Đặt lại mật khẩu thất bại";
      toast(msg, "error");
    } finally {
      setLoading(false);
    }
  }

  if (step === "email")
    return (
      <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
        <Input
          label="Email tài khoản"
          type="email"
          placeholder="your@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button type="submit" loading={loading} className="w-full">
          Gửi mã OTP
        </Button>
        <p className="text-center text-xs text-brand-mid">
          <button
            type="button"
            onClick={() => navigate(ROUTES.login)}
            className="underline hover:text-brand-black transition-colors"
          >
            ← Quay lại đăng nhập
          </button>
        </p>
      </form>
    );

  if (step === "otp")
    return (
      <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
        <p className="text-sm text-brand-mid text-center">
          Mã OTP đã gửi đến <strong>{email}</strong>
        </p>
        <Input
          label="Mã OTP"
          placeholder="123456"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <Button type="submit" loading={loading} className="w-full">
          Xác nhận OTP
        </Button>
      </form>
    );

  return (
    <form onSubmit={handleReset} className="flex flex-col gap-5">
      <Input
        label="Mật khẩu mới"
        type="password"
        placeholder="Tối thiểu 6 ký tự"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
      />
      <Button type="submit" loading={loading} className="w-full">
        Đặt lại mật khẩu
      </Button>
    </form>
  );
}
