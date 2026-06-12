import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast, cn } from '@shared/lib'
import { Button, Badge, Input, Select, Spinner, Modal, EmptyState } from '@shared/ui'
import { fetchAllUsersAdmin, adminDeleteUser, adminRestoreUser, adminToggleUserStatus, adminChangeUserRole } from '@features/user/api/userApi'
import { ImageUploader } from '@features/upload/ui/ImageUploader'
import type { UserDto } from '@shared/types'

export function AdminUsers() {
  const [page, setPage]                     = useState(0)
  const [search, setSearch]                 = useState('')
  const [role, setRole]                     = useState('')
  const [enabled, setEnabled]               = useState('')
  const [includeDeleted, setIncludeDeleted] = useState(false)
  const [editUser, setEditUser]             = useState<UserDto | null>(null)
  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'users', page, search, role, enabled, includeDeleted],
    queryFn:  () => fetchAllUsersAdmin({ page, size: 20, search: search || undefined, role: role || undefined, enabled: enabled === '' ? undefined : enabled === 'true', includeDeleted: includeDeleted || undefined }),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteUser,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã xóa tài khoản') },
    onError:    () => toast('Xóa thất bại', 'error'),
  })
  const restoreMutation = useMutation({
    mutationFn: adminRestoreUser,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã khôi phục tài khoản') },
    onError:    () => toast('Khôi phục thất bại', 'error'),
  })
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, enabled: en }: { id: number; enabled: boolean }) => adminToggleUserStatus(id, en),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã cập nhật') },
    onError:    () => toast('Thất bại', 'error'),
  })
  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role: r }: { id: number; role: 'ROLE_USER' | 'ROLE_ADMIN' }) => adminChangeUserRole(id, r),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); toast('Đã cập nhật quyền') },
    onError:    () => toast('Thất bại', 'error'),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center gap-4">
        <Input placeholder="Tìm theo tên, email, SĐT..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(0) }} className="max-w-xs" />
        <Select options={[{ value: '', label: 'Tất cả vai trò' }, { value: 'ROLE_USER', label: 'Người dùng' }, { value: 'ROLE_ADMIN', label: 'Admin' }]} value={role} onChange={(e) => { setRole(e.target.value); setPage(0) }} className="max-w-[160px]" />
        <Select options={[{ value: '', label: 'Tất cả trạng thái' }, { value: 'true', label: 'Đang hoạt động' }, { value: 'false', label: 'Đã bị khóa' }]} value={enabled} onChange={(e) => { setEnabled(e.target.value); setPage(0) }} className="max-w-[180px]" />
        <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-brand-mid hover:text-brand-black transition-colors">
          <input type="checkbox" checked={includeDeleted} onChange={(e) => { setIncludeDeleted(e.target.checked); setPage(0) }} className="w-4 h-4 accent-brand-gold" />
          Hiển thị tài khoản đã xóa
        </label>
      </div>
      {data && <p className="text-xs text-brand-mid">Tổng cộng: <strong>{data.totalElements}</strong> tài khoản</p>}

      {isLoading ? (
        <div className="flex justify-center py-16"><Spinner size="lg" /></div>
      ) : !data?.content.length ? (
        <EmptyState icon="👥" title="Không tìm thấy tài khoản nào" />
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-light">
                  {['ID', 'Tên / Email', 'SĐT', 'Vai trò', 'Trạng thái', 'Ngày tạo', 'Thao tác'].map((h) => (
                    <th key={h} className="text-left text-[10px] uppercase tracking-wider text-brand-mid py-3 pr-4 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-light/50">
                {data.content.map((u) => (
                  <tr key={u.id} className={cn('transition-colors', u.deleted ? 'opacity-50 bg-red-50/30' : 'hover:bg-brand-cream/50')}>
                    <td className="py-3 pr-4 font-mono text-xs text-brand-mid">{u.id}</td>
                    <td className="py-3 pr-4">
                      <p className={cn('font-medium line-clamp-1', u.deleted && 'line-through text-brand-mid')}>{u.name}</p>
                      <p className="text-xs text-brand-mid">{u.email}</p>
                      {u.deleted && u.deletedAt && <p className="text-[10px] text-red-400 mt-0.5">Đã xóa: {new Date(u.deletedAt).toLocaleDateString('vi-VN')}</p>}
                    </td>
                    <td className="py-3 pr-4 text-brand-mid text-xs">{u.phone ?? '—'}</td>
                    <td className="py-3 pr-4"><Badge variant={u.role === 'ROLE_ADMIN' ? 'gold' : 'default'}>{u.role === 'ROLE_ADMIN' ? 'Admin' : 'User'}</Badge></td>
                    <td className="py-3 pr-4">
                      {u.deleted ? <Badge variant="error">Đã xóa</Badge> : <Badge variant={u.enabled ? 'success' : 'error'}>{u.enabled ? 'Hoạt động' : 'Bị khóa'}</Badge>}
                    </td>
                    <td className="py-3 pr-4 text-xs text-brand-mid">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {u.deleted ? (
                          <button onClick={() => { if (confirm(`Khôi phục tài khoản ${u.email}?`)) restoreMutation.mutate(u.id) }} className="text-[10px] text-green-600 hover:text-green-800 uppercase tracking-wider transition-colors">Khôi phục</button>
                        ) : (
                          <>
                            <button onClick={() => toggleStatusMutation.mutate({ id: u.id, enabled: !u.enabled })} className={cn('text-[10px] uppercase tracking-wider transition-colors', u.enabled ? 'text-orange-500 hover:text-orange-700' : 'text-green-600 hover:text-green-800')}>{u.enabled ? 'Khóa' : 'Mở khóa'}</button>
                            <button onClick={() => { const newRole = u.role === 'ROLE_ADMIN' ? 'ROLE_USER' : 'ROLE_ADMIN'; if (confirm(`Đổi quyền ${u.name} thành ${newRole === 'ROLE_ADMIN' ? 'Admin' : 'User'}?`)) changeRoleMutation.mutate({ id: u.id, role: newRole }) }} className="text-[10px] uppercase tracking-wider text-brand-gold hover:text-brand-black transition-colors">{u.role === 'ROLE_ADMIN' ? '↓ User' : '↑ Admin'}</button>
                            <button onClick={() => setEditUser(u)} className="text-[10px] uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors">Sửa</button>
                            <button onClick={() => { if (confirm(`Xóa tài khoản ${u.email}?`)) deleteMutation.mutate(u.id) }} className="text-[10px] text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors">Xóa</button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.totalPages > 1 && (
            <div className="flex items-center gap-2 justify-center">
              <button disabled={data.first} onClick={() => setPage((p) => p - 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">← Trước</button>
              <span className="text-xs text-brand-mid">{data.number + 1} / {data.totalPages}</span>
              <button disabled={data.last} onClick={() => setPage((p) => p + 1)} className="px-4 py-2 border border-brand-light hover:border-brand-black disabled:opacity-30 text-xs transition-colors">Sau →</button>
            </div>
          )}
        </>
      )}

      {editUser && (
        <Modal open={!!editUser} onClose={() => setEditUser(null)} title={`Sửa tài khoản — ${editUser.email}`} className="max-w-lg mx-4 p-8">
          <EditUserForm user={editUser} onClose={() => setEditUser(null)} onUpdated={() => { queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); setEditUser(null) }} />
        </Modal>
      )}
    </div>
  )
}

function EditUserForm({ user, onClose, onUpdated }: { user: UserDto; onClose: () => void; onUpdated: () => void }) {
  const [form, setForm] = useState({ name: user.name, phone: user.phone ?? '', avatarUrl: user.avatarUrl ?? '' })
  const mutation = useMutation({
    mutationFn: () => import('@features/user/api/userApi').then((m) => m.adminUpdateUser(user.id, form)),
    onSuccess:  () => { toast('Đã cập nhật'); onUpdated() },
    onError:    (err: unknown) => toast((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Thất bại', 'error'),
  })
  return (
    <div className="flex flex-col gap-4">
      <Input label="Họ và tên *" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
      <Input label="Số điện thoại" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
      <ImageUploader label="Ảnh đại diện" value={form.avatarUrl || null} folder="avatars" variant="inline" onChange={(url) => setForm((f) => ({ ...f, avatarUrl: url }))} />
      <div className="flex gap-3 mt-4 justify-end">
        <Button variant="ghost" onClick={onClose}>Hủy</Button>
        <Button loading={mutation.isPending} disabled={!form.name.trim()} onClick={() => mutation.mutate()}>Lưu</Button>
      </div>
    </div>
  )
}