import { Link } from 'react-router-dom'
import { ROUTES } from '@shared/config'

export function Footer() {
  return (
    <footer className="bg-brand-black text-brand-white mt-24">
      <div className="container mx-auto px-6 max-w-screen-xl py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-2 flex flex-col gap-4">
            <p className="font-display text-4xl">LUXE</p>
            <p className="text-sm text-brand-light/70 leading-relaxed max-w-xs">
              Thời trang cao cấp được chắt lọc từ những chất liệu tốt nhất.
              Chúng tôi tin rằng phong cách thực sự đến từ sự tinh tế trong từng chi tiết.
            </p>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-widest text-brand-light/50">Khám phá</h4>
            <ul className="flex flex-col gap-3">
              {[
                { to: ROUTES.shop,   label: 'Cửa hàng' },
                { to: ROUTES.orders, label: 'Đơn hàng' },
                { to: ROUTES.profile, label: 'Tài khoản' },
              ].map((l) => (
                <li key={l.to}>
                  <Link
                    to={l.to}
                    className="text-sm text-brand-light/70 hover:text-brand-white transition-colors"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div className="flex flex-col gap-4">
            <h4 className="text-xs uppercase tracking-widest text-brand-light/50">Liên hệ</h4>
            <ul className="flex flex-col gap-3 text-sm text-brand-light/70">
              <li>support@luxe.vn</li>
              <li>1800 1234</li>
              <li>T2 – T7, 9:00 – 18:00</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-brand-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-brand-light/40">© {new Date().getFullYear()} LUXE. All rights reserved.</p>
          <div className="flex gap-6">
            {['Chính sách bảo mật', 'Điều khoản sử dụng', 'Đổi trả'].map((t) => (
              <button key={t} className="text-xs text-brand-light/40 hover:text-brand-white transition-colors">
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
