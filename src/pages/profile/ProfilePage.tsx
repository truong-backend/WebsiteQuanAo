import { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Badge, Input, Spinner } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { toast, cn } from '@shared/lib'
import { useAuthStore } from '@features/auth/model/authStore'
import { isAdmin } from '@entities/user/model'
import { fetchMyProfile, updateMyProfile, changePasswordApi } from '@features/user/api/userApi'
import { uploadImage } from '@features/upload/api/uploadApi'
import type { UpdateProfileRequest, ChangePasswordRequest } from '@shared/types'

type Tab = 'info' | 'edit' | 'password'

export default function ProfilePage() {
  const { user, logout, setAuth, token } = useAuthStore()
  const [tab, setTab] = useState<Tab>('info')
  const queryClient = useQueryClient()

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p className="font-display text-3xl">Chưa đăng nhập</p>
        <Link to={ROUTES.login}><Button>Đăng nhập</Button></Link>
      </div>
    )
  }

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', 'me'],
    queryFn:  fetchMyProfile,
    enabled:  !!user,
  })

  const tabs = [
    { key: 'info' as Tab,     label: 'Thông tin' },
    { key: 'edit' as Tab,     label: 'Chỉnh sửa' },
    { key: 'password' as Tab, label: 'Đổi mật khẩu' },
  ]

  const avatarUrl = profile?.avatarUrl ?? user.avatarUrl

  return (
    <main className="container mx-auto px-6 max-w-screen-xl py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-brand-gold mb-2">Tài khoản</p>
      <h1 className="font-display text-4xl mb-10">Hồ sơ của tôi</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Left: avatar card */}
        <div className="lg:col-span-1">
          <div className="flex flex-col items-center gap-5 p-8 bg-brand-cream border border-brand-light">
            <div className="relative w-24 h-24">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-2 border-brand-light"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-brand-gold flex items-center justify-center text-brand-black text-4xl font-display">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
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
              {tab === 'edit'     && <EditProfileForm
                profile={profile ?? null}
                onUpdated={(updated) => {
                  queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
                  if (token) setAuth({ ...user, name: updated.name, avatarUrl: updated.avatarUrl }, token)
                  setTab('info')
                }}
              />}
              {tab === 'password' && <ChangePasswordForm onSuccess={() => setTab('info')} />}
            </>
          )}
        </div>
      </div>
    </main>
  )
}

// ── Profile Info ──────────────────────────────────────────────────

