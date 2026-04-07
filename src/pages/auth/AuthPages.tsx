import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/config'
import {
  LoginForm,
  RegisterForm,
  VerifyEmailForm,
  ForgotPasswordForm,
} from '@features/auth/index'

export function LoginPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <Link to={ROUTES.home} className="font-display text-4xl text-brand-gold">LUXE</Link>
          <h1 className="font-display text-3xl mt-4">Đăng nhập</h1>
          <p className="text-sm text-brand-mid mt-2">Chào mừng trở lại — tiếp tục hành trình thời trang của bạn</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-brand-light" />
          <span className="text-brand-gold text-xs">✦</span>
          <div className="flex-1 h-px bg-brand-light" />
        </div>
        <LoginForm />
      </div>
    </main>
  )
}

export function RegisterPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <Link to={ROUTES.home} className="font-display text-4xl text-brand-gold">LUXE</Link>
          <h1 className="font-display text-3xl mt-4">Tạo tài khoản</h1>
          <p className="text-sm text-brand-mid mt-2">Tham gia cộng đồng LUXE và khám phá thời trang cao cấp</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-brand-light" />
          <span className="text-brand-gold text-xs">✦</span>
          <div className="flex-1 h-px bg-brand-light" />
        </div>
        <RegisterForm />
      </div>
    </main>
  )
}

/** New — OTP verification page after register */
export function VerifyEmailPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <Link to={ROUTES.home} className="font-display text-4xl text-brand-gold">LUXE</Link>
          <h1 className="font-display text-3xl mt-4">Xác thực email</h1>
          <p className="text-sm text-brand-mid mt-2">Nhập mã OTP được gửi đến email của bạn</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-brand-light" />
          <span className="text-brand-gold text-xs">✦</span>
          <div className="flex-1 h-px bg-brand-light" />
        </div>
        <VerifyEmailForm />
      </div>
    </main>
  )
}

/** New — Forgot password page (3-step: email → OTP → new password) */
export function ForgotPasswordPage() {
  return (
    <main className="min-h-[80vh] flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-md flex flex-col gap-8">
        <div className="text-center">
          <Link to={ROUTES.home} className="font-display text-4xl text-brand-gold">LUXE</Link>
          <h1 className="font-display text-3xl mt-4">Quên mật khẩu</h1>
          <p className="text-sm text-brand-mid mt-2">Nhập email để nhận mã OTP đặt lại mật khẩu</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex-1 h-px bg-brand-light" />
          <span className="text-brand-gold text-xs">✦</span>
          <div className="flex-1 h-px bg-brand-light" />
        </div>
        <ForgotPasswordForm />
      </div>
    </main>
  )
}
