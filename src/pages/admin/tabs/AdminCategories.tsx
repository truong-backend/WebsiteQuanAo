import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from '@shared/lib'
import { Button, Input, Select, Spinner } from '@shared/ui'
import { fetchCategories } from '@features/catalog/api/catalogApi'
import {
  adminCreateCategory, adminUpdateCategory, adminDeleteCategory,
  adminRestoreCategory, adminHardDeleteCategory,
} from '@features/admin/api/adminApi'
import type { AxiosError } from 'axios'
import type { ApiResponse } from '@shared/types'

export function AdminCategories() {
  const queryClient = useQueryClient()
  const [newName, setNewName]               = useState('')
  const [newParent, setNewParent]           = useState('')
  const [editingId, setEditingId]           = useState<number | null>(null)
  const [editingName, setEditingName]       = useState('')
  const [editingParentId, setEditingParentId] = useState<string>('')
  const [includeDeleted, setIncludeDeleted] = useState(false)

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin', 'categories', includeDeleted],
    queryFn:  () => fetchCategories(includeDeleted ? { includeDeleted: true } : undefined),
  })

  const safeCategories = categories ?? []

  const createMutation = useMutation({
    mutationFn: () => adminCreateCategory({
      categoryName: newName,
      parentCategoryId: newParent ? Number(newParent) : null,
    }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast('Đã tạo danh mục')
      setNewName('')
      setNewParent('')
    },

    onError: () => toast('Tạo thất bại', 'error'),
  })

  const updateMutation = useMutation({
    mutationFn: (params: {
      id: number
      name: string
      parentId?: number | null
    }) =>
      adminUpdateCategory(params.id, {
        categoryName: params.name,
        parentCategoryId: params.parentId ?? null,
      }),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast('Đã cập nhật')
      setEditingId(null)
      setEditingName('')
      setEditingParentId('')
    },

    onError: () => toast('Cập nhật thất bại', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: adminDeleteCategory,

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast('Đã xóa')
    },

    onError: (err: AxiosError<ApiResponse<null>>) =>
      toast(
        err.response?.data?.message ??
          'Không thể xóa: danh mục đang có sản phẩm sử dụng',
        'error'
      ),
  })

  const restoreMutation = useMutation({
    mutationFn: (id: number) => adminRestoreCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast('Đã khôi phục danh mục')
    },

    onError: () => toast('Khôi phục thất bại', 'error'),
  })

  const hardDeleteMutation = useMutation({
    mutationFn: (id: number) => adminHardDeleteCategory(id),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] })
      toast('Đã xóa vĩnh viễn')
    },

    onError: (err: AxiosError<ApiResponse<null>>) =>
      toast(
        err.response?.data?.message ??
          'Không thể xóa vĩnh viễn: danh mục còn sản phẩm sử dụng',
        'error'
      ),
  })

  const rootCatOptions = [
    { value: '', label: 'Không có (danh mục gốc)' },
    ...safeCategories
      .filter((c) => !c.deleted)
      .map((c) => ({
        value: String(c.categoryId),
        label: c.categoryName,
      })),
  ]

  const renderActions = (cat: {
    categoryId: number
    categoryName: string
    deleted: boolean
    parentCategoryId?: number | null
  }) => {
    if (cat.deleted) {
      return (
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (confirm(`Khôi phục "${cat.categoryName}"?`)) {
                restoreMutation.mutate(cat.categoryId)
              }
            }}
            className="text-[10px] text-green-600 uppercase"
          >
            Khôi phục
          </button>

          <button
            onClick={() => {
              if (confirm(`Xóa vĩnh viễn "${cat.categoryName}"?`)) {
                hardDeleteMutation.mutate(cat.categoryId)
              }
            }}
            className="text-[10px] text-red-700 uppercase"
          >
            Xóa vĩnh viễn
          </button>
        </div>
      )
    }

    return (
      <div className="flex items-center gap-3">
        <button
          onClick={() => {
            setEditingId(cat.categoryId)
            setEditingName(cat.categoryName)
            setEditingParentId(
              cat.parentCategoryId
                ? String(cat.parentCategoryId)
                : ''
            )
          }}
          className="text-xs text-brand-mid uppercase"
        >
          Sửa
        </button>

        <button
          onClick={() => {
            if (confirm(`Xóa "${cat.categoryName}"?`)) {
              deleteMutation.mutate(cat.categoryId)
            }
          }}
          className="text-xs text-red-500 uppercase"
        >
          Xóa
        </button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      <div className="flex flex-col gap-5 p-6 bg-brand-cream">
        <h2 className="font-display text-2xl">
          Thêm danh mục mới
        </h2>

        <Input
          label="Tên danh mục"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <Select
          label="Danh mục cha"
          value={newParent}
          options={rootCatOptions}
          onChange={(e) => setNewParent(e.target.value)}
        />

        <Button
          loading={createMutation.isPending}
          disabled={!newName.trim()}
          onClick={() => createMutation.mutate()}
        >
          Tạo danh mục
        </Button>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">
            Danh sách danh mục
          </h2>

          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={includeDeleted}
              onChange={(e) =>
                setIncludeDeleted(e.target.checked)
              }
            />
            Hiển thị đã xóa
          </label>
        </div>

        {isLoading ? (
          <Spinner />
        ) : (
          <ul className="flex flex-col gap-2">
            {safeCategories.map((cat) => (
              <li key={cat.categoryId}>
                <div className="flex justify-between border p-3">
                  <div className="flex-1">
                    {editingId === cat.categoryId &&
                    !cat.deleted ? (
                      <div className="flex gap-2">
                        <Input
                          value={editingName}
                          onChange={(e) =>
                            setEditingName(e.target.value)
                          }
                        />

                        <Select
                          value={editingParentId}
                          options={rootCatOptions}
                          onChange={(e) =>
                            setEditingParentId(e.target.value)
                          }
                        />

                        <Button
                          loading={updateMutation.isPending}
                          onClick={() =>
                            updateMutation.mutate({
                              id: cat.categoryId,
                              name: editingName,
                              parentId: editingParentId
                                ? Number(editingParentId)
                                : null,
                            })
                          }
                        >
                          Lưu
                        </Button>

                        <Button
                          variant="ghost"
                          onClick={() => setEditingId(null)}
                        >
                          Hủy
                        </Button>
                      </div>
                    ) : (
                      <p className={cat.deleted ? 'line-through' : ''}>
                        {cat.categoryName}
                      </p>
                    )}
                  </div>

                  {editingId !== cat.categoryId &&
                    renderActions(cat)}
                </div>

                {Array.isArray(cat.childCategories) &&
                  cat.childCategories.length > 0 && (
                    <ul className="flex flex-col gap-1 ml-6 mt-1">
                      {cat.childCategories
                        .filter(
                          (child) =>
                            includeDeleted || !child.deleted
                        )
                        .map((child) => (
                          <li key={child.categoryId}>
                            <div className="flex justify-between border border-dashed p-3 bg-brand-cream/50">
                              <div className="flex-1">
                                {editingId === child.categoryId &&
                                !child.deleted ? (
                                  <div className="flex gap-2">
                                    <Input
                                      value={editingName}
                                      onChange={(e) =>
                                        setEditingName(
                                          e.target.value
                                        )
                                      }
                                    />

                                    <Select
                                      value={editingParentId}
                                      options={rootCatOptions}
                                      onChange={(e) =>
                                        setEditingParentId(
                                          e.target.value
                                        )
                                      }
                                    />

                                    <Button
                                      loading={
                                        updateMutation.isPending
                                      }
                                      onClick={() =>
                                        updateMutation.mutate({
                                          id: child.categoryId,
                                          name: editingName,
                                          parentId:
                                            editingParentId
                                              ? Number(
                                                  editingParentId
                                                )
                                              : null,
                                        })
                                      }
                                    >
                                      Lưu
                                    </Button>

                                    <Button
                                      variant="ghost"
                                      onClick={() =>
                                        setEditingId(null)
                                      }
                                    >
                                      Hủy
                                    </Button>
                                  </div>
                                ) : (
                                  <p
                                    className={`text-sm ${
                                      child.deleted
                                        ? 'line-through text-gray-400'
                                        : ''
                                    }`}
                                  >
                                    └ {child.categoryName}
                                  </p>
                                )}
                              </div>

                              {editingId !== child.categoryId &&
                                renderActions(child)}
                            </div>
                          </li>
                        ))}
                    </ul>
                  )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}