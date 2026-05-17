import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast, cn } from '@shared/lib'
import { Button, Badge, Input, Spinner } from '@shared/ui'
import {
  fetchAllSizes,
  adminCreateSize,
  adminUpdateSize,
  adminDeleteSize,
  adminRestoreSize,
  adminHardDeleteSize,
} from '@features/admin/api/adminApi'
import type { SizeDto } from '@shared/types'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@shared/api/client'

export function AdminSizes() {
  const queryClient = useQueryClient()
  const [form, setForm]         = useState({ code: '', name: '', sortOrder: '0' })
  const [editSize, setEditSize] = useState<SizeDto | null>(null)

  const { data: sizes, isLoading } = useQuery({
    queryKey: ['admin', 'sizes'],
    queryFn: fetchAllSizes,
  })

  const createMutation = useMutation({
    mutationFn: () =>
      adminCreateSize({
        code: form.code,
        name: form.name,
        sortOrder: Number(form.sortOrder),
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] })
      toast('Đã tạo size')
      setForm({ code: '', name: '', sortOrder: '0' })
    },

    onError: (err: AxiosError<ApiResponse<null>>) =>
      toast(err.response?.data?.message ?? 'Tạo thất bại', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: (s: SizeDto) =>
      adminUpdateSize(s.id, {
        code: s.code,
        name: s.name,
        sortOrder: s.sortOrder,
        active: s.active,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] })
      toast('Đã cập nhật size')
      setEditSize(null)
    },

    onError: (err: AxiosError<ApiResponse<null>>) =>
      toast(err.response?.data?.message ?? 'Cập nhật thất bại', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteSize,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] })
      toast('Đã vô hiệu hoá size')
    },

    onError: (err: AxiosError<ApiResponse<null>>) =>
      toast(
        err.response?.data?.message ??
          'Không thể xóa: kích cỡ đang có sản phẩm sử dụng',
        'error'
      ),
  })

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => adminHardDeleteSize(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] })
      toast('Đã xóa vĩnh viễn size')
    },

    onError: (err: AxiosError<ApiResponse<null>>) =>
      toast(
        err.response?.data?.message ??
          'Không thể xóa vĩnh viễn: kích cỡ đang có sản phẩm sử dụng',
        'error'
      ),
  })

  const restoreMutation = useMutation({
    mutationFn: (size: SizeDto) =>
      adminRestoreSize(size.id, {
        code: size.code,
        name: size.name,
        sortOrder: size.sortOrder,
        active: true,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'sizes'] })
      toast('Đã khôi phục size')
    },

    onError: (err: AxiosError<ApiResponse<null>>) =>
      toast(err.response?.data?.message ?? 'Khôi phục thất bại', 'error'),
  })

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">Thêm kích cỡ mới</h2>

        <Input
          label="Mã size (VD: S, M, L, XL)"
          value={form.code}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              code: e.target.value.toUpperCase(),
            }))
          }
        />

        <Input
          label="Tên size"
          value={form.name}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              name: e.target.value,
            }))
          }
        />

        <Input
          label="Thứ tự hiển thị"
          type="number"
          value={form.sortOrder}
          onChange={(e) =>
            setForm((f) => ({
              ...f,
              sortOrder: e.target.value,
            }))
          }
        />

        <Button
          loading={createMutation.isPending}
          disabled={!form.code || !form.name}
          onClick={() => createMutation.mutate()}
          className="self-start"
        >
          Tạo size
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="font-display text-2xl">
          Danh sách kích cỡ
        </h2>

        {isLoading ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col gap-2">
            {(sizes ?? [])
              .sort((a, b) => a.sortOrder - b.sortOrder)
              .map((size) => (
                <li
                  key={size.id}
                  className={cn(
                    'flex items-center justify-between py-3 px-4 border border-brand-light',
                    !size.active && 'opacity-50 bg-red-50/30'
                  )}
                >
                  {editSize?.id === size.id ? (
                    <div className="flex items-center gap-2 flex-1 mr-3">
                      <span className="w-10 h-10 border border-brand-mid flex items-center justify-center text-xs font-bold flex-shrink-0">
                        {editSize.code}
                      </span>

                      <input
                        value={editSize.name}
                        onChange={(e) =>
                          setEditSize((s) =>
                            s && {
                              ...s,
                              name: e.target.value,
                            }
                          )
                        }
                        className="flex-1 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black"
                        placeholder="Tên size"
                      />

                      <input
                        type="number"
                        value={editSize.sortOrder}
                        onChange={(e) =>
                          setEditSize((s) =>
                            s && {
                              ...s,
                              sortOrder: Number(e.target.value),
                            }
                          )
                        }
                        className="w-16 border border-brand-light px-2 py-1 text-sm focus:outline-none focus:border-brand-black"
                      />

                      <button
                        onClick={() => updateMutation.mutate(editSize!)}
                        className="text-xs text-brand-gold uppercase tracking-wider hover:text-brand-black"
                      >
                        Lưu
                      </button>

                      <button
                        onClick={() => setEditSize(null)}
                        className="text-xs text-brand-mid uppercase tracking-wider hover:text-brand-black"
                      >
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'w-10 h-10 border flex items-center justify-center text-sm font-medium',
                          !size.active
                            ? 'border-brand-light text-brand-mid'
                            : 'border-brand-mid'
                        )}
                      >
                        {size.code}
                      </span>

                      <div>
                        <p
                          className={cn(
                            'font-medium text-sm',
                            !size.active &&
                              'line-through text-brand-mid'
                          )}
                        >
                          {size.name}
                        </p>

                        <p className="text-xs text-brand-mid">
                          Thứ tự: {size.sortOrder}
                        </p>
                      </div>

                      {!size.active && (
                        <Badge variant="error">
                          Inactive
                        </Badge>
                      )}
                    </div>
                  )}

                  {editSize?.id !== size.id && (
                    <div className="flex items-center gap-3">
                      {size.active ? (
                        <>
                          <button
                            onClick={() => setEditSize(size)}
                            className="text-xs uppercase tracking-wider text-brand-mid hover:text-brand-black transition-colors"
                          >
                            Sửa
                          </button>

                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Vô hiệu hoá size "${size.code}"?`
                                )
                              ) {
                                deleteMutation.mutate(size.id)
                              }
                            }}
                            className="text-xs text-red-500 hover:text-red-700 uppercase tracking-wider transition-colors"
                          >
                            Xóa
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Khôi phục size "${size.code}"?`
                                )
                              ) {
                                restoreMutation.mutate(size)
                              }
                            }}
                            className="text-[10px] text-green-600 hover:text-green-800 uppercase tracking-wider transition-colors"
                          >
                            Khôi phục
                          </button>

                          <button
                            onClick={() => {
                              if (
                                confirm(
                                  `Xóa vĩnh viễn size "${size.code}"? Hành động này không thể hoàn tác.`
                                )
                              ) {
                                hardDeleteMutation.mutate(size.id)
                              }
                            }}
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