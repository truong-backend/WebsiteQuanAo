import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Badge, Input, Spinner } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { toast, cn } from '@shared/lib'
import { useAuthStore } from '@features/auth/model/authStore'
import { isAdmin } from '@entities/user/model'
import { fetchMyProfile, updateMyProfile, changePasswordApi } from '@features/user/api/userApi'
import { ImageUploader } from '@features/upload/ui/ImageUploader'
import type { UpdateProfileRequest, ChangePasswordRequest, UserDto } from '@shared/types'

type Tab = 'info' | 'edit' | 'password'
type ProfileDto = Awaited<ReturnType<typeof fetchMyProfile>>

export default function ProfilePage() {
  const { user, logout, setAuth, token, refreshToken } = useAuthStore()
  const [tab, setTab] = useState<Tab>('info')
  const queryClient = useQueryClient()

  // ✅ Hook is always called — no early return before it
  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn:  fetchMyProfile,
    enabled:  !!user,
  })

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-3xl">Chưa đăng nhập</p>
        <Link to={ROUTES.login}><Button>Đăng nhập</Button></Link>
      </div>
    )
  }

  const tabs = [
    { key: 'info' as Tab,     label: 'Thông tin' },
    { key: 'edit' as Tab,     label: 'Chỉnh sửa' },
    { key: 'password' as Tab, label: 'Đổi mật khẩu' },
  ]

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">Tài khoản</p>
      <h1 className="font-display text-4xl mb-10">Hồ sơ của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: avatar card */}
        <div className="lg:col-span-1">
          <div className="flex flex-col items-center gap-5 p-8 bg-brand-cream border border-brand-light">
            {profile?.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={user.name}
                className="w-24 h-24 rounded-full object-cover border-2 border-brand-light"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-brand-gold flex items-center justify-center text-brand-black text-4xl font-display">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="text-center flex flex-col gap-2">
              <h2 className="font-display text-2xl">{user.name}</h2>
              <p className="text-sm text-brand-mid">{user.email}</p>
              <Badge variant={isAdmin(user) ? 'gold' : 'default'}>
                {isAdmin(user) ? 'Admin' : 'Khách hàng'}
              </Badge>
            </div>
            <div className="w-full pt-4 border-t border-brand-light flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-mid">ID</span>
                <span className="font-mono text-xs">{user.id}</span>
              </div>
              {profile?.phone && (
                <div className="flex justify-between">
                  <span className="text-brand-mid">SĐT</span>
                  <span>{profile.phone}</span>
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 w-full">
              {isAdmin(user) && (
                <Link to={ROUTES.admin} className="w-full">
                  <Button variant="secondary" className="w-full">⚙ Quản trị</Button>
                </Link>
              )}
              <Link to={ROUTES.orders} className="w-full">
                <Button variant="ghost" className="w-full">📦 Đơn hàng</Button>
              </Link>
              <Button variant="secondary" className="w-full mt-2" onClick={() => {
                if (confirm('Bạn có chắc muốn đăng xuất?')) logout()
              }}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* Right: tabs */}
        <div className="lg:col-span-2">
          <div className="flex gap-0 border-b border-brand-light mb-8">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'px-6 py-3 text-xs uppercase tracking-widest border-b-2 transition-all duration-200',
                  tab === t.key
                    ? 'border-brand-black text-brand-black'
                    : 'border-transparent text-brand-mid hover:text-brand-black',
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-16"><Spinner size="lg" /></div>
          ) : (
            <>
              {tab === 'info'     && <ProfileInfo profile={profile ?? null} />}
              {tab === 'edit'     && (
                <EditProfileForm
                  profile={profile ?? null}
                  onUpdated={(updated) => {
                    queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
                    // ✅ Spread user (non-null) with updated fields
                    if (token && refreshToken) {
                      setAuth({ ...user, name: updated.name, avatarUrl: updated.avatarUrl }, token, refreshToken)
                    }
                    setTab('info')
                  }}
                />
              )}
              {tab === 'password' && <ChangePasswordForm onSuccess={() => setTab('info')} />}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

// ── Profile Info ──────────────────────────────────────────────────

function ProfileInfo({ profile }: { profile: ProfileDto | null }) {
  if (!profile) return null

  const rows: { label: string; value: string }[] = [
    { label: 'Họ và tên',      value: profile.name },
    { label: 'Email',           value: profile.email },
    { label: 'Số điện thoại',  value: profile.phone ?? '—' },
    { label: 'Vai trò',        value: profile.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Người dùng' },
    { label: 'Xác thực email', value: profile.emailVerified ? '✓ Đã xác thực' : 'Chưa xác thực' },
    { label: 'Trạng thái',     value: profile.enabled ? 'Hoạt động' : 'Bị khóa' },
    { label: 'Ngày tham gia',  value: new Date(profile.createdAt).toLocaleDateString('vi-VN') },
  ]

  return (
    <div className="flex flex-col gap-4">
      <h2 className="font-display text-2xl">Thông tin tài khoản</h2>
      <div className="border border-brand-light divide-y divide-brand-light">
        {rows.map((r) => (
          <div key={r.label} className="flex justify-between px-5 py-4 text-sm">
            <span className="text-brand-mid">{r.label}</span>
            <span className="font-medium">{r.value}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Edit Profile Form ─────────────────────────────────────────────

function EditProfileForm({ profile, onUpdated }: {
  profile: ProfileDto | null
  onUpdated: (updated: Pick<UserDto, 'name' | 'avatarUrl'>) => void
}) {
  const [form, setForm] = useState<UpdateProfileRequest>({
    name:      profile?.name ?? '',
    phone:     profile?.phone ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
  })

  const mutation = useMutation({
    mutationFn: () => updateMyProfile(form),
    onSuccess:  (updated) => { toast('Đã cập nhật thông tin'); onUpdated(updated) },
    onError:    (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? 'Cập nhật thất bại'
      toast(msg, 'error')
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl">Chỉnh sửa thông tin</h2>
      <div className="flex flex-col gap-4">
        <Input
          label="Họ và tên *"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
        <Input
          label="Số điện thoại"
          value={form.phone ?? ''}
          placeholder="0912345678"
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <ImageUploader
          label="Ảnh đại diện"
          value={form.avatarUrl ?? null}
          folder="avatars"
          variant="inline"
          onChange={(url) => setForm((f) => ({ ...f, avatarUrl: url }))}
        />
      </div>
      <div className="flex gap-3">
        <Button
          loading={mutation.isPending}
          disabled={!form.name.trim()}
          onClick={() => mutation.mutate()}
        >
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}

// ── Change Password Form ──────────────────────────────────────────

function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<ChangePasswordRequest>({
    currentPassword: '',
    newPassword:     '',
  })
  const [confirmPw, setConfirmPw] = useState('')

  const mutation = useMutation({
    mutationFn: () => changePasswordApi(form),
    onSuccess:  () => { toast('Đã đổi mật khẩu thành công'); onSuccess() },
    onError:    (err: Error & { response?: { data?: { message?: string } } }) => {
      const msg = err?.response?.data?.message ?? 'Đổi mật khẩu thất bại'
      toast(msg, 'error')
    },
  })

  const passwordMismatch = confirmPw && confirmPw !== form.newPassword

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl">Đổi mật khẩu</h2>
      <div className="flex flex-col gap-4">
        <Input
          label="Mật khẩu hiện tại *"
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
        />
        <Input
          label="Mật khẩu mới * (tối thiểu 6 ký tự)"
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
        />
        <div>
          <Input
            label="Xác nhận mật khẩu mới *"
            type="password"
            value={confirmPw}
            onChange={(e) => setConfirmPw(e.target.value)}
          />
          {passwordMismatch && (
            <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>
          )}
        </div>
      </div>
      <Button
        loading={mutation.isPending}
        disabled={!form.currentPassword || !form.newPassword || form.newPassword.length < 6 || !!passwordMismatch}
        onClick={() => mutation.mutate()}
      >
        Đổi mật khẩu
      </Button>
    </div>
  )
}