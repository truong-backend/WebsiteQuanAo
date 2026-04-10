import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, Badge, Input, Spinner, Modal } from '@shared/ui'
import { ROUTES } from '@shared/config'
import { toast, cn } from '@shared/lib'
import { useAuthStore } from '@features/auth/model/authStore'
import { isAdmin } from '@entities/user/model'
import { fetchMyProfile, updateMyProfile, changePasswordApi } from '@features/user/api/userApi'
import {
  fetchMyAddresses, addAddressApi, updateAddressApi,
  deleteAddressApi, setDefaultAddressApi,
} from '@features/user/api/addressApi'
import { ImageUploader } from '@features/upload/ui/ImageUploader'
import type {
  UpdateProfileRequest, ChangePasswordRequest, UserDto,
  AddressDto, AddressRequest,
} from '@shared/types'

type Tab = 'info' | 'edit' | 'password' | 'addresses'
type ProfileDto = Awaited<ReturnType<typeof fetchMyProfile>>

export default function ProfilePage() {
  const { user, logout, setAuth, token, refreshToken } = useAuthStore()
  const [tab, setTab] = useState<Tab>('info')
  const queryClient   = useQueryClient()

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

  const tabs: { key: Tab; label: string }[] = [
    { key: 'info',      label: 'Thông tin' },
    { key: 'addresses', label: 'Địa chỉ' },
    { key: 'edit',      label: 'Chỉnh sửa' },
    { key: 'password',  label: 'Đổi mật khẩu' },
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
              <img src={profile.avatarUrl} alt={user.name} className="w-24 h-24 rounded-full object-cover border-2 border-brand-light" />
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
              <Button variant="secondary" className="w-full mt-2" onClick={() => { if (confirm('Bạn có chắc muốn đăng xuất?')) logout() }}>
                Đăng xuất
              </Button>
            </div>
          </div>
        </div>

        {/* Right: tabs */}
        <div className="lg:col-span-2">
          <div className="flex gap-0 border-b border-brand-light mb-8 overflow-x-auto">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'px-6 py-3 text-xs uppercase tracking-widest border-b-2 transition-all duration-200 whitespace-nowrap',
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
              {tab === 'info'      && <ProfileInfo profile={profile ?? null} />}
              {tab === 'addresses' && <AddressBook />}
              {tab === 'edit'      && (
                <EditProfileForm
                  profile={profile ?? null}
                  onUpdated={(updated) => {
                    queryClient.invalidateQueries({ queryKey: ['profile', 'me'] })
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

  const rows = [
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

// ── Address Book ──────────────────────────────────────────────────

function AddressBook() {
  const queryClient = useQueryClient()
  const [addOpen,  setAddOpen]  = useState(false)
  const [editAddr, setEditAddr] = useState<AddressDto | null>(null)

  const { data: addresses, isLoading } = useQuery({
    queryKey: ['addresses', 'my'],
    queryFn:  fetchMyAddresses,
  })

  const deleteMutation = useMutation({
    mutationFn: deleteAddressApi,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['addresses', 'my'] }); toast('Đã xóa địa chỉ') },
    onError:    () => toast('Xóa thất bại', 'error'),
  })

  const setDefaultMutation = useMutation({
    mutationFn: setDefaultAddressApi,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['addresses', 'my'] }); toast('Đã đặt mặc định') },
    onError:    () => toast('Thất bại', 'error'),
  })

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses', 'my'] })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl">Địa chỉ giao hàng</h2>
        <Button size="sm" onClick={() => setAddOpen(true)} disabled={(addresses?.length ?? 0) >= 5}>
          + Thêm địa chỉ
        </Button>
      </div>

      {(addresses?.length ?? 0) >= 5 && (
        <p className="text-xs text-brand-mid">Đã đạt tối đa 5 địa chỉ.</p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-10"><Spinner /></div>
      ) : !addresses?.length ? (
        <div className="p-6 border border-dashed border-brand-light text-center">
          <p className="text-brand-mid text-sm">Chưa có địa chỉ nào được lưu.</p>
          <p className="text-xs text-brand-mid mt-1">Thêm địa chỉ để checkout nhanh hơn.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {addresses.map((addr) => (
            <li key={addr.id} className={cn(
              'p-4 border transition-colors',
              addr.defaultAddress ? 'border-brand-black bg-brand-cream' : 'border-brand-light',
            )}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <p className="font-medium text-sm">{addr.recipientName}</p>
                    <p className="text-sm text-brand-mid">{addr.phone}</p>
                    {addr.defaultAddress && (
                      <span className="text-[10px] uppercase tracking-wider text-brand-gold border border-brand-gold px-2 py-0.5">
                        Mặc định
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-brand-charcoal">{addr.address}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {!addr.defaultAddress && (
                    <button
                      onClick={() => setDefaultMutation.mutate(addr.id)}
                      className="text-xs text-brand-mid hover:text-brand-black uppercase tracking-wider transition-colors"
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => setEditAddr(addr)}
                    className="text-xs text-brand-mid hover:text-brand-black uppercase tracking-wider transition-colors"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => { if (confirm('Xóa địa chỉ này?')) deleteMutation.mutate(addr.id) }}
                    className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Add modal */}
      <AddressFormModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSaved={() => { invalidate(); setAddOpen(false) }}
      />

      {/* Edit modal */}
      {editAddr && (
        <AddressFormModal
          open={!!editAddr}
          address={editAddr}
          onClose={() => setEditAddr(null)}
          onSaved={() => { invalidate(); setEditAddr(null) }}
        />
      )}
    </div>
  )
}

function AddressFormModal({
  open, address, onClose, onSaved,
}: {
  open:     boolean
  address?: AddressDto
  onClose:  () => void
  onSaved:  () => void
}) {
  const isEdit = !!address
  const [form, setForm] = useState<AddressRequest>({
    recipientName:  address?.recipientName  ?? '',
    phone:          address?.phone          ?? '',
    address:        address?.address        ?? '',
    defaultAddress: address?.defaultAddress ?? false,
  })

  const mutation = useMutation({
    mutationFn: () => isEdit
      ? updateAddressApi(address!.id, form)
      : addAddressApi(form),
    onSuccess: () => { toast(isEdit ? 'Đã cập nhật địa chỉ' : 'Đã thêm địa chỉ'); onSaved() },
    onError:   (err: unknown) => toast(
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Thất bại',
      'error',
    ),
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Chỉnh sửa địa chỉ' : 'Thêm địa chỉ mới'}
      className="max-w-lg mx-4 p-8"
    >
      <div className="flex flex-col gap-4">
        <Input
          label="Tên người nhận *"
          value={form.recipientName}
          onChange={(e) => setForm((f) => ({ ...f, recipientName: e.target.value }))}
        />
        <Input
          label="Số điện thoại *"
          placeholder="0901234567"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
        />
        <div>
          <label className="block text-xs font-medium uppercase tracking-wider text-brand-charcoal mb-1">
            Địa chỉ đầy đủ *
          </label>
          <textarea
            rows={3}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành"
            value={form.address}
            onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
            className="w-full border border-brand-light px-4 py-3 text-sm font-body focus:outline-none focus:border-brand-black transition-colors resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="addr-default"
            checked={form.defaultAddress}
            onChange={(e) => setForm((f) => ({ ...f, defaultAddress: e.target.checked }))}
            className="w-4 h-4 accent-brand-gold"
          />
          <label htmlFor="addr-default" className="text-sm">Đặt làm địa chỉ mặc định</label>
        </div>
      </div>
      <div className="flex gap-3 mt-6 justify-end border-t border-brand-light pt-4">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button
          loading={mutation.isPending}
          disabled={!form.recipientName.trim() || !form.phone.trim() || !form.address.trim()}
          onClick={() => mutation.mutate()}
        >
          {isEdit ? 'Lưu thay đổi' : 'Thêm địa chỉ'}
        </Button>
      </div>
    </Modal>
  )
}

// ── Edit Profile Form ─────────────────────────────────────────────

function EditProfileForm({ profile, onUpdated }: {
  profile:   ProfileDto | null
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
    onError:    (err: Error & { response?: { data?: { message?: string } } }) =>
      toast(err?.response?.data?.message ?? 'Cập nhật thất bại', 'error'),
  })

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl">Chỉnh sửa thông tin</h2>
      <div className="flex flex-col gap-4">
        <Input label="Họ và tên *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        <Input label="Số điện thoại" value={form.phone ?? ''} placeholder="0912345678" onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
        <ImageUploader label="Ảnh đại diện" value={form.avatarUrl ?? null} folder="avatars" variant="inline" onChange={(url) => setForm((f) => ({ ...f, avatarUrl: url }))} />
      </div>
      <div className="flex gap-3">
        <Button loading={mutation.isPending} disabled={!form.name.trim()} onClick={() => mutation.mutate()}>
          Lưu thay đổi
        </Button>
      </div>
    </div>
  )
}

// ── Change Password Form ──────────────────────────────────────────

function ChangePasswordForm({ onSuccess }: { onSuccess: () => void }) {
  const [form, setForm] = useState<ChangePasswordRequest>({ currentPassword: '', newPassword: '' })
  const [confirmPw, setConfirmPw] = useState('')

  const mutation = useMutation({
    mutationFn: () => changePasswordApi(form),
    onSuccess:  () => { toast('Đã đổi mật khẩu thành công'); onSuccess() },
    onError:    (err: Error & { response?: { data?: { message?: string } } }) =>
      toast(err?.response?.data?.message ?? 'Đổi mật khẩu thất bại', 'error'),
  })

  const passwordMismatch = confirmPw && confirmPw !== form.newPassword

  return (
    <div className="flex flex-col gap-6">
      <h2 className="font-display text-2xl">Đổi mật khẩu</h2>
      <div className="flex flex-col gap-4">
        <Input label="Mật khẩu hiện tại *" type="password" value={form.currentPassword} onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))} />
        <Input label="Mật khẩu mới * (tối thiểu 6 ký tự)" type="password" value={form.newPassword} onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))} />
        <div>
          <Input label="Xác nhận mật khẩu mới *" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
          {passwordMismatch && <p className="text-xs text-red-500 mt-1">Mật khẩu xác nhận không khớp</p>}
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