function ProfileInfo({ profile }: { profile: ReturnType<typeof fetchMyProfile> extends Promise<infer T> ? T : never | null }) {
  if (!profile) return null
  const rows = [
    { label: 'Họ và tên',        value: profile.name },
    { label: 'Email',             value: profile.email },
    { label: 'Số điện thoại',    value: profile.phone ?? '—' },
    { label: 'Vai trò',          value: profile.role === 'ROLE_ADMIN' ? 'Quản trị viên' : 'Người dùng' },
    { label: 'Xác thực email',   value: profile.emailVerified ? 'Đã xác thực' : 'Chưa xác thực' },
    { label: 'Trạng thái',       value: profile.enabled ? 'Hoạt động' : 'Bị khóa' },
    { label: 'Ngày tham gia',    value: new Date(profile.createdAt).toLocaleDateString('vi-VN') },
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
  profile: any
  onUpdated: (u: any) => void
}) {
  const [form, setForm] = useState<UpdateProfileRequest>({
    name:      profile?.name ?? '',
    phone:     profile?.phone ?? '',
    avatarUrl: profile?.avatarUrl ?? '',
  })

  const fileInputRef                        = useRef<HTMLInputElement>(null)
  const [uploading, setUploading]           = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
  const [previewUrl, setPreviewUrl]         = useState<string | null>(null)
  const [uploadError, setUploadError]       = useState<string | null>(null)

  const displayAvatar = previewUrl ?? form.avatarUrl ?? null

  const handleAvatarFile = async (file: File) => {
    const MAX     = 5 * 1024 * 1024
    const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!ALLOWED.includes(file.type)) {
      setUploadError('Chỉ chấp nhận JPEG, PNG, WebP, GIF')
      return
    }
    if (file.size > MAX) {
      setUploadError('File quá lớn. Tối đa 5MB')
      return
    }
    setUploadError(null)
    setPreviewUrl(URL.createObjectURL(file))
    setUploading(true)
    setUploadProgress(0)
    try {
      const result = await uploadImage(file, 'avatars', (p) => setUploadProgress(p))
      setForm((f) => ({ ...f, avatarUrl: result.url }))
      toast('Đã tải ảnh lên thành công')
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Upload thất bại'
      setUploadError(msg)
      setPreviewUrl(null)
    } finally {
      setUploading(false)
      setUploadProgress(null)
    }
  }

  const mutation = useMutation({
    mutationFn: () => updateMyProfile(form),
    onSuccess:  (updated) => { toast('Đã cập nhật thông tin'); onUpdated(updated) },
    onError:    (err: any) => {
      const msg = err?.response?.data?.message ?? 'Cập nhật thất bại'
      toast(msg, 'error')
    },
  })

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl">Chỉnh sửa thông tin</h2>

      {/* ── Avatar Upload ── */}
      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-brand-charcoal">
          Ảnh đại diện
        </label>
        <div className="flex items-center gap-5">
          {/* Avatar tròn — click để chọn file */}
          <div
            className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-brand-light flex-shrink-0 cursor-pointer group"
            onClick={() => !uploading && fileInputRef.current?.click()}
          >
            {displayAvatar ? (
              <img src={displayAvatar} alt="avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-brand-gold flex items-center justify-center text-brand-black text-3xl font-display">
                {(profile?.name ?? '?').charAt(0).toUpperCase()}
              </div>
            )}

            {/* Progress overlay */}
            {uploading && uploadProgress !== null && (
              <div className="absolute inset-0 bg-brand-black/60 flex flex-col items-center justify-center gap-1">
                <div className="w-12 h-1 bg-white/30 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-brand-gold transition-all duration-200"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <span className="text-white text-[10px] font-mono">{uploadProgress}%</span>
              </div>
            )}

            {/* Hover camera icon */}
            {!uploading && (
              <div className="absolute inset-0 bg-brand-black/0 group-hover:bg-brand-black/40 transition-all duration-200 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Nút & thông tin */}
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="text-xs uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors disabled:opacity-40 flex items-center gap-1.5"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {uploading ? 'Đang tải...' : (displayAvatar ? 'Thay ảnh' : 'Tải ảnh lên')}
            </button>
            <p className="text-[10px] text-brand-mid">JPEG, PNG, WebP — tối đa 5MB</p>
            {uploadError && (
              <p className="text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {uploadError}
              </p>
            )}
            {displayAvatar && !uploading && (
              <button
                type="button"
                onClick={() => { setForm((f) => ({ ...f, avatarUrl: '' })); setPreviewUrl(null) }}
                className="text-[10px] text-brand-mid hover:text-red-500 transition-colors text-left"
              >
                Xoá ảnh
              </button>
            )}
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleAvatarFile(file)
            e.target.value = ''
          }}
        />
      </div>

      {/* ── Text fields ── */}
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
      </div>

      <div className="flex gap-3">
        <Button
          loading={mutation.isPending}
          disabled={!form.name.trim() || uploading}
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
  const [confirm, setConfirm] = useState('')

  const mutation = useMutation({
    mutationFn: () => changePasswordApi(form),
    onSuccess:  () => { toast('Đã đổi mật khẩu thành công'); onSuccess() },
    onError:    (err: any) => {
      const msg = err?.response?.data?.message ?? 'Đổi mật khẩu thất bại'
      toast(msg, 'error')
    },
  })

  const passwordMismatch = confirm && confirm !== form.newPassword

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
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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