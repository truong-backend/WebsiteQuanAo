import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Button, Input, Divider } from '@shared/ui'
import { toast } from '@shared/lib'
import { ROUTES } from '@shared/config'
import {
  loginApi,
  registerApi,
  verifyEmailApi,
  resendOtpApi,
  forgotPasswordApi,
  verifyResetOtpApi,
  resetPasswordApi,
} from '@features/auth/api/authApi'
import { useAuthStore } from '@features/auth/model/authStore'

// ─── LoginForm ────────────────────────────────────────────────────────────────
export function LoginForm({ onSuccess }: { onSuccess?: () => void }) {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const setAuth             = useAuthStore((s) => s.setAuth)
  const navigate            = useNavigate()

  function validate() {
    const e: Record<string, string> = {}
    if (!form.email)    e.email    = 'Vui lòng nhập email'
    if (!form.password) e.password = 'Vui lòng nhập mật khẩu'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const res = await loginApi(form)
      setAuth(res.user, res.accessToken)
      toast('Đăng nhập thành công')
      if (onSuccess) onSuccess()
      else navigate(ROUTES.home)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Email hoặc mật khẩu không đúng'
      toast(msg, 'error')
    } finally {
      setLoading(false)
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
      <p className="text-center text-sm text-brand-mid">
        Chưa có tài khoản?{' '}
        <button
          type="button"
          onClick={() => navigate(ROUTES.register)}
          className="text-brand-black underline underline-offset-4 hover:text-brand-gold transition-colors"
        >
          Đăng ký ngay
        </button>
      </p>
    </form>
  )
}

// ─── RegisterForm ─────────────────────────────────────────────────────────────
export function RegisterForm() {
  const [form, setForm]     = useState({ name: '', email: '', password: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const { setPendingVerification } = useAuthStore()
  const navigate            = useNavigate()

  function validate() {
    const e: Record<string, string> = {}
    if (!form.name.trim())                    e.name     = 'Vui lòng nhập họ tên'
    if (!form.email)                           e.email    = 'Vui lòng nhập email'
    if (form.password.length < 6)             e.password = 'Mật khẩu tối thiểu 6 ký tự'
    if (form.phone && !form.phone.match(/^[0-9]{10,11}$/))
      e.phone = 'Số điện thoại không hợp lệ (10-11 số)'
    return e
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setLoading(true)
    try {
      const payload = {
        name:     form.name,
        email:    form.email,
        password: form.password,
        ...(form.phone ? { phone: form.phone } : {}),
      }
      const res = await registerApi(payload)

      if (!res.requiresEmailVerification) {
        // BE requires OTP verification before login
        setPendingVerification(form.email)
        toast('Đăng ký thành công! Vui lòng kiểm tra email để xác thực.')
        navigate('/verify-email')
      } else {
        // Should not happen with current BE, but handle gracefully
        toast('Đăng ký thành công')
        navigate(ROUTES.login)
      }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Đăng ký thất bại'
      toast(msg, 'error')
    } finally {
      setLoading(false)
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
        Đã có tài khoản?{' '}
        <button
          type="button"
          onClick={() => navigate(ROUTES.login)}
          className="text-brand-black underline underline-offset-4 hover:text-brand-gold transition-colors"
        >
          Đăng nhập
        </button>
      </p>
    </form>
  )
}

// ─── VerifyEmailForm ──────────────────────────────────────────────────────────
export function VerifyEmailForm() {
  const { pendingEmail, setAuth, clearPendingVerification } = useAuthStore()
  const [otp, setOtp]         = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const navigate              = useNavigate()

  if (!pendingEmail) {
    navigate(ROUTES.register)
    return null
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!otp.trim()) { toast('Vui lòng nhập mã OTP', 'error'); return }
    setLoading(true)
    try {
      const res = await verifyEmailApi({ email: pendingEmail!, otp })
      setAuth(res.user, res.accessToken)
      toast('Xác thực email thành công!')
      navigate(ROUTES.home)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Mã OTP không hợp lệ hoặc đã hết hạn'
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    setResending(true)
    try {
      await resendOtpApi({ email: pendingEmail! })
      toast('Đã gửi mã OTP. Vui lòng kiểm tra email.')
    } catch {
      toast('Không thể gửi lại OTP', 'error')
    } finally {
      setResending(false)
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
        <button type="button" onClick={() => { clearPendingVerification(); navigate(ROUTES.register) }}
          className="hover:text-brand-black transition-colors">
          ← Quay lại đăng ký
        </button>
        <button type="button" onClick={handleResend} disabled={resending}
          className="hover:text-brand-black transition-colors disabled:opacity-50">
          {resending ? 'Đang gửi...' : 'Gửi mã OTP'}
        </button>
      </div>
    </form>
  )
}

// ─── ForgotPasswordForm ───────────────────────────────────────────────────────
export function ForgotPasswordForm() {
  const [step, setStep]       = useState<'email' | 'otp' | 'newpw'>('email')
  const [email, setEmail]     = useState('')
  const [otp, setOtp]         = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate              = useNavigate()

  async function handleSendOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!email) { toast('Vui lòng nhập email', 'error'); return }
    setLoading(true)
    try {
      await forgotPasswordApi({ email })
      toast('Mã OTP đã được gửi nếu email tồn tại.')
      setStep('otp')
    } catch {
      toast('Đã xảy ra lỗi', 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault()
    if (!otp.trim()) { toast('Vui lòng nhập mã OTP', 'error'); return }
    setLoading(true)
    try {
      await verifyResetOtpApi({ email, otp })
      toast('OTP hợp lệ. Hãy nhập mật khẩu mới.')
      setStep('newpw')
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Mã OTP không hợp lệ'
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    if (newPassword.length < 6) { toast('Mật khẩu tối thiểu 6 ký tự', 'error'); return }
    setLoading(true)
    try {
      await resetPasswordApi({ email, otp, newPassword })
      toast('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.')
      navigate(ROUTES.login)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Đặt lại mật khẩu thất bại'
      toast(msg, 'error')
    } finally {
      setLoading(false)
    }
  }

  if (step === 'email') return (
    <form onSubmit={handleSendOtp} className="flex flex-col gap-5">
      <Input label="Email tài khoản" type="email" placeholder="your@email.com"
        value={email} onChange={(e) => setEmail(e.target.value)} />
      <Button type="submit" loading={loading} className="w-full">Gửi mã OTP</Button>
      <p className="text-center text-xs text-brand-mid">
        <button type="button" onClick={() => navigate(ROUTES.login)}
          className="underline hover:text-brand-black transition-colors">← Quay lại đăng nhập</button>
      </p>
    </form>
  )

  if (step === 'otp') return (
    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
      <p className="text-sm text-brand-mid text-center">Mã OTP đã gửi đến <strong>{email}</strong></p>
      <Input label="Mã OTP" placeholder="123456" value={otp}
        onChange={(e) => setOtp(e.target.value)} />
      <Button type="submit" loading={loading} className="w-full">Xác nhận OTP</Button>
    </form>
  )

  return (
    <form onSubmit={handleReset} className="flex flex-col gap-5">
      <Input label="Mật khẩu mới" type="password" placeholder="Tối thiểu 6 ký tự"
        value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      <Button type="submit" loading={loading} className="w-full">Đặt lại mật khẩu</Button>
    </form>
  )
}
