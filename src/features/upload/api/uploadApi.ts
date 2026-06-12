import { apiClient } from '@shared/api/client'
import type { ApiResponse } from '@shared/types'

export interface UploadResponse {
  url:         string
  filename:    string
  size:        number
  contentType: string
}

/**
 * Upload ảnh lên MinIO qua backend.
 * POST /api/v1/upload/image (Admin only)
 * @param file  - File ảnh (JPEG/PNG/WebP/GIF, max 5MB)
 * @param folder - Subfolder trong bucket (default: "products")
 * @returns     UploadResponse với url để lưu vào DB
 */
export async function uploadImage(
  file: File,
  folder = 'products',
  onProgress?: (percent: number) => void,
): Promise<UploadResponse> {
  const form = new FormData()
  form.append('file', file)
  form.append('folder', folder)

  const res = await apiClient.post<ApiResponse<UploadResponse>>(
    '/upload/image',
    form,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (evt) => {
        if (onProgress && evt.total) {
          onProgress(Math.round((evt.loaded * 100) / evt.total))
        }
      },
    },
  )
  return res.data.data
}
