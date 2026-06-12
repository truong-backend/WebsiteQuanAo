import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@shared/lib'
import { Button, Badge, Input, Spinner } from '@shared/ui'
import {
  fetchAllColors,
  adminCreateColor,
  adminUpdateColor,
  adminDeleteColor,
  adminRestoreColor,
  adminHardDeleteColor,
} from '@features/admin/api/adminApi'
import type { ColorDto, ApiResponse } from '@shared/types'
import type { AxiosError } from 'axios'

export function AdminColors() {
  const queryClient = useQueryClient()
  const [form, setForm]           = useState({ code: '', name: '', nameEn: '' })
  const [editColor, setEditColor] = useState<ColorDto | null>(null)

  const { data: colors, isLoading } = useQuery({ queryKey: ['admin', 'colors'], queryFn: fetchAllColors })

  const createMutation = useMutation({
    mutationFn: () => adminCreateColor({ code: form.code, name: form.name, nameEn: form.nameEn || undefined }),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã tạo màu'); setForm({ code: '', name: '', nameEn: '' }) },
    onError:    (err: AxiosError<ApiResponse<null>>) => toast(err.response?.data?.message ?? 'Tạo thất bại', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: (c: ColorDto) => adminUpdateColor(c.id, { code: c.code, name: c.name, nameEn: c.nameEn ?? '', active: c.active }),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã cập nhật màu'); setEditColor(null) },
    onError:    (err: AxiosError<ApiResponse<null>>) => toast(err.response?.data?.message ?? 'Cập nhật thất bại', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteColor,
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã vô hiệu hoá màu') },
    onError:    (err: AxiosError<ApiResponse<null>>) => toast(err.response?.data?.message ?? 'Không thể xóa: màu đang có sản phẩm sử dụng', 'error'),
  })

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => adminHardDeleteColor(id),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã xóa vĩnh viễn màu') },
    onError:    (err: AxiosError<ApiResponse<null>>) => toast(err.response?.data?.message ?? 'Không thể xóa vĩnh viễn: màu đang có sản phẩm sử dụng', 'error'),
  })

  const restoreMutation = useMutation({
    mutationFn: (color: ColorDto) => adminRestoreColor(color.id, { code: color.code, name: color.name, nameEn: color.nameEn ?? '', active: true }),
    onSuccess:  () => { queryClient.invalidateQueries({ queryKey: ['admin', 'colors'] }); toast('Đã khôi phục màu') },
    onError:    (err: AxiosError<ApiResponse<null>>) => toast(err.response?.data?.message ?? 'Khôi phục thất bại', 'error'),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm màu sắc mới</h2>

        <div className="flex items-end gap-3">
          <Input
            label="Mã màu hex"
            value={form.code}
            placeholder="#FF0000"
            onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
          />

          {form.code && /^#[0-9A-Fa-f]{3,6}$/.test(form.code) && (
            <div
              className="w-10 h-10 rounded border border-brand-light mb-0.5 flex-shrink-0"
              style={{ backgroundColor: form.code }}
            />
          )}
        </div>

        <Input
          label="Tên màu (tiếng Việt)"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />

        <Input
          label="Tên màu (tiếng Anh, tuỳ chọn)"
          value={form.nameEn}
          onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
        />

        <Button
          loading={createMutation.isPending}
          disabled={!form.code || !form.name}
          onClick={() => createMutation.mutate()}
          className="self-start"
        >
          Tạo màu
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">Danh sách màu</h2>

        {isLoading ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col gap-2">
            {(colors ?? []).map((color) => (
              <li
                key={color.id}
                className={`flex items-center justify-between py-3 px-4 border border-brand-light${!color.active ? ' opacity-50 bg-red-50/30' : ''}`}
              >
                {editColor?.id === color.id ? (
                  <div className="flex items-center gap-2 flex-1 mr-3">
                    <div
                      className="w-8 h-8 rounded border border-brand-light flex-shrink-0"
                      style={{ backgroundColor: editColor.code }}
                    />

                    <input
                      value={editColor.name}
                      onChange={(e) =>
                        setEditColor((c) => c && { ...c, name: e.target.value })
                      }
                      className="flex-1 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black"
                      placeholder="Tên màu"
                    />

                    <button
                      onClick={() => updateMutation.mutate(editColor!)}
                      className="text-xs text-brand-gold uppercase tracking-wider hover:text-brand-black"
                    >
                      Lưu
                    </button>

                    <button
                      onClick={() => setEditColor(null)}
                      className="text-xs text-brand-mid uppercase tracking-wider hover:text-brand-black"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div
                      className="w-6 h-6 rounded-full border border-brand-light"
                      style={{ backgroundColor: color.code }}
                    />

                    <div>
                      <p className={`font-medium text-sm${!color.active ? ' line-through text-brand-mid' : ''}`}>
                        {color.name}
                        {color.nameEn && (
                          <span className="text-brand-mid"> ({color.nameEn})</span>
                        )}
                      </p>
                      <p className="text-xs font-mono text-brand-mid">{color.code}</p>
                    </div>

                    {!color.active && <Badge variant="error">Inactive</Badge>}
                  </div>
                )}

                {editColor?.id !== color.id && (
                  <div className="flex items-center gap-3">
                    {color.active ? (
                      <>
                        <button
                          onClick={() => setEditColor(color)}
                          className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => { if (confirm(`Vô hiệu hoá màu "${color.name}"?`)) deleteMutation.mutate(color.id) }}
                          className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                        >
                          Xóa
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => { if (confirm(`Khôi phục màu "${color.name}"?`)) restoreMutation.mutate(color) }}
                          className="text-[10px] text-green-600 hover:text-green-800 uppercase tracking-wider transition-colors"
                        >
                          Khôi phục
                        </button>
                        <button
                          onClick={() => { if (confirm(`Xóa vĩnh viễn màu "${color.name}"? Hành động này không thể hoàn tác.`)) hardDeleteMutation.mutate(color.id) }}
                          className="text-[10px] text-red-700 hover:text-red-900 uppercase tracking-wider transition-colors"
                        >
                          Xóa vĩnh viễn
                        </button>
                      </>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}